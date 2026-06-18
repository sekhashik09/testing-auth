import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";

// POST /api/auth/signup
export const signup = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, "Email is already registered.");
    }

    const user = await User.create({ name, email, password, phone, address });

    const token = generateToken(user._id);

    return sendSuccess(res, 201, "Account created successfully.", {
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Email and password are required.");
    }

    // Explicitly select password (it's hidden by default)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, "Invalid email or password.");
    }

    if (!user.isActive) {
      return sendError(res, 401, "Your account has been deactivated.");
    }

    const token = generateToken(user._id);

    // Don't send password in response
    user.password = undefined;

    return sendSuccess(res, 200, "Login successful.", { token, user });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  return sendSuccess(res, 200, "Profile fetched successfully.", {
    user: req.user,
  });
};
