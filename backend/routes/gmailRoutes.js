import express from "express";
import { authURL, gmailCallback } from "../controllers/gmailController.js";
import { syncBA } from "../controllers/baOpnameController.js";

const router = express.Router();

router.get("/auth", authURL);
router.get("/callback", gmailCallback);

// ⬇️ SATU-SATUNYA endpoint Gmail yg dipakai
router.post("/sync", syncBA);

export default router;
