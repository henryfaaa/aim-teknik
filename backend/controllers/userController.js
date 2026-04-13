import path from "path";
import fs from "fs";
import { Buffer } from "buffer";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, "..", "uploads");

// Helper: simpan base64 image ke file
function saveBase64ToFile(base64Str, dir, nameBase) {
  const m = /^data:(image\/[\w.+-]+);base64,(.+)$/.exec(base64Str || "");
  if (!m) return null;
  const ext = m[1].split("/")[1]; // png|jpeg|webp|heic ...
  const buf = Buffer.from(m[2], "base64");
  const folder = path.join(uploadsRoot, dir);
  fs.mkdirSync(folder, { recursive: true });
  const filename = `${nameBase}.${ext}`;
  fs.writeFileSync(path.join(folder, filename), buf);
  return `/uploads/${dir}/${filename}`; // inilah path yang disimpan di DB
}

/* ============================
 * GET ME (profil user aktif)
 * ============================ */
export async function getMe(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, email, name, avatar, role FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const user = rows[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar || "/user.png",
      role: user.role || "admin", // tambahkan role agar frontend tau jenis akun
    });
  } catch (e) {
    console.error("GETME ERR:", e);
    res.status(500).json({ message: "Server error" });
  }
}

/* ============================
 * UPDATE PROFIL
 * ============================ */
export async function updateMe(req, res) {
  try {
    const { name, email, avatarBase64 } = req.body || {};
    const [rows] = await pool.query(
      "SELECT id, username, email, name, avatar FROM users WHERE id = ?",
      [req.user.id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

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
      "UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?",
      [newName, newEmail, avatarPath, req.user.id]
    );

    res.json({
      id: req.user.id,
      username: rows[0].username,
      name: newName,
      email: newEmail,
      avatar: avatarPath,
    });
  } catch (e) {
    console.error("UPDATEME ERR:", e);
    res.status(500).json({ message: "Server error" });
  }
}

/* ============================
 * GANTI PASSWORD
 * ============================ */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Field password saat ini dan baru wajib diisi" });
    }

    const [rows] = await pool.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const ok = await bcrypt.compare(currentPassword, rows[0].password);
    if (!ok)
      return res.status(400).json({ message: "Password saat ini salah" });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hash,
      req.user.id,
    ]);

    res.json({ message: "Password berhasil diganti" });
  } catch (e) {
    console.error("CHANGEPASSWORD ERR:", e);
    res.status(500).json({ message: "Server error" });
  }
}

export { saveBase64ToFile };
