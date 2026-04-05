const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { validateUserUpdate } = require("../validators");

// GET /api/users
// Admin only - list all users with pagination
async function getAllUsers(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Optional filters
  const { role, status } = req.query;
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;

  try {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
}

// GET /api/users/:id
// Admin only - get a single user
async function getUserById(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Failed to fetch user." });
  }
}

// PATCH /api/users/:id
// Admin only - update user role or status
async function updateUser(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID." });
  }

  const errors = validateUserUpdate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Prevent admin from deactivating themselves
  if (id === req.user.id && req.body.status === "INACTIVE") {
    return res.status(400).json({ error: "You cannot deactivate your own account." });
  }

  try {
    const { name, role, status } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    res.json({ message: "User updated successfully.", user });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found." });
    }
    console.error("Update user error:", err);
    res.status(500).json({ error: "Failed to update user." });
  }
}

// DELETE /api/users/:id
// Admin only - delete a user (hard delete)
async function deleteUser(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid user ID." });
  }

  // Prevent self-deletion
  if (id === req.user.id) {
    return res.status(400).json({ error: "You cannot delete your own account." });
  }

  try {
    // Delete user's transactions first to avoid foreign key errors
    await prisma.transaction.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted successfully." });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "User not found." });
    }
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user." });
  }
}

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
