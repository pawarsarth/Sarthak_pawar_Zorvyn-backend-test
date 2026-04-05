// Simple validation helpers - returns error message or null

function validateRegister(data) {
  const { name, email, password, role } = data;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email is required.");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  const validRoles = ["VIEWER", "ANALYST", "ADMIN"];
  if (role && !validRoles.includes(role)) {
    errors.push(`Role must be one of: ${validRoles.join(", ")}`);
  }

  return errors;
}

function validateLogin(data) {
  const { email, password } = data;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push("A valid email is required.");
  }

  if (!password) {
    errors.push("Password is required.");
  }

  return errors;
}

function validateTransaction(data) {
  const { amount, type, category, date } = data;
  const errors = [];

  if (amount === undefined || amount === null) {
    errors.push("Amount is required.");
  } else if (isNaN(amount) || Number(amount) <= 0) {
    errors.push("Amount must be a positive number.");
  }

  const validTypes = ["INCOME", "EXPENSE"];
  if (!type || !validTypes.includes(type)) {
    errors.push("Type must be either INCOME or EXPENSE.");
  }

  if (!category || category.trim().length < 2) {
    errors.push("Category must be at least 2 characters.");
  }

  if (!date) {
    errors.push("Date is required.");
  } else if (isNaN(Date.parse(date))) {
    errors.push("Date must be a valid date (e.g. 2024-01-15).");
  }

  return errors;
}

function validateUserUpdate(data) {
  const { name, role, status } = data;
  const errors = [];

  if (name !== undefined && name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  const validRoles = ["VIEWER", "ANALYST", "ADMIN"];
  if (role !== undefined && !validRoles.includes(role)) {
    errors.push(`Role must be one of: ${validRoles.join(", ")}`);
  }

  const validStatuses = ["ACTIVE", "INACTIVE"];
  if (status !== undefined && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  return errors;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
  validateRegister,
  validateLogin,
  validateTransaction,
  validateUserUpdate,
};
