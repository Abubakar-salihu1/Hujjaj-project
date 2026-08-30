const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL using the DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
});

// Hash password function
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Initialize Database Tables
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        location TEXT,
        bio TEXT,
        joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active'
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location TEXT,
        event_type TEXT,
        organizer_id INTEGER REFERENCES users(id),
        capacity INTEGER,
        status TEXT DEFAULT 'upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'going',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        announcement_type TEXT DEFAULT 'general',
        status TEXT DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS org_settings (
        id SERIAL PRIMARY KEY,
        org_name TEXT DEFAULT 'Abuja Community Organization',
        org_email TEXT DEFAULT 'Community.org.app@gmail.com',
        org_location TEXT DEFAULT 'Abuja, FCT, Nigeria',
        org_phone TEXT,
        tagline TEXT DEFAULT 'Together, Stronger and Better',
        theme_color TEXT DEFAULT '#17A2B8',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      INSERT INTO org_settings (id, org_name, org_email, org_location, tagline)
      VALUES (1, 'Abuja Community Organization', 'Community.org.app@gmail.com', 'Abuja, FCT, Nigeria', 'Together, Stronger and Better')
      ON CONFLICT (id) DO NOTHING
    `);

    // Check if admin exists, if not create one
    const adminCheck = await client.query(`SELECT * FROM users WHERE email = $1`, ['Community.org.app@gmail.com']);
    if (adminCheck.rows.length === 0) {
      const adminPassword = hashPassword('Abuja@Community2026');
      await client.query(
        `INSERT INTO users (email, password, name, role, status) VALUES ($1, $2, $3, $4, $5)`,
        ['Community.org.app@gmail.com', adminPassword, 'Abuja Community Admin', 'admin', 'active']
      );
      console.log('✅ Admin account created: Community.org.app@gmail.com');
    } else {
      console.log('✅ Admin account already exists');
    }

    console.log('Connected to PostgreSQL database and tables verified');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  } finally {
    client.release();
  }
};

initializeDatabase();

// ===== AUTH ENDPOINTS =====

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const hashedPassword = hashPassword(password);

  try {
    const result = await pool.query(
      `SELECT id, email, name, role FROM users WHERE email = $1 AND password = $2`,
      [email, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  const hashedPassword = hashPassword(password);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, 'member') RETURNING id, email, name, role`,
      [email, hashedPassword, name]
    );

    res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration error' });
  }
});

// ===== MEMBER ENDPOINTS =====

app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM members ORDER BY joined_date DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/members', async (req, res) => {
  const { user_id, full_name, email, phone, location, bio } = req.body;

  if (!user_id || !full_name) {
    return res.status(400).json({ error: 'User ID and full name required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO members (user_id, full_name, email, phone, location, bio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [user_id, full_name, email, phone, location, bio]
    );
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error adding member' });
  }
});

app.get('/api/members/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM members WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/members/:id', async (req, res) => {
  const { full_name, email, phone, location, bio } = req.body;

  try {
    await pool.query(
      `UPDATE members SET full_name = $1, email = $2, phone = $3, location = $4, bio = $5 WHERE id = $6`,
      [full_name, email, phone, location, bio, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating member' });
  }
});

app.delete('/api/members/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM members WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting member' });
  }
});

// ===== EVENT ENDPOINTS =====

app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM events ORDER BY date DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/events', async (req, res) => {
  const { title, description, date, location, event_type, organizer_id, capacity } = req.body;

  if (!title || !date || !organizer_id) {
    return res.status(400).json({ error: 'Title, date, and organizer_id required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (title, description, date, location, event_type, organizer_id, capacity) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [title, description, date, location, event_type, organizer_id, capacity]
    );
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM events WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/events/:id', async (req, res) => {
  const { title, description, date, location, event_type, capacity, status } = req.body;

  try {
    await pool.query(
      `UPDATE events SET title = $1, description = $2, date = $3, location = $4, event_type = $5, capacity = $6, status = $7 WHERE id = $8`,
      [title, description, date, location, event_type, capacity, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM events WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// ===== RSVP ENDPOINTS =====

app.post('/api/rsvps', async (req, res) => {
  const { event_id, user_id, status } = req.body;

  if (!event_id || !user_id) {
    return res.status(400).json({ error: 'Event ID and User ID required' });
  }

  const rsvpStatus = status || 'going';

  try {
    await pool.query(
      `INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id) DO UPDATE SET status = $3`,
      [event_id, user_id, rsvpStatus]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error creating RSVP' });
  }
});

app.get('/api/events/:id/rsvps', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM rsvps WHERE event_id = $1`, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/rsvps/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM rsvps WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting RSVP' });
  }
});

// ===== ANNOUNCEMENT ENDPOINTS =====

app.get('/api/announcements', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM announcements WHERE status = 'published' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, content, author_id, announcement_type } = req.body;

  if (!title || !content || !author_id) {
    return res.status(400).json({ error: 'Title, content, and author_id required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO announcements (title, content, author_id, announcement_type) VALUES ($1, $2, $3, $4) RETURNING id`,
      [title, content, author_id, announcement_type || 'general']
    );
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error creating announcement' });
  }
});

app.get('/api/announcements/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM announcements WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/announcements/:id', async (req, res) => {
  const { title, content, announcement_type, status } = req.body;

  try {
    await pool.query(
      `UPDATE announcements SET title = $1, content = $2, announcement_type = $3, status = $4 WHERE id = $5`,
      [title, content, announcement_type, status, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating announcement' });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM announcements WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting announcement' });
  }
});

// ===== ORGANIZATION SETTINGS =====

app.get('/api/org-settings', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM org_settings WHERE id = 1`);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/org-settings', async (req, res) => {
  const { org_name, org_email, org_location, org_phone, tagline, theme_color } = req.body;

  try {
    await pool.query(
      `UPDATE org_settings SET org_name = $1, org_email = $2, org_location = $3, org_phone = $4, tagline = $5, theme_color = $6, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
      [org_name, org_email, org_location, org_phone, tagline, theme_color]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating settings' });
  }
});

// ===== ANALYTICS ENDPOINTS =====

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const [memberCount, eventCount, announcementCount, rsvpCount] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total FROM members`),
      pool.query(`SELECT COUNT(*) as total FROM events WHERE status = 'upcoming'`),
      pool.query(`SELECT COUNT(*) as total FROM announcements WHERE status = 'published'`),
      pool.query(`SELECT COUNT(*) as total FROM rsvps WHERE status = 'going'`),
    ]);

    res.json({
      totalMembers: parseInt(memberCount.rows[0]?.total) || 0,
      upcomingEvents: parseInt(eventCount.rows[0]?.total) || 0,
      activeAnnouncements: parseInt(announcementCount.rows[0]?.total) || 0,
      eventAttendance: parseInt(rsvpCount.rows[0]?.total) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
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
✅ Database: PostgreSQL (${process.env.DATABASE_URL ? 'connected via DATABASE_URL' : 'NOT SET - check environment variables'})
✅ Admin Account: Community.org.app@gmail.com
✅ API Health: http://localhost:${PORT}/api/health

Ready to connect to frontend!
  `);
});

module.exports = app;
