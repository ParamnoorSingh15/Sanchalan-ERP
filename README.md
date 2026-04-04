# Sanchalan ERP

Sanchalan ERP is a modern, modularized Enterprise Resource Planning software solution designed to streamline business operations. Built with a robust full-stack architecture, it incorporates a comprehensive task management module, user administration, secure role-based access control (RBAC), audit logging, and modern frontend aesthetics.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14
- **UI & Styling**: Tailwind CSS, PostCSS
- **Components & Animation**: Shadcn/UI, Base UI, Framer Motion, Lucide React
- **State Management & Fetching**: React Query, Axios

### Backend
- **Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: JWT Authentication, Bcrypt (Password Hashing), Helmet, Express Rate Limit
- **File Uploads**: Multer
- **Email Service**: Nodemailer

## 📂 Project Structure

- `/frontend`: Next.js web application.
- `/backend`: Node.js/Express API.
- `docker-compose.yml`: Container orchestration for development environments.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Docker (optional, for containerized development)

### Running Locally

**1. Clone the repository**
```bash
git clone https://github.com/ParamnoorSingh15/Sanchalan-ERP.git
cd Sanchalan-ERP
```

**2. Setup the Backend**
```bash
cd backend
npm install
# Set up your .env file with necessary variables (PORT, MONGO_URI, JWT_SECRET, etc.)
npm run dev
```

**3. Setup the Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Running with Docker

You can spin up the entire stack using Docker Compose:
```bash
docker-compose up --build
```

## 📝 Features Overview (Phase 1)
- **Secure Authentication:** JWT-based login with automated account lockout policies.
- **Role-Based Access Control:** Fine-grained permissions and user management.
- **Task Management:** Complete CRUD workflows, status transitions, priority handling, file attachments, and assignment systems.
- **Audit Logging:** System-wide activity tracking for administrative oversight.

---

*Designed and engineered with performance, security, and exceptional user experience in mind.*
