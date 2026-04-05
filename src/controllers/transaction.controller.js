const prisma = require("../utils/prisma");
const { validateTransaction } = require("../validators");

// GET /api/transactions
// Viewer, Analyst, Admin - with filters and pagination
async function getAllTransactions(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const where = { isDeleted: false };

  if (req.query.type) {
    const validTypes = ["INCOME", "EXPENSE"];
    if (!validTypes.includes(req.query.type)) {
      return res.status(400).json({ error: "Type must be INCOME or EXPENSE." });
    }
    where.type = req.query.type;
  }

  if (req.query.category) {
    where.category = { contains: req.query.category, mode: "insensitive" };
  }

  if (req.query.startDate || req.query.endDate) {
    where.date = {};
    if (req.query.startDate) {
      where.date.gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      where.date.lte = new Date(req.query.endDate);
    }
  }

  // Viewers and analysts can only see their own transactions
  // Admins can see all
  if (req.user.role !== "ADMIN") {
    where.userId = req.user.id;
  }

  try {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get transactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
}

// GET /api/transactions/:id
async function getTransactionById(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid transaction ID." });
  }

  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id, isDeleted: false },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Non-admins can only see their own transactions
    if (req.user.role !== "ADMIN" && transaction.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json({ transaction });
  } catch (err) {
    console.error("Get transaction error:", err);
    res.status(500).json({ error: "Failed to fetch transaction." });
  }
}

// POST /api/transactions
// Admin only
async function createTransaction(req, res) {
  const errors = validateTransaction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { amount, type, category, date, notes, userId } = req.body;

  // Admin can create for any user; use their own ID if not specified
  const targetUserId = userId ? parseInt(userId) : req.user.id;

  try {
    // Verify target user exists if a different userId was given
    if (targetUserId !== req.user.id) {
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) {
        return res.status(404).json({ error: "Target user not found." });
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        category: category.trim(),
        date: new Date(date),
        notes: notes ? notes.trim() : null,
        userId: targetUserId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ message: "Transaction created.", transaction });
  } catch (err) {
    console.error("Create transaction error:", err);
    res.status(500).json({ error: "Failed to create transaction." });
  }
}

// PATCH /api/transactions/:id
// Admin only
async function updateTransaction(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid transaction ID." });
  }

  try {
    // Check transaction exists
    const existing = await prisma.transaction.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    const { amount, type, category, date, notes } = req.body;
    const updateData = {};

    if (amount !== undefined) {
      if (isNaN(amount) || Number(amount) <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number." });
      }
      updateData.amount = parseFloat(amount);
    }

    if (type !== undefined) {
      if (!["INCOME", "EXPENSE"].includes(type)) {
        return res.status(400).json({ error: "Type must be INCOME or EXPENSE." });
      }
      updateData.type = type;
    }

    if (category !== undefined) {
      if (category.trim().length < 2) {
        return res.status(400).json({ error: "Category must be at least 2 characters." });
      }
      updateData.category = category.trim();
    }

    if (date !== undefined) {
      if (isNaN(Date.parse(date))) {
        return res.status(400).json({ error: "Invalid date." });
      }
      updateData.date = new Date(date);
    }

    if (notes !== undefined) {
      updateData.notes = notes ? notes.trim() : null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ message: "Transaction updated.", transaction });
  } catch (err) {
    console.error("Update transaction error:", err);
    res.status(500).json({ error: "Failed to update transaction." });
  }
}

// DELETE /api/transactions/:id
// Admin only - soft delete
async function deleteTransaction(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid transaction ID." });
  }

  try {
    const existing = await prisma.transaction.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return res.status(404).json({ error: "Transaction not found." });
    }

    // Soft delete - mark as deleted instead of removing
    await prisma.transaction.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: "Transaction deleted successfully." });
  } catch (err) {
    console.error("Delete transaction error:", err);
    res.status(500).json({ error: "Failed to delete transaction." });
  }
}

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
