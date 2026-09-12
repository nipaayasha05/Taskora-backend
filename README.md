# Taskora

Taskora is a backend-focused project management system designed to help organizations manage teams, projects, sprints, tasks, subtasks, attachments, and sprint-based payments in an organized way.

The project is built with **Node.js, Express.js, TypeScript, Prisma, and PostgreSQL**, with authentication, role-based authorization, validation, file handling, Redis, email verification, and Stripe payment integration.

## 🔗 Project Links

- **Backend API:** https://taskora-backend-azure.vercel.app

## Features

### Authentication & Authorization

* Email/password authentication
* Google authentication
* Email verification with OTP
* Secure password hashing
* JWT-based authentication
* Cookie and Bearer token support
* Role-based access control
* Protected routes and resource-level authorization

### User Management

* User registration and login
* User profile management
* Profile avatar
* Resume upload
* Website, GitHub, and LinkedIn information
* Account status management

### Organization Management

* Users can create organizations
* Organization requires admin approval
* Organization status management
* Organization owner assignment after approval
* Organization members with different roles
* Organization-specific authorization

### Team Management

* Create teams inside an organization
* Add organization members to teams
* Team-based project management
* Team membership management

### Project Management  

* Create projects inside an organization
* Project status management
* Project start and end dates
* Assign teams to projects

### Sprint Management

* Create sprints for projects
* Assign teams to sprints
* Sprint status management
* Sprint start and end dates
* Sprint-based payment amount
* Prevent invalid sprint updates based on business rules

### Task Management

* Create tasks inside a sprint
* Assign tasks to sprint teams
* Task status management
* Task priority management
* Due date support
* Task creation and update authorization

### Attachments Management

* Upload files to supported resources
* Cloudinary-based file storage
* Attachment metadata management

### Payment

* Stripe payment integration
* Sprint-wise payment system
* Stripe Checkout/payment session flow
* Payment confirmation
* Stripe webhook support

### Email & OTP

* Email verification
* OTP generation and validation
* Nodemailer and EJS-based email templates

### Validation & Error Handling

* Zod request validation
* Centralized error handling
* Consistent success and error responses
* Custom application errors
* HTTP status code handling

---

## Project Hierarchy

Taskora follows a structured hierarchy:

```text
Organization
   │
   ├── Team
   │
   └── Project
         │
         └── Project Team
                │
                └── Sprint
                      │
                      ├── Sprint Team
                      │
                      └── Task
                            │
                            └── SubTask
```

This structure helps keep organization-level resources separated and makes authorization easier to manage.

---

## Role System

Taskora uses role-based access control at different levels.

### System Roles

```text
ADMIN
USER
```

### Organization Roles

```text
OWNER
MANAGER
TEAM_MEMBER
```

A user can have different organization roles in different organizations.

For example:

```text
User A
 ├── Organization X → OWNER
 └── Organization Y → TEAM_MEMBER
```

This allows each organization to manage its members independently.

---

## Organization Workflow

```text
User creates Organization
          ↓
     PENDING
          ↓
     Admin Review
       ↙     ↘
  APPROVED   REJECTED
      ↓
Organization Member
      ↓
     OWNER
```

After approval, the organization creator becomes the organization owner.

---

## 🔑 Authorization Flow

For organization-level protected resources, Taskora verifies:

```text
1. Is the user authenticated?
          ↓
2. Does the user belong to the organization?
          ↓
3. What is the user's organization role?
          ↓
4. Does the role have permission?
          ↓
5. Perform the requested operation
```

This prevents users from accessing or modifying resources belonging to organizations where they do not have the required permissions.

---

## Tech Stack

### Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* Zod

### Authentication

* JWT
* bcrypt
* Google Authentication

### Database & Caching

* PostgreSQL
* Neon
* Redis

### File & Email Services

* Cloudinary
* Multer
* Nodemailer
* EJS

### Payment

* Stripe

### API Documentation

* Postman
* Swagger/OpenAPI

### Deployment

* Vercel

---

## Project Structure

```text
src/
├── app/
│   ├── config/
│   ├── middleware/
│   ├── module/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── organization/
│   │   ├── team/
│   │   ├── project/
│   │   ├── sprint/
│   │   ├── task/
│   │   ├── subTask/
│   │   ├── attachment/
│   │   └── payment/
│   │
│   ├── utils/
│   └── routes/
│
├── app.ts
└── server.ts

prisma/
├── schema/
└── migrations/
```

Each module generally follows a layered structure:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nipaayasha05/Taskora-backend.git
```

### 2. Go to the project directory

```bash
cd Taskora-backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=your_postgresql_database_url

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=your_access_expires_in_time
JWT_REFRESH_EXPIRES_IN=your_refresh_expires_in_time

BACKEND_URL=your_backend_url


FRONTEND_URL=your_frontend_url

REDIS_USER=your_redis_user
REDIS_PASSWORD=your_redis_password
REDIS_PORT=your_redis_port
REDIS_HOST=your_redis_host

GOOGLE_CLIENT_ID=your_google_client_id

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

> Never commit your `.env` file or secret keys to GitHub.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run database migrations

```bash
npx prisma migrate dev
```

### 7. Start the development server

```bash
npm run dev
```

---

## API

The API uses versioned routes:

```text
/api/v1
```

Example:

```text
/api/v1/auth
/api/v1/user
/api/v1/organization
/api/v1/organization/projects
/api/v1/payments
```

Protected endpoints require authentication.

Example:

```http
Authorization: Bearer <access_token>
```

---

## API Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid request",
  "error": "Error details"
}
```

---

## Security

Taskora includes several security practices:

* Password hashing
* JWT authentication
* Protected routes
* Role-based authorization
* Request validation
* Centralized error handling
* CORS configuration
* Environment-based secrets
* Stripe webhook verification

---

## API Testing

The API can be tested using **Postman**.

Recommended testing flow:

```text
Register
   ↓
Verify Email
   ↓
Login
   ↓
Create Organization
   ↓
Admin Approval
   ↓
Create Team
   ↓
Create Project
   ↓
Assign Team
   ↓
Create Sprint
   ↓
Assign Sprint Team
   ↓
Create Tasks
   ↓
Manage Subtasks
   ↓
Process Sprint Payment
```

---

## Payment Flow

Taskora uses Stripe for sprint-based payments.

```text
Sprint
  ↓
Payment Session
  ↓
Stripe Checkout
  ↓
Successful Payment
  ↓
Stripe Webhook
  ↓
Payment Confirmation
```

The webhook is used to reliably receive payment events from Stripe.


