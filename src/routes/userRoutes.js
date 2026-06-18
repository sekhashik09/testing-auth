import { Router } from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteMyAccount,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// All routes below require a valid JWT
router.use(protect);

// ── Self-service ──────────────────────────────────────────────────────────────
router.get("/me",               getProfile);
router.put("/me",               updateProfile);
router.put("/me/password",      changePassword);
router.delete("/me",            deleteMyAccount);

// ── Admin only ────────────────────────────────────────────────────────────────
router.get("/",         adminOnly, getAllUsers);
router.get("/:id",      adminOnly, getUserById);
router.put("/:id",      adminOnly, updateUser);
router.delete("/:id",   adminOnly, deleteUser);

export default router;
