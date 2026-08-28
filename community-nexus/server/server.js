const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'community.db');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  initializeDatabase();
});

// Hash password function
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Initialize Database Tables
const initializeDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Members table
    db.run(`
      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        location TEXT,
        bio TEXT,
        joined_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Events table
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        location TEXT,
        event_type TEXT,
        organizer_id INTEGER,
        capacity INTEGER,
        status TEXT DEFAULT 'upcoming',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (organizer_id) REFERENCES users(id)
      )
    `);

    // RSVPs table
    db.run(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'going',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(event_id, user_id)
      )
    `);

    // Announcements table
    db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER,
        announcement_type TEXT DEFAULT 'general',
        status TEXT DEFAULT 'published',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);

    // Organization Settings table
    db.run(`
      CREATE TABLE IF NOT EXISTS org_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        org_name TEXT DEFAULT 'Abuja Community Organization',
        org_email TEXT DEFAULT 'Community.org.app@gmail.com',
        org_location TEXT DEFAULT 'Abuja, FCT, Nigeria',
        org_phone TEXT,
        tagline TEXT DEFAULT 'Together, Stronger and Better',
        theme_color TEXT DEFAULT '#17A2B8',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating org_settings table:', err);
      else {
        // Insert default org settings
        db.run(`
          INSERT OR IGNORE INTO org_settings (id, org_name, org_email, org_location, tagline)
          VALUES (1, 'Abuja Community Organization', 'Community.org.app@gmail.com', 'Abuja, FCT, Nigeria', 'Together, Stronger and Better')
        `);
      }
    });

    // Check if admin exists, if not create one
    db.get(`SELECT * FROM users WHERE email = 'Community.org.app@gmail.com'`, (err, row) => {
      if (err) {
        console.error('Error checking admin account:', err);
      } else if (!row) {
        const adminPassword = hashPassword('Abuja@Community2026');
        db.run(`
          INSERT INTO users (email, password, name, role, status)
          VALUES ('Community.org.app@gmail.com', ?, 'Abuja Community Admin', 'admin', 'active')
        `, [adminPassword], (err) => {
          if (err) {
            console.error('Error creating admin account:', err);
          } else {
            console.log('✅ Admin account created: Community.org.app@gmail.com');
          }
        });
      } else {
        console.log('✅ Admin account already exists');
      }
    });
  });
};

// Helper: Run query and return promise
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// ===== AUTH ENDPOINTS =====

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const hashedPassword = hashPassword(password);

  db.get(
    `SELECT id, email, name, role FROM users WHERE email = ? AND password = ?`,
    [email, hashedPassword],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.json({ success: true, user });
    }
  );
});

// Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  const hashedPassword = hashPassword(password);

  db.run(
    `INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, 'member')`,
    [email, hashedPassword, name],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: 'Registration error' });
      }

      res.status(201).json({
        success: true,
        user: {
          id: this.lastID,
          email,
          name,
          role: 'member',
        },
      });
    }
  );
});

// ===== MEMBER ENDPOINTS =====

// Get all members
app.get('/api/members', (req, res) => {
  db.all(`SELECT * FROM members ORDER BY joined_date DESC`, (err, members) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(members);
  });
});

// Add member
app.post('/api/members', (req, res) => {
  const { user_id, full_name, email, phone, location, bio } = req.body;

  if (!user_id || !full_name) {
    return res.status(400).json({ error: 'User ID and full name required' });
  }

  db.run(
    `INSERT INTO members (user_id, full_name, email, phone, location, bio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, full_name, email, phone, location, bio],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error adding member' });
      }
      res.status(201).json({ id: this.lastID, success: true });
    }
  );
});

// Get member by ID
app.get('/api/members/:id', (req, res) => {
  db.get(`SELECT * FROM members WHERE id = ?`, [req.params.id], (err, member) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  });
});

// Update member
app.put('/api/members/:id', (req, res) => {
  const { full_name, email, phone, location, bio } = req.body;

  db.run(
    `UPDATE members SET full_name = ?, email = ?, phone = ?, location = ?, bio = ? WHERE id = ?`,
    [full_name, email, phone, location, bio, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating member' });
      }
      res.json({ success: true });
    }
  );
});

// Delete member
app.delete('/api/members/:id', (req, res) => {
  db.run(`DELETE FROM members WHERE id = ?`, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting member' });
    }
    res.json({ success: true });
  });
});

// ===== EVENT ENDPOINTS =====

// Get all events
app.get('/api/events', (req, res) => {
  db.all(`SELECT * FROM events ORDER BY date DESC`, (err, events) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(events);
  });
});

// Create event
app.post('/api/events', (req, res) => {
  const { title, description, date, location, event_type, organizer_id, capacity } = req.body;

  if (!title || !date || !organizer_id) {
    return res.status(400).json({ error: 'Title, date, and organizer_id required' });
  }

  db.run(
    `INSERT INTO events (title, description, date, location, event_type, organizer_id, capacity)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, description, date, location, event_type, organizer_id, capacity],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating event' });
      }
      res.status(201).json({ id: this.lastID, success: true });
    }
  );
});

// Get event by ID
app.get('/api/events/:id', (req, res) => {
  db.get(`SELECT * FROM events WHERE id = ?`, [req.params.id], (err, event) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  });
});

