# 🚀 GigConnect Deployment Guide

This guide explains how to deploy your full-stack GigConnect application (React + Node.js + Supabase) to the cloud.

---

## 1. Database: Supabase (Cloud Ready)

Your database is already cloud-hosted on Supabase! You just need to ensure your schema is applied.

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Go to the **SQL Editor**.
3.  Copy and paste the contents of `supabase_schema.sql` and run it.
4.  Go to **Project Settings** → **API** to find your `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

---

## 2. Backend: Render (Node.js + Socket.IO)

We recommend [Render](https://render.com/) for hosting the Node.js server.

### Steps:
1.  Push your code to a **GitHub repository**.
2.  Log in to Render and click **New +** → **Web Service**.
3.  Connect your repository.
4.  Configure the service:
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  Add **Environment Variables**:
    *   `PORT`: `5000`
    *   `SUPABASE_URL`: (Your Supabase URL)
    *   `SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
    *   `FRONTEND_URL`: (Your future Vercel URL, e.g., `https://gigconnect.vercel.app`)
6.  **Note on Resumes**: Render's file system is ephemeral. Resumes uploaded via Multer will be deleted when the server restarts. For permanent storage, it is recommended to use **Supabase Storage**.

---

## 3. Frontend: Vercel (React + Vite)

Vercel is the best platform for deploying Vite/React applications.

### Steps:
1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New** → **Project**.
3.  Connect your GitHub repository.
4.  Configure the build settings:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `./` (The root folder)
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
5.  Add **Environment Variables**:
    *   `VITE_API_URL`: (The URL of your Render backend, e.g., `https://gigconnect-api.onrender.com`)
    *   `VITE_SUPABASE_URL`: (Your Supabase URL)
    *   `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
6.  Click **Deploy**.

---

## 4. Final Configuration (Sync)

1.  Once Vercel gives you a live URL, go back to your **Render Dashboard**.
2.  Update the `FRONTEND_URL` environment variable to match your Vercel URL exactly.
3.  The backend will restart, and your project is live! 🎉

---

## 💡 Quick Checklist
- [ ] Schema applied in Supabase SQL Editor.
- [ ] Backend variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) set on Render.
- [ ] Frontend variables (`VITE_API_URL`, `VITE_SUPABASE_URL`) set on Vercel.
- [ ] `FRONTEND_URL` on backend matches the Vercel site URL.
