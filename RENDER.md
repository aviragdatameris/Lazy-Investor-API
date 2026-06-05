# Deploy backend on Render

## Overview

1. Create **PostgreSQL** on Render → copy `DATABASE_URL`
2. Create **Web Service** for the NestJS API
3. Set environment variables
4. Point the mobile app to the Render URL

---

## Step 1: PostgreSQL database

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. **New +** → **PostgreSQL**
3. Name: `stock-suggestion-db` (any name)
4. Region: choose closest to you
5. Plan: **Free** (for testing)
6. Create database
7. Open the database → **Connections** → copy **Internal Database URL** (use this on Render web service in same region)  
   Or **External Database URL** if connecting from outside Render.

---

## Step 2: Web Service (API)

1. **New +** → **Web Service**
2. Connect your GitHub repo (push `Stock-Suggestion` to GitHub first if needed)
3. Settings:

| Field | Value |
|--------|--------|
| **Name** | `stock-suggestion-api` |
| **Region** | Same as database |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run render:build` |
| **Start Command** | `npm run render:start` |
| **Health Check Path** | `/health` |

4. **Environment** → Add variables:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Paste from Render PostgreSQL (Internal URL recommended) |
| `JWT_SECRET` | Long random string (e.g. 32+ chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `ALPHA_VANTAGE_API_KEY` | Your key |
| `NEWS_API_KEY` | Your key |
| `GROQ_API_KEY` | Your key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` |

Do **not** set `PORT` — Render sets it automatically.

5. **Create Web Service** → wait for deploy (first build ~5–10 min)

6. Your API URL will be like:  
   `https://stock-suggestion-api.onrender.com`

Test: open `https://YOUR-SERVICE.onrender.com/health` → should show `{"status":"ok",...}`

---

## Step 3: Mobile app (APK / Expo)

Update `mobile/.env` and `mobile/eas.json` production profile:

```
EXPO_PUBLIC_API_URL=https://stock-suggestion-api.onrender.com
```

Rebuild APK:

```bash
cd mobile
eas build -p android --profile production
```

---

## Free tier notes

- Render **free** web services **spin down** after ~15 min idle → first request may take 30–60 seconds (cold start).
- Free PostgreSQL expires after 90 days on free tier (check Render docs).

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| Build fails on Prisma | Ensure `Root Directory` is `backend` |
| DB connection error | Use **Internal** `DATABASE_URL` on web service |
| 502 on start | Check logs; run `prisma migrate deploy` via start command |
| App can’t connect | Use `https://` URL, not `http://` |
