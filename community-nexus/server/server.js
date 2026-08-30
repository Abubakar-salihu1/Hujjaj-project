const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me-in-production';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@communitynexus.app';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
const DEFAULT_ADMIN_PASSWORD = 'admin@123';

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')
    ? { rejectUnauthorized: false }
    : false,
});

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// ===== AUTH MIDDLEWARE =====

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session, please log in again' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Community admin access required' });
  }
  next();
}

function requireSuperAdmin(req, res, next) {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
}

// ===== DATABASE INITIALIZATION =====

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        tagline TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        status TEXT DEFAULT 'active',
        organization_id INTEGER REFERENCES organizations(id),
        must_change_password BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // In case this table already existed from before multi-tenancy, add missing columns
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)`);
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        organization_id INTEGER REFERENCES organizations(id),
        full_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        location TEXT,
        bio TEXT,
        joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active'
      )
    `);
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES organizations(id),
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
    await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)`);

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
        organization_id INTEGER REFERENCES organizations(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        announcement_type TEXT DEFAULT 'general',
        status TEXT DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);
    await client.query(`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id)`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        email TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `);

    // Seed the first organization from the original single-tenant app, and migrate existing data into it
    let firstOrgId;
    const orgCheck = await client.query(`SELECT id FROM organizations ORDER BY id ASC LIMIT 1`);
    if (orgCheck.rows.length === 0) {
      const orgResult = await client.query(
        `INSERT INTO organizations (name, tagline) VALUES ($1, $2) RETURNING id`,
        ['Abuja Community Organization', 'Together, Stronger and Better']
      );
      firstOrgId = orgResult.rows[0].id;
    } else {
      firstOrgId = orgCheck.rows[0].id;
    }

    // Backfill any existing rows that predate multi-tenancy into the first organization
    await client.query(`UPDATE users SET organization_id = $1 WHERE organization_id IS NULL AND role != 'super_admin'`, [firstOrgId]);
    await client.query(`UPDATE members SET organization_id = $1 WHERE organization_id IS NULL`, [firstOrgId]);
    await client.query(`UPDATE events SET organization_id = $1 WHERE organization_id IS NULL`, [firstOrgId]);
    await client.query(`UPDATE announcements SET organization_id = $1 WHERE organization_id IS NULL`, [firstOrgId]);

    // Ensure the original community admin account exists, tied to the first organization
    const adminCheck = await client.query(`SELECT * FROM users WHERE email = $1`, ['Community.org.app@gmail.com']);
    if (adminCheck.rows.length === 0) {
      const adminPassword = hashPassword('Abuja@Community2026');
      await client.query(
        `INSERT INTO users (email, password, name, role, status, organization_id) VALUES ($1, $2, $3, $4, $5, $6)`,
        ['Community.org.app@gmail.com', adminPassword, 'Abuja Community Admin', 'admin', 'active', firstOrgId]
      );
      console.log('✅ Community admin account created: Community.org.app@gmail.com');
    } else {
      console.log('✅ Community admin account already exists');
    }

    // Ensure the platform Super Admin exists
    const superAdminCheck = await client.query(`SELECT * FROM users WHERE email = $1`, [SUPER_ADMIN_EMAIL]);
    if (superAdminCheck.rows.length === 0) {
      const superAdminPassword = hashPassword(SUPER_ADMIN_PASSWORD);
      await client.query(
        `INSERT INTO users (email, password, name, role, status, organization_id) VALUES ($1, $2, $3, $4, $5, NULL)`,
        [SUPER_ADMIN_EMAIL, superAdminPassword, 'Platform Super Admin', 'super_admin', 'active']
      );
      console.log(`✅ Super Admin account created: ${SUPER_ADMIN_EMAIL}`);
    } else {
      console.log('✅ Super Admin account already exists');
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
      `SELECT u.id, u.email, u.name, u.role, u.organization_id, o.name AS organization_name
       FROM users u
       LEFT JOIN organizations o ON o.id = u.organization_id
       WHERE u.email = $1 AND u.password = $2`,
      [email, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, organization_id: user.organization_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, organization_id } = req.body;

  if (!email || !password || !name || !organization_id) {
    return res.status(400).json({ error: 'Email, password, name, and community are required' });
  }

  const hashedPassword = hashPassword(password);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role, organization_id) VALUES ($1, $2, $3, 'member', $4) RETURNING id, email, name, role, organization_id`,
      [email, hashedPassword, name, organization_id]
    );

    const orgResult = await pool.query(`SELECT name FROM organizations WHERE id = $1`, [organization_id]);
    const user = { ...result.rows[0], organization_name: orgResult.rows[0]?.name };

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, organization_id: user.organization_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ success: true, user, token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration error' });
  }
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Current password and a new password (6+ characters) are required' });
  }

  try {
    const currentHashed = hashPassword(current_password);
    const check = await pool.query(`SELECT id FROM users WHERE id = $1 AND password = $2`, [req.user.id, currentHashed]);

    if (check.rows.length === 0) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHashed = hashPassword(new_password);
    await pool.query(`UPDATE users SET password = $1, must_change_password = FALSE WHERE id = $2`, [newHashed, req.user.id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error changing password' });
  }
});

// Forgot password — request a reset (community admin will approve)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  try {
    const userResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;

      const existing = await pool.query(
        `SELECT id FROM password_reset_requests WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      if (existing.rows.length === 0) {
        await pool.query(`INSERT INTO password_reset_requests (user_id, email) VALUES ($1, $2)`, [userId, email]);
      }
    }

    res.json({ success: true, message: 'If that email is registered, an admin will review your request and contact you to reset your password.' });
  } catch (err) {
    res.status(500).json({ error: 'Error submitting reset request' });
  }
});

