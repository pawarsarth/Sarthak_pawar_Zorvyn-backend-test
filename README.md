Finance Backend

A financial records management REST API built using Node.js, Express, Prisma ORM, and PostgreSQL.

---

Overview

A clean and scalable backend system for managing financial transactions with role-based access and analytics support. Designed with structured APIs, validation, and production-ready practices.

---

Features

- JWT authentication
- Role-based access (VIEWER, ANALYST, ADMIN)
- Transaction CRUD with soft delete
- Dashboard analytics (summary, category, trends)
- Pagination and filtering
- Input validation and error handling
- Rate limiting

---

Tech Stack

Node.js, Express.js, Prisma ORM, PostgreSQL  
JWT (jsonwebtoken), bcryptjs  

---

Getting Started

Prerequisites

- Node.js v18+
- PostgreSQL

Install

cd finance-backend  
npm install  

Setup environment

cp .env.example .env  

Update:

DATABASE_URL=postgresql://postgres:password@localhost:5432/finance_db  
JWT_SECRET=your-secret-key  
JWT_EXPIRES_IN=7d  
PORT=3000  

Database

npm run db:generate  
npm run db:push  
npm run db:seed  

Run

npm run dev  

---

API Design

- RESTful structure
- Role-based authorization via middleware
- Pagination using page & limit
- Filters: type, category, date range
- Soft delete using isDeleted flag

---

Postman Testing

Base URL  
https://sarthakpawarzorvyn-backend-test-production.up.railway.app  

Environment variables:

base_url = above URL  
token = (set after login)

---

Auth

POST /api/auth/login  
Body:
{
  "email": "admin@finance.com",
  "password": "admin123"
}

GET /api/auth/me  

POST /api/auth/register (admin only)

---

Users (Admin)

GET /api/users  
GET /api/users/:id  
PATCH /api/users/:id  
DELETE /api/users/:id  

---

Transactions

GET /api/transactions  
GET /api/transactions/:id  
POST /api/transactions (admin)  
PATCH /api/transactions/:id (admin)  
DELETE /api/transactions/:id (admin)  

Filters example:  
/api/transactions?type=INCOME&category=Salary&page=1&limit=10  

---

Dashboard

GET /api/dashboard/summary  
GET /api/dashboard/category-totals  
GET /api/dashboard/monthly-trends?year=2024  
GET /api/dashboard/weekly-trends  

---

Quick Test Flow

1. Login → copy token  
2. Get profile  
3. Get users  
4. Create transaction  
5. Fetch transactions  
6. Check dashboard  
7. Test role restrictions  

---

Test Users

admin@finance.com | admin123 | ADMIN  
analyst@finance.com | analyst123 | ANALYST  
viewer@finance.com | viewer123 | VIEWER  

---

Assumptions

- One user owns transactions  
- Only ADMIN can modify data  
- Soft delete used for safety  
- No refresh token (simple JWT flow)  

---

Tradeoffs

- Soft delete requires filtering  
- Simple RBAC (no fine-grained permissions)  
- No refresh token system  
- Prisma abstracts raw SQL optimizations  

---

Status Codes

200 success  
201 created  
400 bad request  
401 unauthorized  
403 forbidden  
404 not found  
429 rate limit  
500 server error  

---

Data

Uses PostgreSQL via Prisma ORM  

