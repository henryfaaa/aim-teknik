// backend/routes/userRoutes.js
import { Router } from "express";
import requireAuth, { requireRole } from "../middlewares/authMiddleware.js";
import { getMe, updateMe, changePassword } from "../controllers/userController.js";
import pool from "../config/db.js";

const router = Router();

/* ====================================
   🔹 ROUTE KHUSUS ADMIN (role = admin)
==================================== */
router.get("/me", requireAuth, getMe);
router.put("/me", requireAuth, updateMe);
router.post("/me/change-password", requireAuth, changePassword);

/* ====================================
   🔹 ROUTE KHUSUS OWNER (manajemen admin)
==================================== */

// ✅ Ambil data admin berdasarkan ID
router.get("/:id", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, name, email, phone, address, role FROM users WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/users/:id ERR:", err);
    res.status(500).json({ message: "Gagal memuat data admin" });
  }
});

// ✅ Update data admin berdasarkan ID
router.put("/:id", requireAuth, requireRole("owner"), async (req, res) => {
  const { username, name, email, phone, address } = req.body;
  try {
    await pool.query(
      "UPDATE users SET username=?, name=?, email=?, phone=?, address=? WHERE id=?",
      [username, name, email, phone, address, req.params.id]
    );
    res.json({ message: "Data admin berhasil diperbarui" });
  } catch (err) {
    console.error("PUT /api/users/:id ERR:", err);
    res.status(500).json({ message: "Gagal memperbarui data admin" });
  }
});
// ✅ DELETE /api/users/:id
// Hapus admin by ID (khusus role owner)
router.delete("/:id", requireAuth, requireRole("owner"), async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, error: "Admin tidak ditemukan." });

    // Opsional: jangan sampai owner hapus dirinya sendiri
    if (rows[0].role === "owner")
      return res.status(400).json({ success: false, error: "Owner tidak boleh dihapus." });

    await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Admin berhasil dihapus." });
  } catch (err) {
    console.error("DELETE /api/users/:id ERR:", err);
    res.status(500).json({ success: false, error: "Gagal menghapus admin." });
  }
});

export default router;
   