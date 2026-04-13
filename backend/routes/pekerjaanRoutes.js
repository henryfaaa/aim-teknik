import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ctrl from "../controllers/pekerjaanController.js";

const router = express.Router();

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// samain dengan server.js: backend/uploads
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB/file
});

// terima 2 varian nama field: with [] dan tanpa []
const fileFields = upload.fields([
  { name: "beforeFiles[]" },
  { name: "afterFiles[]" },
  { name: "beforeFiles" },
  { name: "afterFiles" },
]);

// ===== Routes =====
router.get("/", ctrl.list);

// ✅ bulk export WA (taruh sebelum /:id)
router.post("/export-wa-bulk", ctrl.exportWABulk);

router.get("/:id", ctrl.detail);
router.post("/", fileFields, ctrl.create);
router.put("/:id", fileFields, ctrl.update);
router.delete("/:id", ctrl.remove);
router.delete("/:id/foto/:fotoId", ctrl.removePhoto);

router.post("/:id/export-wa", ctrl.exportWAOne);

export default router;
