const express = require("express");
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUser } = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// All user management routes require ADMIN role
router.use(authenticate, authorize("ADMIN"));

// GET /api/users - List all users (with optional ?role= and ?status= filters)
router.get("/", getAllUsers);

// GET /api/users/:id - Get a single user
router.get("/:id", getUserById);

// PATCH /api/users/:id - Update user role or status
router.patch("/:id", updateUser);

// DELETE /api/users/:id - Delete a user
router.delete("/:id", deleteUser);

module.exports = router;
