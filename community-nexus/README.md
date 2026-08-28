# Community Nexus

**Together, Stronger and Better**

A professional, production-ready community organization management platform for Abuja Community Organization.

---

## 🌟 Overview

Community Nexus is a comprehensive web application designed to help community organizations:
- Manage members and their profiles
- Organize and coordinate events
- Share announcements with the community
- Track RSVPs and attendance
- Analyze community engagement and growth

**Built for:** Abuja Community Organization
**Tagline:** Together, Stronger and Better

---

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- SHA-256 password hashing
- Role-based access (Admin, Member)
- Protected API endpoints

### 👥 Member Management
- Add and manage community members
- Store member profiles with contact info
- Track join dates and status
- Search and filter members

### 📅 Event Management
- Create and coordinate community events
- Set event details (title, date, location, capacity)
- Track event status (upcoming, completed)
- Manage attendee RSVPs

### 📢 Announcements
- Post important community announcements
- Categorize announcements (general, urgent, etc.)
- Archive past announcements
- Reach entire community efficiently

### 📊 Analytics & Dashboard
- Real-time community statistics
- Member growth tracking
- Event attendance analytics
- Community vitality scoring
- Engagement metrics

### 🎨 Professional UI
- Responsive design (mobile, tablet, desktop)
- Navy/Teal/Gold color scheme
- Dark mode support
- Community Nexus branded throughout
- Modern, intuitive interface

---

## 🏗️ Architecture

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: SQLite
- **Authentication**: SHA-256 password hashing
- **API**: RESTful with 20+ endpoints
- **Security**: Input validation, CORS enabled, SQL injection protection

### Frontend
- **Framework**: React 18+ with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Responsive**: Mobile-first design

### Database Schema
```
Users
├── id, email, password, name, role, status, created_at

Members
├── id, user_id, full_name, email, phone, location, bio, joined_date, status

Events
├── id, title, description, date, location, event_type, organizer_id, capacity, status, created_at

RSVPs
├── id, event_id, user_id, status (going/maybe/declined), created_at

Announcements
├── id, title, content, author_id, announcement_type, status, created_at

OrgSettings
├── org_name, org_email, org_location, org_phone, tagline, theme_color
```

---

## 🚀 Deployment

### Recommended: Render (Single-Service)
- Backend: Express + SQLite on Render Web Service
- Frontend: React + Vite on Render Static Site
- Easy setup, free tier available
- Auto-deployment from GitHub

**See `RENDER_DEPLOYMENT_GUIDE.md` for complete deployment steps**

### Alternative Deployments
- Heroku (backend)
- Railway (backend)
- Vercel (frontend only)
- Docker (both services)
- Local development

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Terminal/Command prompt

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/community-nexus.git
cd community-nexus
```

#### 2. Backend Setup
```bash
cd server
npm install
npm start
```
Backend runs on: `http://localhost:5000`

#### 3. Frontend Setup (New Terminal)
```bash
cd client
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

#### 4. Login
- **Email**: Community.org.app@gmail.com
- **Password**: Abuja@Community2026

---

## 🔐 Default Admin Account

| Field | Value |
|-------|-------|
| Email | Community.org.app@gmail.com |
| Password | Abuja@Community2026 |
| Role | Admin |
| Organization | Abuja Community Organization |

⚠️ **Change this password immediately after first login!**

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "User Name"
}

Response: 201 Created
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "member"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "member"
  }
}
```

### Member Endpoints

#### Get All Members
```http
GET /members

Response: 200 OK
[
  {
    "id": 1,
    "user_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348123456789",
    "location": "Abuja",
    "bio": "Community leader",
    "joined_date": "2024-08-27T10:30:00Z",
    "status": "active"
  }
]
```

#### Add Member
```http
POST /members
Content-Type: application/json

{
  "user_id": 1,
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+2348123456789",
  "location": "Abuja",
  "bio": "Passionate volunteer"
}

Response: 201 Created
{
  "id": 2,
  "success": true
}
```

#### Get Member
```http
GET /members/:id

Response: 200 OK
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  ...
}
```

#### Update Member
```http
PUT /members/:id
Content-Type: application/json

{
  "full_name": "John Smith",
  "bio": "Updated bio"
}

Response: 200 OK
{ "success": true }
```

#### Delete Member
```http
DELETE /members/:id

Response: 200 OK
{ "success": true }
```

### Event Endpoints

#### Get All Events
```http
GET /events

Response: 200 OK
[
  {
    "id": 1,
    "title": "Community Cleanup Drive",
    "description": "Let's clean up Abuja together",
    "date": "2024-09-15T14:00:00Z",
    "location": "Central Abuja",
    "event_type": "community_service",
    "organizer_id": 1,
    "capacity": 50,
    "status": "upcoming",
    "created_at": "2024-08-27T10:30:00Z"
  }
]
```