// ===== ORGANIZATIONS (public list + super admin management) =====

app.get('/api/organizations', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, tagline FROM organizations ORDER BY name ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/organizations', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { name, tagline } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Community name required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO organizations (name, tagline) VALUES ($1, $2) RETURNING id`,
      [name, tagline || null]
    );
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error creating community' });
  }
});

// Assign a Community Admin to an organization, with a default password they must change
app.post('/api/organizations/:id/admin', authenticateToken, requireSuperAdmin, async (req, res) => {
  const { name, email } = req.body;
  const organizationId = req.params.id;

  if (!name || !email) {
    return res.status(400).json({ error: 'Admin name and email required' });
  }

  try {
    const hashedPassword = hashPassword(DEFAULT_ADMIN_PASSWORD);
    await pool.query(
      `INSERT INTO users (email, password, name, role, organization_id, must_change_password) VALUES ($1, $2, $3, 'admin', $4, TRUE)`,
      [email, hashedPassword, name, organizationId]
    );
    res.status(201).json({ success: true, default_password: DEFAULT_ADMIN_PASSWORD });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Error assigning admin' });
  }
});

// ===== ADMIN: PASSWORD RESET MANAGEMENT (scoped to the admin's own community) =====

app.get('/api/admin/reset-requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.email, r.status, r.created_at, u.name
       FROM password_reset_requests r
       JOIN users u ON u.id = r.user_id
       WHERE r.status = 'pending' AND u.organization_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/reset-requests/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
  const { new_password } = req.body;

  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  try {
    const requestResult = await pool.query(
      `SELECT r.user_id FROM password_reset_requests r
       JOIN users u ON u.id = r.user_id
       WHERE r.id = $1 AND u.organization_id = $2`,
      [req.params.id, req.user.organization_id]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reset request not found' });
    }

    const userId = requestResult.rows[0].user_id;
    const hashedPassword = hashPassword(new_password);

    await pool.query(`UPDATE users SET password = $1 WHERE id = $2`, [hashedPassword, userId]);
    await pool.query(
      `UPDATE password_reset_requests SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error resolving reset request' });
  }
});

// ===== MEMBER ENDPOINTS (scoped to the logged-in user's community) =====

app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM members WHERE organization_id = $1 ORDER BY joined_date DESC`,
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/members', authenticateToken, requireAdmin, async (req, res) => {
  const { full_name, email, phone, location, bio } = req.body;

  if (!full_name) {
    return res.status(400).json({ error: 'Full name required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO members (user_id, organization_id, full_name, email, phone, location, bio) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [req.user.id, req.user.organization_id, full_name, email, phone, location, bio]
    );
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error adding member' });
  }
});

app.put('/api/members/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { full_name, email, phone, location, bio } = req.body;

  try {
    await pool.query(
      `UPDATE members SET full_name = $1, email = $2, phone = $3, location = $4, bio = $5 WHERE id = $6 AND organization_id = $7`,
      [full_name, email, phone, location, bio, req.params.id, req.user.organization_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating member' });
  }
});

app.delete('/api/members/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM members WHERE id = $1 AND organization_id = $2`, [req.params.id, req.user.organization_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting member' });
  }
});

// ===== EVENT ENDPOINTS (scoped to the logged-in user's community) =====