// Update event
app.put('/api/events/:id', (req, res) => {
  const { title, description, date, location, event_type, capacity, status } = req.body;

  db.run(
    `UPDATE events SET title = ?, description = ?, date = ?, location = ?, event_type = ?, capacity = ?, status = ? WHERE id = ?`,
    [title, description, date, location, event_type, capacity, status, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating event' });
      }
      res.json({ success: true });
    }
  );
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
  db.run(`DELETE FROM events WHERE id = ?`, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting event' });
    }
    res.json({ success: true });
  });
});

// ===== RSVP ENDPOINTS =====

// Create RSVP
app.post('/api/rsvps', (req, res) => {
  const { event_id, user_id, status } = req.body;

  if (!event_id || !user_id) {
    return res.status(400).json({ error: 'Event ID and User ID required' });
  }

  const rsvpStatus = status || 'going';

  db.run(
    `INSERT OR REPLACE INTO rsvps (event_id, user_id, status) VALUES (?, ?, ?)`,
    [event_id, user_id, rsvpStatus],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error creating RSVP' });
      }
      res.status(201).json({ success: true });
    }
  );
});

// Get RSVPs for event
app.get('/api/events/:id/rsvps', (req, res) => {
  db.all(`SELECT * FROM rsvps WHERE event_id = ?`, [req.params.id], (err, rsvps) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rsvps);
  });
});

// Delete RSVP
app.delete('/api/rsvps/:id', (req, res) => {
  db.run(`DELETE FROM rsvps WHERE id = ?`, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting RSVP' });
    }
    res.json({ success: true });
  });
});

// ===== ANNOUNCEMENT ENDPOINTS =====

// Get all announcements
app.get('/api/announcements', (req, res) => {
  db.all(`SELECT * FROM announcements WHERE status = 'published' ORDER BY created_at DESC`, (err, announcements) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(announcements);
  });
});

// Create announcement
app.post('/api/announcements', (req, res) => {
  const { title, content, author_id, announcement_type } = req.body;

  if (!title || !content || !author_id) {
    return res.status(400).json({ error: 'Title, content, and author_id required' });
  }

  db.run(
    `INSERT INTO announcements (title, content, author_id, announcement_type)
     VALUES (?, ?, ?, ?)`,
    [title, content, author_id, announcement_type || 'general'],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating announcement' });
      }
      res.status(201).json({ id: this.lastID, success: true });
    }
  );
});

// Get announcement by ID
app.get('/api/announcements/:id', (req, res) => {
  db.get(`SELECT * FROM announcements WHERE id = ?`, [req.params.id], (err, announcement) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(announcement);
  });
});

// Update announcement
app.put('/api/announcements/:id', (req, res) => {
  const { title, content, announcement_type, status } = req.body;

  db.run(
    `UPDATE announcements SET title = ?, content = ?, announcement_type = ?, status = ? WHERE id = ?`,
    [title, content, announcement_type, status, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating announcement' });
      }
      res.json({ success: true });
    }
  );
});

// Delete announcement
app.delete('/api/announcements/:id', (req, res) => {
  db.run(`DELETE FROM announcements WHERE id = ?`, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting announcement' });
    }
    res.json({ success: true });
  });
});

// ===== ORGANIZATION SETTINGS =====

// Get organization settings
app.get('/api/org-settings', (req, res) => {
  db.get(`SELECT * FROM org_settings WHERE id = 1`, (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(settings);
  });
});

// Update organization settings
app.put('/api/org-settings', (req, res) => {
  const { org_name, org_email, org_location, org_phone, tagline, theme_color } = req.body;

  db.run(
    `UPDATE org_settings SET org_name = ?, org_email = ?, org_location = ?, org_phone = ?, tagline = ?, theme_color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
    [org_name, org_email, org_location, org_phone, tagline, theme_color],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating settings' });
      }
      res.json({ success: true });
    }
  );
});

// ===== ANALYTICS ENDPOINTS =====

// Dashboard analytics
app.get('/api/analytics/dashboard', (req, res) => {
  Promise.all([
    runQuery(`SELECT COUNT(*) as total FROM members`),
    runQuery(`SELECT COUNT(*) as total FROM events WHERE status = 'upcoming'`),
    runQuery(`SELECT COUNT(*) as total FROM announcements WHERE status = 'published'`),
    runQuery(`SELECT COUNT(*) as total FROM rsvps WHERE status = 'going'`),
  ])
    .then(([memberCount, eventCount, announcementCount, rsvpCount]) => {
      res.json({
        totalMembers: memberCount[0]?.total || 0,
        upcomingEvents: eventCount[0]?.total || 0,
        activeAnnouncements: announcementCount[0]?.total || 0,
        eventAttendance: rsvpCount[0]?.total || 0,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: 'Error fetching analytics' });
    });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Community Nexus API running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  Community Nexus Server                    ║
║  Abuja Community Organization              ║
║  "Together, Stronger and Better"           ║
╚════════════════════════════════════════════╝

✅ Server running on port ${PORT}
✅ Database: ${DB_PATH}
✅ Admin Account: Community.org.app@gmail.com
✅ API Health: http://localhost:${PORT}/api/health

Ready to connect to frontend!
  `);
});

module.exports = app;
