# Project B

A full-stack application with Next.js frontend and FastAPI backend.

## Quick Setup

After cloning the repository, run the setup script:

```bash
./setup.sh
```

This will automatically set up both frontend and backend dependencies.

## Manual Setup

If you prefer to set up manually:

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Start Backend
```bash
cd backend
./run.sh
```
The backend will be available at http://localhost:8000

### Start Frontend
```bash
cd frontend
npm run dev
```
The frontend will be available at http://localhost:3000

## Troubleshooting

### Backend Issues
- If you get compilation errors with numpy/scipy, try installing with pre-built wheels:
  ```bash
  pip install --only-binary=:all: numpy scipy
  ```
- Make sure you have Python 3.8+ installed

### Frontend Issues
- If Next.js packages are missing, delete `node_modules` and `package-lock.json`, then run `npm install`
- Make sure you have Node.js 18+ installed

## Project Structure

```
project_B/
├── backend/          # FastAPI backend
│   ├── main.py       # Main application
│   ├── models.py     # Database models
│   ├── schemas.py    # Pydantic schemas
│   ├── database.py   # Database configuration
│   └── run.sh        # Backend startup script
└── frontend/         # Next.js frontend
    ├── src/
    │   ├── app/      # App router pages
    │   └── components/ # React components
    └── package.json  # Frontend dependencies
```