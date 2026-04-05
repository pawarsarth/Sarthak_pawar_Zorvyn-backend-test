require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const bcrypt = require("bcryptjs");
const prisma = require("./prisma");

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@finance.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@finance.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Create analyst user
  const analystPassword = await bcrypt.hash("analyst123", 10);
  const analyst = await prisma.user.upsert({
    where: { email: "analyst@finance.com" },
    update: {},
    create: {
      name: "Analyst User",
      email: "analyst@finance.com",
      password: analystPassword,
      role: "ANALYST",
      status: "ACTIVE",
    },
  });

  // Create viewer user
  const viewerPassword = await bcrypt.hash("viewer123", 10);
  await prisma.user.upsert({
    where: { email: "viewer@finance.com" },
    update: {},
    create: {
      name: "Viewer User",
      email: "viewer@finance.com",
      password: viewerPassword,
      role: "VIEWER",
      status: "ACTIVE",
    },
  });

  // Create sample transactions for admin
  const sampleTransactions = [
    {
      amount: 5000,
      type: "INCOME",
      category: "Salary",
      date: new Date("2024-01-15"),
      notes: "Monthly salary",
      userId: admin.id,
    },
    {
      amount: 1200,
      type: "EXPENSE",
      category: "Rent",
      date: new Date("2024-01-01"),
      notes: "Monthly rent payment",
      userId: admin.id,
    },
    {
      amount: 300,
      type: "EXPENSE",
      category: "Groceries",
      date: new Date("2024-01-10"),
      notes: "Weekly groceries",
      userId: admin.id,
    },
    {
      amount: 2000,
      type: "INCOME",
      category: "Freelance",
      date: new Date("2024-01-20"),
      notes: "Freelance project payment",
      userId: admin.id,
    },
    {
      amount: 150,
      type: "EXPENSE",
      category: "Utilities",
      date: new Date("2024-01-05"),
      notes: "Electricity bill",
      userId: admin.id,
    },
    {
      amount: 500,
      type: "EXPENSE",
      category: "Entertainment",
      date: new Date("2024-01-25"),
      notes: "Dining out and movies",
      userId: analyst.id,
    },
    {
      amount: 3500,
      type: "INCOME",
      category: "Salary",
      date: new Date("2024-02-15"),
      notes: "February salary",
      userId: analyst.id,
    },
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.create({ data: tx });
  }

  console.log("Seeding complete!");
  console.log("Test users:");
  console.log("  admin@finance.com / admin123 (ADMIN)");
  console.log("  analyst@finance.com / analyst123 (ANALYST)");
  console.log("  viewer@finance.com / viewer123 (VIEWER)");
}

seed()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
