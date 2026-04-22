  // backend/controllers/authController.js
  import pool from "../config/db.js";
  import bcrypt from "bcryptjs";
  import nodemailer from "nodemailer";
  import crypto from "crypto";
  import jwt from "jsonwebtoken";

  // ==================================================
  // Helper: bentuk data user yang aman dikirim ke frontend
  // ==================================================
  function shapeUser(row) {
    return {
      id: row.id,
      username: row.username,
      email: row.email || null,
      name: row.name,
      avatar: row.avatar || "/user.png",
      role: row.role || "admin",
      phone: row.phone || "",
      address: row.address || "",
    };
  }

  // ==================================================
  // REGISTER USER
  // ==================================================
  export const register = async (req, res) => {
    try {
      const { username, email, password, name, avatar, role, phone, address } = req.body;

      if (!username || !email || !password || !name) {
        return res.status(400).json({
          success: false,
          error: "Semua field wajib diisi.",
        });
      }

      const [exist] = await pool.query(
        "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
        [username, email]
      );

      if (exist.length > 0) {
        return res.status(409).json({
          success: false,
          error: "Username atau email sudah digunakan.",
        });
      }

      const hashed = await bcrypt.hash(password, 10);
      const avatarPath = avatar || "/user.png";
      const userRole = role || "admin";

      await pool.query(
        `INSERT INTO users (username, email, password, name, avatar, role, phone, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, hashed, name, avatarPath, userRole, phone || "", address || ""]
      );

      return res.status(201).json({
        success: true,
        message: "Registrasi berhasil.",
      });
    } catch (e) {
      console.error("REGISTER ERR:", e);
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan server saat registrasi.",
      });
    }
  };


  // ==================================================
  // LOGIN ADMIN
  // ==================================================
  export const login = async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: "Username/Email dan password wajib diisi.",
        });
      }

      const [rows] = await pool.query(
        "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
        [username, username]
      );
      if (rows.length === 0)
        return res
          .status(401)
          .json({ success: false, error: "Akun tidak ditemukan." });

      const user = rows[0];

      // Pastikan hanya admin yang bisa lewat sini
      if (user.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, error: "Akses ditolak. Anda bukan admin." });
      }

      const ok = await bcrypt.compare(password, user.password);
      if (!ok)
        return res
          .status(401)
          .json({ success: false, error: "Password salah." });

      const token = jwt.sign(
        { id: user.id, role: "admin" },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "7d" }
      );

      const shaped = { ...shapeUser(user), role: "admin", token };

      return res.status(200).json({
        success: true,
        message: "Login admin berhasil.",
        user: shaped,
        token,
      });
    } catch (e) {
      console.error("LOGIN ADMIN ERR:", e);
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan server saat login.",
      });
    }
  };

  // ==================================================
  // LOGIN OWNER (hanya untuk role owner)
  // ==================================================
  export const loginOwner = async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: "Username dan password wajib diisi.",
        });
      }

      const [rows] = await pool.query(
        "SELECT * FROM users WHERE (username = ? OR email = ?) AND role = 'owner' LIMIT 1",
        [username, username]
      );

      if (rows.length === 0)
        return res
          .status(401)
          .json({ success: false, error: "Akun tidak ditemukan." });

      const user = rows[0];

      const ok = await bcrypt.compare(password, user.password);
      if (!ok)
        return res
          .status(401)
          .json({ success: false, error: "Password salah." });

      const token = jwt.sign(
        { id: user.id, role: "owner" },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "7d" }
      );

      const shaped = { ...shapeUser(user), role: "owner", token };

      return res.status(200).json({
        success: true,
        message: "Login owner berhasil.",
        user: shaped,
        token,
      });
    } catch (e) {
      console.error("LOGIN OWNER ERR:", e);
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan server saat login owner.",
      });
    }
  };

  // ==================================================
  // REQUEST RESET PASSWORD
  // ==================================================
  export const requestReset = async (req, res) => {
    try {
      const emailOrUsername = req.body?.email || req.body?.username;
      if (!emailOrUsername)
        return res
          .status(400)
          .json({ success: false, error: "Email/Username wajib diisi." });

      const [rows] = await pool.query(
        "SELECT id, username, email FROM users WHERE email = ? OR username = ? LIMIT 1",
        [emailOrUsername, emailOrUsername]
      );

      if (rows.length === 0)
        return res
          .status(404)
          .json({ success: false, error: "User tidak ditemukan." });

      const u = rows[0];
      const token = crypto.randomBytes(32).toString("hex");
      const expiredAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

      await pool.query(
        "UPDATE users SET reset_token = ?, token_expiry = ? WHERE id = ?",
        [token, expiredAt, u.id]
      );

      const resetUrl = `http://localhost:5173/reset/${token}`;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: `"AIM Teknik" <${process.env.EMAIL_USER}>`,
        to: u.email || process.env.EMAIL_USER,
        subject: "Reset Password AIM Teknik",
        html: `
          <h2>Reset Password</h2>
          <p>Halo <b>${u.username}</b>,</p>
          <p>Klik tombol berikut untuk mengatur ulang password Anda:</p>
          <p><a href="${resetUrl}" target="_blank" style="display:inline-block;padding:10px 16px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;">Reset Password</a></p>
          <p style="color:#666;">Link ini berlaku selama <b>15 menit</b>.</p>
        `,
      });

      return res.status(200).json({
        success: true,
        message: "Link reset password telah dikirim ke email Anda.",
      });
    } catch (e) {
      console.error("RESET REQUEST ERR:", e);
      return res.status(500).json({
        success: false,
        error: "Gagal mengirim link reset password.",
      });
    }
  };

  // ==================================================
  // RESET PASSWORD VIA TOKEN
  // ==================================================
  export const resetPasswordByToken = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!token || !password)
        return res
          .status(400)
          .json({ success: false, error: "Token dan password wajib diisi." });

      const [rows] = await pool.query(
        "SELECT id FROM users WHERE reset_token = ? AND token_expiry > NOW() LIMIT 1",
        [token]
      );

      if (rows.length === 0)
        return res
          .status(400)
          .json({ success: false, error: "Token tidak valid atau kadaluarsa." });

      const hashed = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?",
        [hashed, rows[0].id]
      );

      return res.status(200).json({
        success: true,
        message: "Password berhasil direset.",
      });
    } catch (e) {
      console.error("RESET BY TOKEN ERR:", e);
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan server saat reset password.",
      });
    }
  };
