# Community Nexus - Render Deployment Guide

## 🚀 Render Deployment for Community Nexus

Complete step-by-step guide to deploy Community Nexus (Backend + Frontend) to Render.

---

## **Prerequisites**

✅ GitHub account
✅ Render account (https://render.com)
✅ Your Community Nexus code pushed to GitHub
✅ Node.js 18+ installed locally (for testing before deployment)

---

## **Part 1: Local Setup & Testing (Optional but Recommended)**

### Step 1: Clone Your Repository Locally

```bash
git clone https://github.com/YOUR_USERNAME/community-nexus.git
cd community-nexus
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Create .env File for Backend

```bash
# In server/ directory, create .env file with:
NODE_ENV=development
PORT=5000
DB_PATH=./community.db
```

### Step 4: Start Backend Locally

```bash
npm start
```

**Expected output:**
```
╔════════════════════════════════════════════╗
║  Community Nexus Server                    ║
║  Abuja Community Organization              ║
║  "Together, Stronger and Better"           ║
╚════════════════════════════════════════════╝

✅ Server running on port 5000
✅ Admin Account: Community.org.app@gmail.com
```

### Step 5: Install Frontend Dependencies (New Terminal)

```bash
cd client
npm install
```

### Step 6: Start Frontend Locally

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

### Step 7: Test Locally

1. Open http://localhost:5173/
2. Login with:
   - Email: `Community.org.app@gmail.com`
   - Password: `Abuja@Community2026`
3. Verify all features work:
   - ✅ Dashboard loads
   - ✅ Can view members
   - ✅ Can view events
   - ✅ Can view announcements

---

## **Part 2: Deploy to Render**

### Step 1: Prepare Your GitHub Repository

Ensure your project structure looks like this:

```
community-nexus/
├── server/
│   ├── server.js
│   ├── package.json
│   └── community.db (auto-created)
├── client/
│   ├── src/
│   ├── App.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── render.yaml
└── .env.example
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### Step 3: Connect Render to Your GitHub Repository

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect a repository"**
4. Search for your GitHub repository (e.g., "community-nexus")
5. Click **"Connect"**

### Step 4: Deploy Backend Service

1. Fill in the deployment form:
   - **Name**: `community-nexus-backend`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `node server/server.js`
   - **Plan**: Free (or Starter)

2. Set Environment Variables:
   ```
   NODE_ENV = production
   PORT = 5000
   DB_PATH = ./community.db
   ```

3. Click **"Create Web Service"**

4. **Wait for deployment** (usually 5-10 minutes)

**When deployment is complete:**
- Copy the backend URL (e.g., `https://community-nexus-backend.onrender.com`)
- You should see: `✅ Server running on port 5000`

---

### Step 5: Deploy Frontend Service

1. Go to Render dashboard
2. Click **"New +"** → **"Static Site"**
3. Click **"Connect a repository"**
4. Select your GitHub repository again
5. Fill in the deployment form:
   - **Name**: `community-nexus-frontend`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

6. Set Environment Variables:
   ```
   REACT_APP_API_URL = https://community-nexus-backend.onrender.com/api
   ```
   (Replace `community-nexus-backend` with your actual backend service name)

7. Click **"Create Static Site"**

8. **Wait for deployment** (usually 5-10 minutes)

---

## **Part 3: Verify Your Deployment**

### Step 1: Check Backend Health

```bash
curl https://community-nexus-backend.onrender.com/api/health
```

**Expected response:**
```json
{
  "status": "OK",
  "message": "Community Nexus API running"
}
```

### Step 2: Access Your Live Application

1. Go to your frontend URL (e.g., `https://community-nexus-frontend.onrender.com`)
2. Login with:
   - Email: `Community.org.app@gmail.com`
   - Password: `Abuja@Community2026`
3. Test all features

---

## **Part 4: Troubleshooting**

### Issue: Backend won't start

**Check logs in Render:**
1. Go to your backend service in Render
2. Click **"Logs"** tab
3. Look for error messages

**Common fixes:**
```bash
# Ensure Node version is correct
node --version  # Should be v18.x or higher

# Reinstall dependencies
rm -rf server/node_modules
npm install
```

### Issue: Frontend can't connect to backend

**Check:**
1. In Render, edit frontend static site
2. Verify `REACT_APP_API_URL` is set correctly:
   ```
   https://YOUR_BACKEND_SERVICE_NAME.onrender.com/api
   ```
3. Redeploy frontend after updating env vars

### Issue: Database not persisting

**Note:** Render's free tier uses ephemeral storage (data is lost on redeploy)

**Solution:** Upgrade to Paid plan or connect external PostgreSQL database

---

## **Part 5: Monitor Your Application**

### In Render Dashboard:

1. **View Logs**: Check recent activity and errors
2. **Monitor CPU/Memory**: Under Analytics
3. **Setup Alerts**: Get notified of issues

### Keep Logs Clean:

```bash
# In your server.js, logs print to console
# Render automatically captures all console output
```

---

## **Part 6: Update Your Application**

### Deploy New Changes:

```bash
# Make changes locally
git add .
git commit -m "Update Community Nexus"
git push origin main
```

**Render automatically redeploys** when you push to GitHub.

---

## **Quick Reference: URLs**

After deployment, you'll have:

- **Backend API**: `https://community-nexus-backend.onrender.com/api`
- **Frontend**: `https://community-nexus-frontend.onrender.com`
- **Admin Email**: `Community.org.app@gmail.com`
- **Admin Password**: `Abuja@Community2026`

---

## **API Endpoints Available**

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Add new member
- `GET /api/members/:id` - Get member details
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### RSVPs
- `POST /api/rsvps` - Create RSVP
- `GET /api/events/:id/rsvps` - Get event RSVPs
- `DELETE /api/rsvps/:id` - Delete RSVP

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `GET /api/announcements/:id` - Get announcement details
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Organization
- `GET /api/org-settings` - Get organization settings
- `PUT /api/org-settings` - Update settings

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard stats
- `GET /api/health` - Health check

---

## **Need Help?**

- **Render Docs**: https://render.com/docs
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Community Nexus Repo**: Your GitHub repository

---

## **Success Checklist** ✅

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Backend health check working
- [ ] Frontend loads without errors
- [ ] Admin login works
- [ ] Can view/add members
- [ ] Can view/create events
- [ ] Can view announcements
- [ ] Admin dashboard accessible

---

**Congratulations! Your Community Nexus application is now live!** 🎉

Together, Stronger and Better! 💪
