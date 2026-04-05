const prisma = require("../utils/prisma");

// GET /api/dashboard/summary
// Returns totals, net balance, and recent activity
// Viewer, Analyst, Admin - but scope depends on role
async function getSummary(req, res) {
  // Admins see all data; others see only their own
  const userFilter = req.user.role === "ADMIN" ? {} : { userId: req.user.id };
  const baseWhere = { isDeleted: false, ...userFilter };

  try {
    // Get all non-deleted transactions matching filter
    const transactions = await prisma.transaction.findMany({
      where: baseWhere,
      orderBy: { date: "desc" },
    });

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((tx) => {
      if (tx.type === "INCOME") {
        totalIncome += tx.amount;
      } else {
        totalExpenses += tx.amount;
      }
    });

    const netBalance = totalIncome - totalExpenses;

    // Recent 5 transactions
    const recentActivity = transactions.slice(0, 5).map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date,
      notes: tx.notes,
    }));

    res.json({
      summary: {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        netBalance: parseFloat(netBalance.toFixed(2)),
        totalTransactions: transactions.length,
      },
      recentActivity,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard summary." });
  }
}

// GET /api/dashboard/category-totals
// Returns totals grouped by category
async function getCategoryTotals(req, res) {
  const userFilter = req.user.role === "ADMIN" ? {} : { userId: req.user.id };
  const baseWhere = { isDeleted: false, ...userFilter };

  try {
    const transactions = await prisma.transaction.findMany({
      where: baseWhere,
    });

    // Group by category and type
    const categoryMap = {};

    transactions.forEach((tx) => {
      const key = tx.category;
      if (!categoryMap[key]) {
        categoryMap[key] = { category: key, income: 0, expense: 0, total: 0 };
      }
      if (tx.type === "INCOME") {
        categoryMap[key].income += tx.amount;
      } else {
        categoryMap[key].expense += tx.amount;
      }
      // Total as net for the category
      categoryMap[key].total = categoryMap[key].income - categoryMap[key].expense;
    });

    const categoryTotals = Object.values(categoryMap).map((c) => ({
      category: c.category,
      income: parseFloat(c.income.toFixed(2)),
      expense: parseFloat(c.expense.toFixed(2)),
      net: parseFloat(c.total.toFixed(2)),
    }));

    res.json({ categoryTotals });
  } catch (err) {
    console.error("Category totals error:", err);
    res.status(500).json({ error: "Failed to fetch category totals." });
  }
}

// GET /api/dashboard/monthly-trends
// Returns income and expense totals grouped by month
// Optional query param: year (defaults to current year)
async function getMonthlyTrends(req, res) {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const userFilter = req.user.role === "ADMIN" ? {} : { userId: req.user.id };

  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        isDeleted: false,
        date: { gte: startDate, lte: endDate },
        ...userFilter,
      },
    });

    // Build monthly buckets - Jan=0 to Dec=11
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(year, i, 1).toLocaleString("default", { month: "long" }),
      income: 0,
      expense: 0,
      net: 0,
    }));

    transactions.forEach((tx) => {
      const monthIndex = new Date(tx.date).getMonth(); // 0-based
      if (tx.type === "INCOME") {
        months[monthIndex].income += tx.amount;
      } else {
        months[monthIndex].expense += tx.amount;
      }
    });

    // Calculate net for each month
    months.forEach((m) => {
      m.income = parseFloat(m.income.toFixed(2));
      m.expense = parseFloat(m.expense.toFixed(2));
      m.net = parseFloat((m.income - m.expense).toFixed(2));
    });

    res.json({ year, monthlyTrends: months });
  } catch (err) {
    console.error("Monthly trends error:", err);
    res.status(500).json({ error: "Failed to fetch monthly trends." });
  }
}

// GET /api/dashboard/weekly-trends
// Returns last 7 days income and expense totals
async function getWeeklyTrends(req, res) {
  const userFilter = req.user.role === "ADMIN" ? {} : { userId: req.user.id };

  // Build last 7 days range
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        isDeleted: false,
        date: { gte: sevenDaysAgo, lte: today },
        ...userFilter,
      },
    });

    // Build day buckets for last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      days.push({
        date: d.toISOString().split("T")[0],
        label: d.toLocaleDateString("default", { weekday: "short", month: "short", day: "numeric" }),
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date).toISOString().split("T")[0];
      const day = days.find((d) => d.date === txDate);
      if (day) {
        if (tx.type === "INCOME") {
          day.income += tx.amount;
        } else {
          day.expense += tx.amount;
        }
      }
    });

    days.forEach((d) => {
      d.income = parseFloat(d.income.toFixed(2));
      d.expense = parseFloat(d.expense.toFixed(2));
      d.net = parseFloat((d.income - d.expense).toFixed(2));
    });

    res.json({ weeklyTrends: days });
  } catch (err) {
    console.error("Weekly trends error:", err);
    res.status(500).json({ error: "Failed to fetch weekly trends." });
  }
}

module.exports = { getSummary, getCategoryTotals, getMonthlyTrends, getWeeklyTrends };
