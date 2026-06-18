import { Router } from "express";
import { signup, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Public
router.post("/signup", signup);
router.post("/login",  login);

// Protected
router.get("/me", protect, getMe);

export default router;
