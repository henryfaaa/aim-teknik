// backend/routes/ownerRoutes.js
import express from "express";
import pool from "../config/db.js";
import requireAuth, { requireRole } from "../middlewares/authMiddleware.js";
import { saveBase64ToFile } from "../controllers/userController.js"; // ⬅️ Reuse helper
import bcrypt from "bcryptjs";

const router = express.Router();

/* =======================================================
 * ✅ GET /api/owner/me — Ambil profil owner
 * ======================================================= */
router.get("/me", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, name, email, phone, address, avatar, role FROM users WHERE id = ? AND role = 'owner'",
      [req.user.id]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, error: "Owner tidak ditemukan." });

    const user = rows[0];
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar || "/user.png",
      role: user.role,
    });
  } catch (err) {
    console.error("GET /owner/me ERR:", err);
    res.status(500).json({ success: false, error: "Gagal memuat profil owner." });
  }
});

/* =======================================================
 * ✅ PUT /api/owner/me — Update profil owner
 * ======================================================= */
router.put("/me", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const { name, email, avatarBase64 } = req.body || {};
    const [rows] = await pool.query(
      "SELECT id, name, email, avatar FROM users WHERE id = ? AND role = 'owner'",
      [req.user.id]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, error: "Owner tidak ditemukan." });

    let avatarPath = rows[0].avatar;
    if (avatarBase64) {
      const p = saveBase64ToFile(
        avatarBase64,
        "avatars",
        `${req.user.id}-${Date.now()}`
      );
      if (p) avatarPath = p;
    }

    const newName = name ?? rows[0].name;
    const newEmail = email ?? rows[0].email;

    await pool.query(
      "UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ? AND role = 'owner'",
      [newName, newEmail, avatarPath, req.user.id]
    );

    res.json({
      success: true,
      message: "Profil owner berhasil diperbarui.",
      id: req.user.id,
      name: newName,
      email: newEmail,
      avatar: avatarPath,
    });
  } catch (err) {
    console.error("PUT /owner/me ERR:", err);
    res.status(500).json({ success: false, error: "Gagal memperbarui profil owner." });
  }
});

/* =======================================================
 * ✅ POST /api/owner/me/change-password — Ganti password
 * ======================================================= */
router.post("/me/change-password", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword)
      return res.status(400).json({
        success: false,
        error: "Field password lama dan baru wajib diisi.",
      });

    const [rows] = await pool.query(
      "SELECT password FROM users WHERE id = ? AND role = 'owner'",
      [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, error: "Owner tidak ditemukan." });

    const match = await bcrypt.compare(currentPassword, rows[0].password);
    if (!match)
      return res.status(400).json({ success: false, error: "Password lama salah." });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ? AND role = 'owner'", [
      hash,
      req.user.id,
    ]);

    res.json({ success: true, message: "Password owner berhasil diganti." });
  } catch (err) {
    console.error("POST /owner/me/change-password ERR:", err);
    res.status(500).json({ success: false, error: "Gagal mengganti password owner." });
  }
});

/* =======================================================
 * ✅ GET /api/owner/users — Daftar admin
 * ======================================================= */
router.get("/users", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, name, phone, address, role FROM users WHERE role = 'admin'"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /owner/users ERR:", err);
    res.status(500).json({ success: false, error: "Gagal mengambil data admin." });
  }
});

/* =======================================================
 * ✅ PUT /api/owner/users/:id — Update admin
 * ======================================================= */
router.put("/users/:id", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const { username, name, email, phone, address } = req.body;
    await pool.query(
      "UPDATE users SET username=?, name=?, email=?, phone=?, address=? WHERE id=? AND role='admin'",
      [username, name, email, phone, address, req.params.id]
    );
    res.json({ success: true, message: "Data admin berhasil diperbarui." });
  } catch (err) {
    console.error("PUT /owner/users/:id ERR:", err);
    res.status(500).json({ success: false, error: "Gagal memperbarui admin." });
  }
});

/* =======================================================
 * ✅ DELETE /api/owner/users/:id — Hapus admin
 * ======================================================= */
router.delete("/users/:id", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = ? AND role = 'admin'", [
      req.params.id,
    ]);
    res.json({ success: true, message: "Admin berhasil dihapus." });
  } catch (err) {
    console.error("DELETE /owner/users/:id ERR:", err);
    res.status(500).json({ success: false, error: "Gagal menghapus admin." });
  }
});

/* =======================================================
 * ✅ GET /api/owner/laporan — Lihat laporan pekerjaan
 * ======================================================= */
router.get("/laporan", requireAuth, requireRole("owner"), async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.nama_toko,
        p.tanggal,
        p.total_harga,
        p.status_cair,
        b.no_ba_opname AS ba_opname_no
      FROM pekerjaan p
      LEFT JOIN ba_opname b ON p.id = b.id_pekerjaan
      ORDER BY p.tanggal DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /owner/laporan ERR:", err);
    res.status(500).json({ success: false, error: "Gagal mengambil laporan pekerjaan." });
  }
});

export default router;

