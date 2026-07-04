# Deployment Guide — Warehouse Management System

## Tech Stack
- **Backend**: Django 6 + Django REST Framework → Render (Web Service)
- **Frontend**: React + Vite + TypeScript → Render (Static Site)
- **Database**: PostgreSQL → Render (Managed DB)

---

## Step 1 — Create a Render Account
Go to https://render.com and sign up. Connect your GitHub account.

---

## Step 2 — Create PostgreSQL Database on Render

1. Render Dashboard → **New** → **PostgreSQL**
2. Fill in:
   - **Name**: `warehouse-db`
   - **Region**: Singapore (closest to India)
   - **Plan**: Free
3. Click **Create Database**
4. Copy the **Internal Database URL** — you'll need it in Step 3

---

## Step 3 — Deploy Backend (Web Service)

1. Render Dashboard → **New** → **Web Service**
2. Connect your GitHub repo → select `warehouse-management-system`
3. Fill in settings:

| Setting | Value |
|---|---|
| **Name** | `warehouse-backend` |
| **Region** | Singapore |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate` |
| **Start Command** | `gunicorn myproject2.wsgi:application` |
| **Plan** | Free |

4. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `SECRET_KEY` | any random 50-character string |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `warehouse-backend.onrender.com` |
| `DATABASE_URL` | paste the Internal Database URL from Step 2 |
| `FRONTEND_URL` | `https://warehouse-frontend.onrender.com` (your frontend URL, set after Step 4) |

5. Click **Create Web Service**
6. Wait for the build to finish. Your backend will be live at:
   `https://warehouse-backend.onrender.com`

---

## Step 4 — Deploy Frontend (Static Site)

1. Render Dashboard → **New** → **Static Site**
2. Connect your GitHub repo → select `warehouse-management-system`
3. Fill in settings:

| Setting | Value |
|---|---|
| **Name** | `warehouse-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://warehouse-backend.onrender.com/api` |

5. Click **Create Static Site**
6. Your frontend will be live at:
   `https://warehouse-frontend.onrender.com`

---

## Step 5 — Fix CORS for Production

After both are deployed, update `backend/myproject2/settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://warehouse-frontend.onrender.com",
]
```

Commit and push — Render will auto-redeploy.

---

## Step 6 — Create Admin User

After backend is deployed, open Render → your Web Service → **Shell** tab:

```bash
python manage.py createsuperuser
```

Fill in username, email, and password. Then log in at:
`https://warehouse-backend.onrender.com/admin/`

---

## Step 7 — Fix React Router (Important for Static Site)

Render static sites need a redirect rule so page refreshes work with React Router.

Create this file in your project:

**File:** `frontend/public/_redirects`
/* /index.html 200

Commit and push this file before deploying.

---

## Local Development Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and calls the backend at `http://localhost:8000/api` by default (set in `client.ts`).

---

## Notes
- Render free tier spins down after 15 minutes of inactivity — first request after sleep takes ~30 seconds
- `gunicorn` is already in `requirements.txt` ✅
- `whitenoise` serves static files — already configured in `settings.py` ✅
- PostgreSQL via `dj-database-url` — already configured in `settings.py` ✅