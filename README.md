Finance Backend

A financial records management REST API built using Node.js, Express, Prisma ORM, and PostgreSQL.

---

Overview

This project is designed with a focus on clean architecture, scalability, and clear API design.  
It provides role-based access control, structured data handling, and analytics-ready endpoints for financial tracking systems.

---

Features

- JWT-based authentication
- Role-based access control (VIEWER, ANALYST, ADMIN)
- Financial transaction CRUD with soft delete
- Dashboard summary APIs (totals, category breakdown, trends)
- Input validation with structured error handling
- Pagination and filtering support
- Rate limiting (100 requests per 15 minutes per IP)

---

Tech Stack

Runtime: Node.js  
Framework: Express.js  
ORM: Prisma  
Database: PostgreSQL  
Authentication: jsonwebtoken (JWT)  
Password hashing: bcryptjs  

---

Project Structure

finance-backend/

prisma/
  schema.prisma (database models)

src/
  controllers/
    auth.controller.js
    user.controller.js
    transaction.controller.js
    dashboard.controller.js

  middleware/
    auth.middleware.js

  routes/
    auth.routes.js
    user.routes.js
    transaction.routes.js
    dashboard.routes.js

  utils/
    prisma.js
    jwt.js
    seed.js

  validators/
    index.js

  index.js

.env.example  
package.json  
README.md  

---

Getting Started

Prerequisites

- Node.js v18+
- PostgreSQL

Install

cd finance-backend  
npm install  

Environment setup

cp .env.example .env  

Update values:

DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_db  
JWT_SECRET=your-secret-key  
JWT_EXPIRES_IN=7d  
PORT=3000  

Database setup

npm run db:generate  
npm run db:push  
npm run db:seed  

Run server

npm run dev  
or  
npm start  

Server runs at http://localhost:3000  

---

API Design Overview

- RESTful API structure with resource-based routing
- Consistent response format across endpoints
- Role-based authorization enforced at middleware level
- Pagination implemented using page and limit query params
- Filtering supported for transactions (type, category, date range)
- Soft delete strategy used to preserve historical data

---

Test Users

admin@finance.com | admin123 | ADMIN  
analyst@finance.com | analyst123 | ANALYST  
viewer@finance.com | viewer123 | VIEWER  

---

Role Permissions

VIEWER
- login
- view own transactions
- personal dashboard

ANALYST
- all viewer permissions
- category totals
- monthly and weekly trends

ADMIN
- full access
- manage users
- transaction CRUD
- access all data

---

API Usage

All protected routes require:

Authorization: Bearer <token>

---

Auth APIs

POST /api/auth/login  
Login user and return token

POST /api/auth/register (admin only)  
Create new user

GET /api/auth/me  
Get current user

---

User APIs (admin only)

GET /api/users  
List users with filters and pagination

GET /api/users/:id  
Get user by id

PATCH /api/users/:id  
Update user

DELETE /api/users/:id  
Delete user

---

Transaction APIs

GET /api/transactions  
List transactions with filters

GET /api/transactions/:id  
Get single transaction

POST /api/transactions (admin only)  
Create transaction

PATCH /api/transactions/:id (admin only)  
Update transaction

DELETE /api/transactions/:id (admin only)  
Soft delete transaction

---

Dashboard APIs

GET /api/dashboard/summary  
Overview stats and recent activity

GET /api/dashboard/category-totals  
Category-wise totals

GET /api/dashboard/monthly-trends  
Monthly breakdown

GET /api/dashboard/weekly-trends  
Last 7 days breakdown

---

Error Handling

{ "error": "message" }

Validation errors:

{
  "errors": [
    "error message 1",
    "error message 2"
  ]
}

---

Status Codes

200 success  
201 created  
400 bad request  
401 unauthorized  
403 forbidden  
404 not found  
409 conflict  
429 rate limit  
500 server error  

---

Assumptions

- Each transaction belongs to a single user
- Only ADMIN users can perform write operations on transactions
- Analysts and viewers are limited to read-only or analytical access
- Soft delete is sufficient instead of permanent deletion for financial records
- JWT tokens are trusted until expiry (no refresh token flow implemented)

---

Tradeoffs

- Soft delete increases data integrity but requires filtering in queries
- No refresh token mechanism for simplicity, which may affect long-term session handling
- Role system is simple (RBAC) and not fine-grained (no permission-level control)
- Prisma ORM improves developer productivity but abstracts some low-level SQL optimizations
- Rate limiting is IP-based and may not be ideal for distributed users behind shared networks

---

Additional Features

- JWT authentication
- pagination
- filtering
- soft delete
- rate limiting
- seed script

---

Data Persistence

Uses PostgreSQL with Prisma ORM.

