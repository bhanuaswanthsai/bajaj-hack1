# SRM Full Stack Engineering Challenge - BFHL

A full-stack hierarchy analyzer that processes tree structures, detects cycles, and analyzes hierarchical relationships.

## 📁 Folder Structure

```
baja hack1/
├── backend/
│   ├── server.js                 # Express server with POST /bfhl
│   ├── utils/
│   │   └── hierarchyProcessor.js # Core processing logic
│   ├── package.json
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── App.css               # Premium dark theme styles
│   │   ├── index.css             # Global styles & animations
│   │   └── main.jsx              # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## 🧪 Testing Examples

### Simple Tree
```json
{ "data": ["A->B", "A->C", "B->D"] }
```

### Cycle Detection
```json
{ "data": ["A->B", "B->C", "C->A"] }
```

### Mixed (Trees + Cycles + Invalid)
```json
{ "data": ["A->B", "A->C", "B->D", "E->F", "F->G", "G->E", "hello", "1->2"] }
```

### Duplicates
```json
{ "data": ["A->B", "A->B", "A->B", "A->C"] }
```

## 🌐 Deployment

### Backend (Render)
1. Push to GitHub
2. Create new Web Service on render.com
3. Root Directory: `backend`
4. Build Command: `npm install`
5. Start Command: `npm start`

### Frontend (Vercel)
1. Push to GitHub
2. Import project on vercel.com
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

## 📤 GitHub Push Steps
```bash
git init
git add .
git commit -m "SRM Full Stack Challenge - BFHL Hierarchy Analyzer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Tech Stack
- **Backend**: Node.js + Express.js
- **Frontend**: React.js (Vite)
- **Styling**: Vanilla CSS (dark glassmorphism theme)
