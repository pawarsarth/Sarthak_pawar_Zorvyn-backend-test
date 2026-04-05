const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middleware/auth.middleware");

// POST /api/auth/register - Only admin can create users
router.post("/register", authenticate, authorize("ADMIN"), register);

// POST /api/auth/login - Public
router.post("/login", login);

// GET /api/auth/me - Any logged-in user
router.get("/me", authenticate, getMe);

module.exports = router;
