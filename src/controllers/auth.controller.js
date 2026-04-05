const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { generateToken } = require("../utils/jwt");
const { validateRegister, validateLogin } = require("../validators");

// POST /api/auth/register
// Only admins can register new users (enforced in route)
async function register(req, res) {
  const { name, email, password, role } = req.body;

  // Validate input
  const errors = validateRegister(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email is already in use." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || "VIEWER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json({ message: "User created successfully.", user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Failed to create user." });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;

  // Validate input
  const errors = validateLogin(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.status === "INACTIVE") {
      return res.status(403).json({ error: "Your account has been deactivated." });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed." });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  // req.user is set by authenticate middleware
  const { password, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
}

module.exports = { register, login, getMe };
