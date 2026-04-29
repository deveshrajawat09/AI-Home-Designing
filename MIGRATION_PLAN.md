# Next.js + FastAPI + PostgreSQL Migration Plan

This document outlines the steps to migrate the application from the current React (Vite) + Express (JSON DB) stack to the requested **Next.js + FastAPI + PostgreSQL** stack.

## Phase 1: Backend Setup (FastAPI + PostgreSQL) ✅ (In Progress)
- [x] Scaffolding the `backend` folder
- [x] Create `requirements.txt` with FastAPI, SQLAlchemy, PostgreSQL drivers, etc.
- [x] Set up Database configuration (`database.py`) using SQLAlchemy
- [x] Define SQL Models (`models.py`)
- [x] Create Pydantic Schemas (`schemas.py`)
- [x] Implement JWT Authentication and Hashing (`auth.py`)
- [x] Rewrite main endpoints (`main.py`): `/api/chat`, `/api/health`, `/generate-plan`, `/plans`
- [ ] Connect to actual PostgreSQL (Currently uses SQLite as a fallback for testing)

## Phase 2: Frontend Setup (Next.js + Tailwind CSS) ✅ (In Progress)
- [x] Scaffold the new `next-client` directory using `create-next-app`
- [ ] Install required libraries (`zustand`, `axios`, `fabric`, `three`)
- [ ] Migrate `client/tailwind.config.js` and global styles to the new Next.js app
- [ ] Move React components from `client/src/components` to Next.js `src/components`
- [ ] Convert `react-router-dom` links to Next.js `<Link>` components
- [ ] Convert the `App.jsx` routing to Next.js App Router (`src/app/page.tsx`, `src/app/chat/page.tsx`, etc.)
- [ ] Update `.env.local` to point to the new FastAPI backend (e.g. `http://localhost:8000`)

## Phase 3: PostgreSQL Deployment
- [ ] Ask the user to provide PostgreSQL credentials in the `.env` file (`DATABASE_URL`)
- [ ] Run SQLAlchemy migrations (`alembic` or `create_all()`)
- [ ] Migrate data from `users.json` and `plans.json` to PostgreSQL (Optional but recommended)

## How to run the new FastAPI Backend
```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 5001
```

*Note: Running it on port 5001 will allow the existing React (Vite) client to continue working seamlessly while we migrate the frontend to Next.js.*
