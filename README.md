# 🏏 Cricket Tournament Scheduler

A full-stack web application for managing cricket tournaments with AI-powered conflict-free scheduling. Built with React, FastAPI, and Google OR-Tools.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-18.3+-blue.svg)

## ✨ Features

### 🤖 AI-Powered Scheduling
- **Zero-conflict guarantee** using Google OR-Tools CP-SAT solver
- Automatically handles team rest periods, venue availability, and match conflicts
- Pre-validation checks before scheduling
- Post-validation to ensure schedule integrity
- Detailed error messages with actionable suggestions

### 🔐 Role-Based Access Control
- **Admin users**: Full tournament management capabilities
- **Regular users**: View-only access to tournaments and schedules
- JWT-based authentication with secure password hashing

### 📊 Tournament Management
- Create and manage multiple tournaments
- Add teams and venues
- Generate optimized match schedules
- View schedules in calendar and list formats
- Real-time schedule updates

### 💎 Modern UI/UX
- Beautiful, responsive design with Tailwind CSS
- Professional confirmation dialogs
- Empty state messages
- Loading states and animations
- Mobile-friendly interface

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Google OR-Tools** - Constraint programming solver
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **FullCalendar** - Calendar component

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **pnpm** (recommended) or npm

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/bilalafzal6349/cricket-tournament-scheduler.git
cd cricket-tournament-scheduler
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
python init_db.py

# Run backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install
# or: npm install

# Run development server
pnpm dev
# or: npm run dev
```

## 🔧 Configuration

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cricket_tournament_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
```

### Database Setup
```bash
# Create PostgreSQL database
createdb cricket_tournament_db

# Run initialization script
python init_db.py
```

## 🎯 Usage

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

### Default Credentials

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

**User Account:**
- Email: `user@example.com`
- Password: `user123`

### Creating a Tournament

1. **Login** as admin
2. Click **"Create New"** in the sidebar
3. Fill in tournament details:
   - Name
   - Start and end dates
   - Format (Round Robin, Knockout, etc.)
4. **Add Teams** to the tournament
5. **Add Venues** for matches
6. Go to **Schedule** tab
7. Click **"Generate AI Schedule"**
8. View the conflict-free schedule!

## 📚 API Documentation

The API follows RESTful conventions. Full interactive documentation is available at `/api/docs` when running the backend.

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

#### Tournaments
- `GET /api/v1/tournaments` - List all tournaments
- `POST /api/v1/tournaments` - Create tournament (admin)
- `GET /api/v1/tournaments/{id}` - Get tournament details
- `PUT /api/v1/tournaments/{id}` - Update tournament (admin)
- `DELETE /api/v1/tournaments/{id}` - Delete tournament (admin)

#### Teams
- `POST /api/v1/tournaments/{id}/teams` - Add team (admin)
- `DELETE /api/v1/teams/{id}` - Remove team (admin)

#### Venues
- `POST /api/v1/tournaments/{id}/venues` - Add venue (admin)
- `DELETE /api/v1/venues/{id}` - Remove venue (admin)

#### Scheduling
- `POST /api/v1/tournaments/{id}/generate-schedule` - Generate AI schedule (admin)
- `GET /api/v1/tournaments/{id}/matches` - Get tournament matches

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests (if configured)
cd frontend
pnpm test
```

## 🏗️ Project Structure

```
cricket-tournament-scheduler/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Configuration and security
│   │   ├── db/           # Database session
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic (AI scheduler)
│   ├── tests/            # Backend tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   ├── context/      # React context (Auth)
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Bilal Afzal**
- GitHub: [@bilalafzal6349](https://github.com/bilalafzal6349)

## 🙏 Acknowledgments

- Google OR-Tools for the constraint programming solver
- FastAPI for the excellent Python web framework
- React and Vite for the modern frontend stack
- FullCalendar for the calendar component

## 📞 Support

For support, email bilalafzal6349@gmail.com or open an issue on GitHub.

---

**Made with ❤️ for cricket tournament organizers**
