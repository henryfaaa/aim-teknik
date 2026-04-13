// backend/server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { syncBAFromGmail } from "./integrations/gmailBaSync.js";
import pekerjaanRoutes from "./routes/pekerjaanRoutes.js";
import baOpnameRoutes from "./routes/baOpnameRoutes.js";
import gmailAuthRoutes from "./routes/gmailAuthRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import pool, { assertDB } from "./config/db.js";
import ttfRoutes from "./routes/ttfRoutes.js";
import laporanRoutes from "./routes/laporanRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";

const app = express();

// ----- Middlewares -----
const FRONTEND = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// logger sederhana
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// >>> naikin limit supaya base64 avatar muat
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

// ----- Routes -----
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pekerjaan", pekerjaanRoutes);
app.use("/api/ba", baOpnameRoutes);
app.use("/api/gmail", gmailAuthRoutes);
app.use("/api/invoice", invoiceRoutes);
app.use("/api/ttf", ttfRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/owner", ownerRoutes);


// ----- Static -----
// pakai ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// serve file upload (mis. avatar) dari backend/uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----- Healthcheck -----
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/api/health/db", async (_req, res) => {
  try {
    const [r] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, db: r[0]?.ok === 1 });
  } catch (e) {
    console.error("DB health error:", e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ----- OAuth2 Callback (untuk ambil code manual) -----
app.get("/oauth2callback", (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code received.");

  console.log("=== AUTHORIZATION CODE ===");
  console.log(code);
  console.log("==========================");

  res.send("Kode berhasil diterima. Cek terminal kamu untuk lihat code.");
});



const HAS_RT = !!process.env.GOOGLE_REFRESH_TOKEN;
if (HAS_RT) {
  cron.schedule("*/5 * * * *", async () => {
    try {
      await syncBAFromGmail({ qDays: 45 });
    } catch (e) {
      console.error("cron sync BA failed:", e.message);
    }
  });
} else {
  console.warn("Cron dimatikan: GOOGLE_REFRESH_TOKEN belum di-set.");
}

// ----- Global Error Handler -----
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ ok: false, error: err.message || "Internal Server Error" });
});

// ----- Start -----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);

  setImmediate(() => {
    assertDB().catch((e) =>
      console.error("DB check failed:", e.message)
    );
  });
});

