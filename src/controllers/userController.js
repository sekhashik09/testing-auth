import User from "../models/User.js";
import { sendSuccess, sendError } from "../utils/response.js";

// ─── Self-service (any authenticated user) ────────────────────────────────────

// GET /api/users/me
export const getProfile = async (req, res) => {
  return sendSuccess(res, 200, "Profile fetched.", { user: req.user });
};

// PUT /api/users/me  – update own profile
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ["name", "phone", "address", "avatar"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, "No valid fields provided to update.");
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, 200, "Profile updated successfully.", { user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/me/password  – change own password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, "Current and new password are required.");
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.comparePassword(currentPassword))) {
      return sendError(res, 401, "Current password is incorrect.");
    }

    user.password = newPassword;
    await user.save(); // triggers pre-save hash

    return sendSuccess(res, 200, "Password changed successfully.");
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/me  – deactivate (soft-delete) own account
export const deleteMyAccount = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    return sendSuccess(res, 200, "Account deactivated successfully.");
  } catch (error) {
    next(error);
  }
};

// ─── Admin routes ─────────────────────────────────────────────────────────────

// GET /api/users  – list all users (admin)
export const getAllUsers = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === "true";
    }
    if (req.query.role) filter.role = req.query.role;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 200, "Users fetched.", {
      users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id  – get user by ID (admin)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, "User not found.");
    return sendSuccess(res, 200, "User fetched.", { user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id  – update any user (admin)
export const updateUser = async (req, res, next) => {
  try {
    const allowedFields = ["name", "phone", "address", "avatar", "role", "isActive"];
    const updates = {};
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, "No valid fields provided.");
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) return sendError(res, 404, "User not found.");

    return sendSuccess(res, 200, "User updated.", { user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id  – hard-delete a user (admin)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, 404, "User not found.");
    return sendSuccess(res, 200, "User permanently deleted.");
  } catch (error) {
    next(error);
  }
};
