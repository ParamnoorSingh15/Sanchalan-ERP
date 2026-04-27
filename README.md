# Sanchalan ERP

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square&logo=mongodb)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)
[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-sanchalan--erp.vercel.app-blue?style=flat-square)](https://sanchalan-erp.vercel.app)

> A full-stack Enterprise Resource Planning (ERP) system built for small-to-mid-sized organizations. Sanchalan ERP streamlines HR operations, task management, attendance tracking, and access control under a single, role-aware dashboard.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login, refresh tokens, password reset via email
- 🛡️ **Role-Based Access Control** — Admin, Manager, and Employee roles with protected routes
- 👥 **User & Employee Management** — Full CRUD with department and manager assignment
- 📋 **Task Management** — Assign, track, and manage tasks with cascading Dept → Role → User flow
- 📅 **Leave Management** — Apply, approve/reject leaves with status tracking
- 🕐 **Attendance Tracking** — Per-employee attendance records with admin oversight
- 📊 **Analytics Dashboard** — Charts and KPIs for performance and activity overview
- 🔔 **Real-Time Notifications** — Persistent, data-driven notifications with mark-all-read
- 🚨 **Security Anomaly Detection** — High-risk user flagging and audit trail visualization
- 📝 **Audit Logs** — Full action history for compliance
- 🌙 **Dark / Light / System Theme** — Smooth theme switching with `next-themes`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14, React, Tailwind CSS, Framer Motion, GSAP, Recharts |
| **UI Components** | shadcn/ui, Lucide Icons, Radix UI |
| **State / Data** | TanStack React Query, Axios |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (Access + Refresh tokens), bcrypt, HttpOnly cookies |
| **Deployment** | Vercel (Frontend + Backend as serverless), MongoDB Atlas |

---

## 🔑 Demo Login

> **Live credentials to explore the app**

| Field | Value |
|---|---|
| Email | `admin@company.com` |
| Password | `admin123` |
| Role | Admin (full access) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally or MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/ParamnoorSingh15/Sanchalan-ERP.git
cd Sanchalan-ERP
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env        # Fill in MONGO_URL and JWT_SECRET
npm install
npm run seed                # Seeds the admin user
npm run dev                 # Starts on http://localhost:8000
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env.local  # Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
npm install
npm run dev                 # Starts on http://localhost:3000
```

---

## 📁 Folder Structure

```
Sanchalan-ERP/
├── backend/
│   ├── src/
│   │   ├── modules/        # Auth, Users, Tasks, Leaves, Notifications…
│   │   ├── models/         # Mongoose schemas
│   │   ├── middleware/      # Auth, RBAC, rate limiting
│   │   └── config/         # Env, DB connection
│   └── seed.js             # Admin seeder
│
└── frontend/
    └── src/
        ├── app/            # Next.js App Router pages (auth, dashboard)
        ├── components/     # Layout, UI primitives, feature components
        ├── contexts/       # AuthContext
        ├── hooks/          # Custom React Query hooks
        └── lib/            # Axios instance, utilities
```

---


## 🔮 Future Improvements

- [ ] Email delivery via SMTP (currently mocked)
- [ ] ML-driven performance scoring
- [ ] Mobile-responsive native app
- [ ] Payroll module

---

## 👤 Author

**Paramnoor Singh**
- GitHub: [@ParamnoorSingh15](https://github.com/ParamnoorSingh15)

---

> Built with ❤️ as a portfolio project demonstrating full-stack engineering with real-world ERP workflows.
