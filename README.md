# Todo App

A modern task management application that combines block-style editing with intuitive time management. Built with React 19, Express 5, and SQLite.

## Features

- **Block-style editing**: Click anywhere to edit tasks inline with auto-save
- **Time management**: Organize tasks across Today, This Week, This Month, This Year
- **Drag & drop**: Seamless task organization and priority management
- **Status tracking**: Complete task lifecycle from creation to completion
- **Responsive design**: Works beautifully on desktop, tablet, and mobile
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Technology Stack

### Frontend
- React 19.1.0+ with TypeScript
- Vite 6.3.5+ for build tooling
- shadcn/ui component library with Tailwind CSS v4
- React Router for navigation
- Axios for API communication

### Backend
- Node.js 22+ LTS
- Express 5.1.0+ with TypeScript
- SQLite3 database
- RESTful API design

## Project Structure

```
todo-app/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
├── backend/           # Express backend API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   └── middleware/
│   ├── database/
│   └── package.json
├── TASKS.md          # Development task breakdown
└── README.md
```

## Getting Started

### Prerequisites
- Node.js v22+ LTS (recommended: 22.16.0)
- pnpm package manager v10+ (`npm install -g pnpm@latest`)

### Development Setup

1. **Clone and enter the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Setup Backend** (Terminal 1)
   ```bash
   cd backend
   pnpm install
   pnpm run dev
   ```
   Backend will start on http://localhost:3001

3. **Setup Frontend** (Terminal 2)
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```
   Frontend will start on http://localhost:3000

4. **Verify Setup**
   - Open http://localhost:3000 in your browser
   - Backend API health check: http://localhost:3001/api/health

## Development Workflow

- **Task Tracking**: See `TASKS.md` for complete development task breakdown
- **API Documentation**: RESTful endpoints under `/api/` prefix
- **Component Library**: shadcn/ui components in `frontend/src/components/ui/`
- **Database**: SQLite file in `backend/database/`

## Project Status

🚧 **Currently in Development**

This project is being actively developed. Check `TASKS.md` for current progress and next steps.

### Current Phase: Project Setup & Infrastructure
- [ ] Project structure initialization
- [ ] Frontend development environment setup
- [ ] Backend API foundation
- [ ] Database schema design

---

*Modern todo app with block-style editing and time management* 