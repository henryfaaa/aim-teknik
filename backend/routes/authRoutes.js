// src/routes/authRoutes.js
import express from "express";
import {
  login,                // untuk admin
  loginOwner,           // untuk owner
  register,
  requestReset,
  resetPasswordByToken,
} from "../controllers/authController.js";

const router = express.Router();

// Admin login
router.post("/login", login);

// Owner login (pakai endpoint berbeda)
router.post("/owner-login", loginOwner);

router.post("/register", register);
router.post("/reset-request", requestReset);
router.post("/reset/:token", resetPasswordByToken);

export default router;