#### Create Event
```http
POST /events
Content-Type: application/json

{
  "title": "Community Meeting",
  "description": "Monthly community meeting",
  "date": "2024-09-20T18:00:00Z",
  "location": "Abuja Community Center",
  "event_type": "meeting",
  "organizer_id": 1,
  "capacity": 100
}

Response: 201 Created
{
  "id": 2,
  "success": true
}
```

### Announcement Endpoints

#### Get All Announcements
```http
GET /announcements

Response: 200 OK
[
  {
    "id": 1,
    "title": "Welcome to Community Nexus",
    "content": "We are excited to launch Community Nexus...",
    "author_id": 1,
    "announcement_type": "general",
    "status": "published",
    "created_at": "2024-08-27T10:30:00Z"
  }
]
```

#### Create Announcement
```http
POST /announcements
Content-Type: application/json

{
  "title": "Important Update",
  "content": "Lorem ipsum dolor sit amet...",
  "author_id": 1,
  "announcement_type": "general"
}

Response: 201 Created
{
  "id": 2,
  "success": true
}
```

### Analytics Endpoints

#### Dashboard Analytics
```http
GET /analytics/dashboard

Response: 200 OK
{
  "totalMembers": 45,
  "upcomingEvents": 3,
  "activeAnnouncements": 12,
  "eventAttendance": 89
}
```

### Health Check

```http
GET /health

Response: 200 OK
{
  "status": "OK",
  "message": "Community Nexus API running"
}
```

---

## 🎨 Branding & Colors

### Theme Colors
- **Navy Blue**: `#001F3F` - Primary brand color
- **Teal**: `#17A2B8` - Secondary/accent color
- **Gold**: `#FFC107` - Highlight color
- **Green**: `#28A745` - Success/positive actions

### Logo
The Community Nexus logo features:
- Circular badge design
- Diverse community members (navy, sky-blue, green, gold)
- Central handshake symbol
- Green leaf accents
- "COMMUNITY" arc text (navy)
- "NEXUS" text (green)
- Tagline: "Together, Stronger and Better"

### Typography
- **Display**: Modern, bold sans-serif (Tailwind defaults)
- **Body**: Clean, readable sans-serif
- **Accent**: Navy and teal color accents throughout

---

## 🔒 Security Features

✅ **Password Security**
- SHA-256 hashing
- No plaintext passwords stored
- Secure password requirements

✅ **API Security**
- CORS enabled and configured
- Input validation on all endpoints
- SQL injection protection (parameterized queries)
- Error handling without exposing system details

✅ **Authentication**
- User login validation
- Role-based access control
- Protected admin endpoints
- Session-based access

---

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Latest |
| Firefox | Latest |
| Safari | Latest |
| Edge | Latest |
| Mobile Safari | Latest |
| Chrome Mobile | Latest |

---

## 🐛 Common Issues & Solutions

### Backend won't start
```bash
# Check if port 5000 is in use
# Kill process or use different port
PORT=5001 npm start
```

### Frontend can't connect to backend
```bash
# Ensure backend is running
# Check REACT_APP_API_URL environment variable
# Verify CORS is enabled in backend
```

### Database issues
```bash
# Reset database (deletes data!)
rm server/community.db
npm start  # Recreates database
```

### Port conflicts
```bash
# Backend: Use different port
PORT=3001 npm start

# Frontend: Use different port
npm run dev -- --port 3000
```

---

## 📚 Documentation

- **RENDER_DEPLOYMENT_GUIDE.md** - Complete Render deployment guide
- **API_DOCS.md** - Detailed API endpoint documentation
- **ARCHITECTURE.md** - System architecture and design decisions
- **SETUP_GUIDE.md** - Step-by-step local setup guide

---

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 📞 Support

- **Organization**: Abuja Community Organization
- **Email**: Community.org.app@gmail.com
- **Tagline**: Together, Stronger and Better

For issues, feature requests, or support, please open an issue on GitHub.

---

## 🎯 Roadmap

### v1.0 (Current)
- ✅ User authentication
- ✅ Member management
- ✅ Event coordination
- ✅ Announcements
- ✅ Admin dashboard
- ✅ Analytics

### v2.0 (Planned)
- 📅 Calendar integration
- 📧 Email notifications
- 🔔 Push notifications
- 💬 Direct messaging
- 🎁 Volunteer management
- 🏆 Achievements & badges

---

## 🙏 Acknowledgments

Built with ❤️ for the Abuja Community Organization.

**Together, Stronger and Better!** 💪

---

**Last Updated**: August 27, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
