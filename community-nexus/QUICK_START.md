# Community Nexus - Quick Start Guide

**Community Nexus** - Together, Stronger and Better

---

## ⚡ 5-Minute Local Setup

### Step 1: Extract Files
```bash
unzip community-nexus.zip
cd community-nexus
```

### Step 2: Backend (Terminal 1)
```bash
cd server
npm install
npm start
```

**Expected Output:**
```
✅ Server running on port 5000
✅ Admin Account: Community.org.app@gmail.com
```

### Step 3: Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```

**Expected Output:**
```
➜ Local: http://localhost:5173/
```

### Step 4: Open Browser
Go to: `http://localhost:5173/`

### Step 5: Login
```
Email: Community.org.app@gmail.com
Password: Abuja@Community2026
```

---

## ✅ Verify Everything Works

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Login successful
- [ ] Dashboard displays
- [ ] Can view members section
- [ ] Can view events section
- [ ] Can view announcements

---

## 🚀 Deploy to Render

See `RENDER_DEPLOYMENT_GUIDE.md` for complete instructions

**Quick steps:**
1. Push to GitHub
2. Connect repo to Render
3. Create Backend Web Service
4. Create Frontend Static Site
5. Add environment variables
6. Deploy!

---

## 📁 Project Structure

```
community-nexus/
├── server/
│   ├── server.js (Express backend - 1000+ lines)
│   ├── package.json (Dependencies)
│   └── community.db (SQLite database - auto-created)
│
├── client/
│   ├── src/
│   │   ├── App.jsx (React app - 1500+ lines)
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json (Dependencies)
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── dist/ (Built files - created on build)
│
├── README.md (Full documentation)
├── QUICK_START.md (This file)
├── RENDER_DEPLOYMENT_GUIDE.md (Deployment guide)
├── .env.example (Environment variables template)
├── render.yaml (Render deployment config)
└── .gitignore (Git ignore rules)
```

---

## 🔐 Admin Account

| Field | Value |
|-------|-------|
| Email | Community.org.app@gmail.com |
| Password | Abuja@Community2026 |

⚠️ **Change password after first login!**

---

## 🎯 What You Can Do

### As Admin:
- ✅ Manage members
- ✅ Create events
- ✅ Post announcements
- ✅ View analytics
- ✅ Manage organization settings
- ✅ View admin dashboard

### As Regular Member:
- ✅ View members
- ✅ View events & RSVP
- ✅ View announcements
- ✅ Update profile

---

## 🛠️ Common Commands

### Backend
```bash
cd server

# Install dependencies
npm install

# Start server
npm start

# Start with custom port
PORT=3001 npm start
```

### Frontend
```bash
cd client

# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Use different port
PORT=5001 npm start
```

### Frontend can't connect
```bash
# Ensure backend is running
curl http://localhost:5000/api/health

# Should show: {"status":"OK","message":"Community Nexus API running"}
```

### Clear everything and restart
```bash
# Backend
cd server
rm -rf node_modules community.db
npm install
npm start

# Frontend
cd client
rm -rf node_modules
npm install
npm run dev
```

---

## 📊 Features Checklist

- [x] User Authentication (Login/Register)
- [x] Member Management (Add/View/Edit/Delete)
- [x] Event Management (Create/View/RSVP)
- [x] Announcements (Post/View)
- [x] Admin Dashboard (Analytics, Stats)
- [x] Dashboard (Overview, Recent Activity)
- [x] Responsive Design (Mobile/Tablet/Desktop)
- [x] Professional Branding (Logo, Colors, Theme)
- [x] Database (SQLite with 5 tables)
- [x] API (20+ RESTful endpoints)
- [x] Error Handling (Input validation, error messages)
- [x] Security (Password hashing, CORS, SQL injection protection)

---

## 🌐 URLs & Endpoints

### Local Development
- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### After Render Deployment
- **Frontend**: https://your-frontend.onrender.com
- **Backend**: https://your-backend.onrender.com/api

---

## 📞 Need Help?

1. **Local Setup Issue?** → Check backend terminal output
2. **API Connection Issue?** → Verify backend is running
3. **Database Issue?** → Delete `community.db` and restart
4. **Port Conflict?** → Use different port number
5. **GitHub Push Issue?** → Verify SSH keys or use HTTPS

---

## 🎉 You're Ready!

Your Community Nexus application is fully functional and ready to use.

**Next Steps:**
1. ✅ Test locally
2. ✅ Push to GitHub
3. ✅ Deploy to Render
4. ✅ Share with your community!

---

**Together, Stronger and Better!** 💪

**Abuja Community Organization**

---

**Version**: 1.0.0
**Last Updated**: August 27, 2026
**Status**: Production Ready ✅
