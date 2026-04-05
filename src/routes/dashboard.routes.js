const express = require("express");
const router = express.Router();
const {
  getSummary,
  getCategoryTotals,
  getMonthlyTrends,
  getWeeklyTrends,
} = require("../controllers/dashboard.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// All dashboard routes require authentication
// Viewer can only see the summary; Analyst and Admin see everything
router.use(authenticate);

// GET /api/dashboard/summary - All roles (data scoped by role)
router.get("/summary", authorize("VIEWER", "ANALYST", "ADMIN"), getSummary);

// GET /api/dashboard/category-totals - Analyst and Admin
router.get("/category-totals", authorize("ANALYST", "ADMIN"), getCategoryTotals);

// GET /api/dashboard/monthly-trends?year=2024 - Analyst and Admin
router.get("/monthly-trends", authorize("ANALYST", "ADMIN"), getMonthlyTrends);

// GET /api/dashboard/weekly-trends - Analyst and Admin
router.get("/weekly-trends", authorize("ANALYST", "ADMIN"), getWeeklyTrends);

module.exports = router;
