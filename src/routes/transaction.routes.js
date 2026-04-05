const express = require("express");
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transaction.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// All transaction routes require authentication
router.use(authenticate);

// GET /api/transactions - All roles can list transactions (scoped by role)
// Supports ?type=, ?category=, ?startDate=, ?endDate=, ?page=, ?limit=
router.get("/", authorize("VIEWER", "ANALYST", "ADMIN"), getAllTransactions);

// GET /api/transactions/:id - All roles
router.get("/:id", authorize("VIEWER", "ANALYST", "ADMIN"), getTransactionById);

// POST /api/transactions - Admin only
router.post("/", authorize("ADMIN"), createTransaction);

// PATCH /api/transactions/:id - Admin only
router.patch("/:id", authorize("ADMIN"), updateTransaction);

// DELETE /api/transactions/:id - Admin only (soft delete)
router.delete("/:id", authorize("ADMIN"), deleteTransaction);

module.exports = router;
