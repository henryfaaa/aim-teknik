// backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";

export default function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token)
    return res.status(401).json({ success: false, error: "Unauthorized" });

  try {
    if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}
const payload = jwt.verify(token, process.env.JWT_SECRET);


    // token berisi { id, role }
    req.user = {
      id: payload.id,
      role: payload.role,
    };

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERR:", err);
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}

/**
 * ✅ Helper: batasi akses berdasarkan role
 *   contoh: router.get('/owner', requireAuth, requireRole('owner'), handler)
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, error: "Forbidden: role tidak diizinkan" });
    }

    next();
  };
}