app.get('/api/events', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, COALESCE(r.cnt, 0) AS rsvp_count
       FROM events e
       LEFT JOIN (
         SELECT event_id, COUNT(*) AS cnt FROM rsvps WHERE status = 'going' GROUP BY event_id
       ) r ON r.event_id = e.id
       WHERE e.organization_id = $1
       ORDER BY e.date DESC`,
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/events', authenticateToken, requireAdmin, async (req, res) => {
  const { title, description, date, location, event_type, capacity } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: 'Title and date required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO events (organization_id, title, description, date, location, event_type, organizer_id, capacity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [req.user.organization_id, title, description, date, location, event_type, req.user.id, capacity]
    );
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error creating event' });
  }
});

app.put('/api/events/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { title, description, date, location, event_type, capacity, status } = req.body;

  try {
    await pool.query(
      `UPDATE events SET title = $1, description = $2, date = $3, location = $4, event_type = $5, capacity = $6, status = $7 WHERE id = $8 AND organization_id = $9`,
      [title, description, date, location, event_type, capacity, status, req.params.id, req.user.organization_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating event' });
  }
});

app.delete('/api/events/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM events WHERE id = $1 AND organization_id = $2`, [req.params.id, req.user.organization_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting event' });
  }
});

// ===== RSVP ENDPOINTS =====

app.get('/api/rsvps/mine', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT event_id FROM rsvps WHERE user_id = $1 AND status = 'going'`, [req.user.id]);
    res.json(result.rows.map((r) => r.event_id));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/rsvps', authenticateToken, async (req, res) => {
  const { event_id, status } = req.body;

  if (!event_id) {
    return res.status(400).json({ error: 'Event ID required' });
  }

  const rsvpStatus = status || 'going';

  try {
    await pool.query(
      `INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3)
       ON CONFLICT (event_id, user_id) DO UPDATE SET status = $3`,
      [event_id, req.user.id, rsvpStatus]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error creating RSVP' });
  }
});

app.delete('/api/rsvps/event/:eventId', authenticateToken, async (req, res) => {
  try {
    await pool.query(`DELETE FROM rsvps WHERE event_id = $1 AND user_id = $2`, [req.params.eventId, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error cancelling RSVP' });
  }
});

// ===== ANNOUNCEMENT ENDPOINTS (scoped to the logged-in user's community) =====

app.get('/api/announcements', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM announcements WHERE status = 'published' AND organization_id = $1 ORDER BY created_at DESC`,
      [req.user.organization_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/announcements', authenticateToken, requireAdmin, async (req, res) => {
  const { title, content, announcement_type } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO announcements (organization_id, title, content, author_id, announcement_type) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [req.user.organization_id, title, content, req.user.id, announcement_type || 'general']
    );
    res.status(201).json({ id: result.rows[0].id, success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error creating announcement' });
  }
});

app.put('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { title, content, announcement_type, status } = req.body;

  try {
    await pool.query(
      `UPDATE announcements SET title = $1, content = $2, announcement_type = $3, status = $4 WHERE id = $5 AND organization_id = $6`,
      [title, content, announcement_type, status, req.params.id, req.user.organization_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error updating announcement' });
  }
});

app.delete('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM announcements WHERE id = $1 AND organization_id = $2`, [req.params.id, req.user.organization_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting announcement' });
  }
});

// ===== ANALYTICS ENDPOINTS (scoped to the logged-in user's community) =====

app.get('/api/analytics/dashboard', authenticateToken, async (req, res) => {
  const orgId = req.user.organization_id;
  try {
    const [memberCount, eventCount, announcementCount, rsvpCount] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total FROM members WHERE organization_id = $1`, [orgId]),
      pool.query(`SELECT COUNT(*) as total FROM events WHERE status = 'upcoming' AND organization_id = $1`, [orgId]),
      pool.query(`SELECT COUNT(*) as total FROM announcements WHERE status = 'published' AND organization_id = $1`, [orgId]),
      pool.query(
        `SELECT COUNT(*) as total FROM rsvps r JOIN events e ON e.id = r.event_id WHERE r.status = 'going' AND e.organization_id = $1`,
        [orgId]
      ),
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
║  Community Nexus Server (Multi-Tenant)     ║
║  "Together, Stronger and Better"           ║
╚════════════════════════════════════════════╝

✅ Server running on port ${PORT}
✅ Database: PostgreSQL (${process.env.DATABASE_URL ? 'connected via DATABASE_URL' : 'NOT SET - check environment variables'})
✅ JWT Secret: ${process.env.JWT_SECRET ? 'configured' : 'USING DEFAULT - set JWT_SECRET env var for production!'}
✅ Super Admin: ${SUPER_ADMIN_EMAIL}
✅ API Health: http://localhost:${PORT}/api/health

Ready to connect to frontend!
  `);
});

module.exports = app;
