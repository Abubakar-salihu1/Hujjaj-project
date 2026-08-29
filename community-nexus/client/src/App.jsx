import React, { useState, useEffect } from 'react';
import { Heart, LogOut, Menu, X, Plus, Calendar, Bell, Users, Settings, BarChart3, TrendingUp, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Logo component
const Logo = ({ size = 'medium' }) => {
  const sizeClass = size === 'small' ? 'w-12 h-12' : size === 'large' ? 'w-40 h-40' : 'w-20 h-20';

  return (
    <img
      src="/community-nexus-logo.png"
      alt="Community Nexus Logo"
      className={`${sizeClass} rounded-full object-cover shadow-md`}
      onError={(e) => {
        console.error('Logo image failed to load');
        e.target.style.display = 'none';
      }}
    />
  );
};

// Navigation component
const Navigation = ({ currentUser, setCurrentUser, currentPage, setCurrentPage, menuOpen, setMenuOpen }) => (
  <nav className="bg-gradient-to-r from-gray-900 via-blue-900 to-teal-900 text-white shadow-lg">
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
          <Logo size="small" />
          <div>
            <h1 className="font-bold text-lg">Community Nexus</h1>
            <p className="text-xs text-teal-300">Together, Stronger and Better</p>
          </div>
        </div>

        {currentUser && (
          <>
            <div className="hidden md:flex gap-6">
              <button onClick={() => setCurrentPage('dashboard')} className="hover:text-teal-300 transition">
                Dashboard
              </button>
              <button onClick={() => setCurrentPage('members')} className="hover:text-teal-300 transition">
                Members
              </button>
              <button onClick={() => setCurrentPage('events')} className="hover:text-teal-300 transition">
                Events
              </button>
              <button onClick={() => setCurrentPage('announcements')} className="hover:text-teal-300 transition">
                Announcements
              </button>
              {currentUser.role === 'admin' && (
                <button onClick={() => setCurrentPage('admin')} className="hover:text-teal-300 transition">
                  Admin
                </button>
              )}
              <button
                onClick={() => {
                  setCurrentUser(null);
                  setCurrentPage('login');
                }}
                className="hover:text-red-400 transition"
              >
                Logout
              </button>
            </div>

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </>
        )}
      </div>

      {menuOpen && currentUser && (
        <div className="md:hidden pb-4 border-t border-teal-700">
          <button
            onClick={() => {
              setCurrentPage('dashboard');
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-teal-300"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setCurrentPage('members');
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-teal-300"
          >
            Members
          </button>
          <button
            onClick={() => {
              setCurrentPage('events');
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-teal-300"
          >
            Events
          </button>
          <button
            onClick={() => {
              setCurrentPage('announcements');
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-teal-300"
          >
            Announcements
          </button>
          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                setCurrentPage('admin');
                setMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-teal-300"
            >
              Admin
            </button>
          )}
          <button
            onClick={() => {
              setCurrentUser(null);
              setCurrentPage('login');
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-red-400"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  </nav>
);

// Login page
const LoginPage = ({ error, formData, setFormData, loading, handleLogin, setCurrentPage }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
      <div className="flex justify-center mb-6">
        <Logo size="large" />
      </div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Community Nexus</h1>
      <p className="text-center text-teal-600 mb-8 font-semibold">Together, Stronger and Better</p>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="your@email.com"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Password</label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Your password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t">
        <p className="text-center text-gray-600 mb-4">Don't have an account?</p>
        <button
          onClick={() => setCurrentPage('register')}
          className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Create Account
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-600">
          <strong>Demo Account:</strong>
          <br />
          Email: Community.org.app@gmail.com
          <br />
          Password: Abuja@Community2026
        </p>
      </div>
    </div>
  </div>
);

// Register page
const RegisterPage = ({ error, formData, setFormData, loading, handleRegister, setCurrentPage }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
      <div className="flex justify-center mb-6">
        <Logo size="large" />
      </div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Join Community Nexus</h1>
      <p className="text-center text-teal-600 mb-8 font-semibold">Create your account</p>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}
      >
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Your name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Email</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="your@email.com"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Password</label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Create a password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t">
        <button
          onClick={() => setCurrentPage('login')}
          className="w-full text-teal-600 font-bold py-2 hover:text-teal-800 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  </div>
);

// Dashboard
const Dashboard = ({ currentUser, analytics, announcements }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome, {currentUser?.name}!</h2>
        <p className="text-gray-600">Abuja Community Organization - Together, Stronger and Better</p>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Users size={24} />} title="Members" value={analytics.totalMembers} color="blue" />
          <StatCard icon={<Calendar size={24} />} title="Upcoming Events" value={analytics.upcomingEvents} color="teal" />
          <StatCard icon={<Bell size={24} />} title="Announcements" value={analytics.activeAnnouncements} color="green" />
          <StatCard icon={<TrendingUp size={24} />} title="RSVPs" value={analytics.eventAttendance} color="orange" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Recent Announcements</h3>
            {announcements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="border-b pb-4 mb-4 last:border-b-0">
                <h4 className="font-bold text-gray-800">{announcement.title}</h4>
                <p className="text-gray-600 text-sm">{announcement.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(announcement.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-lg shadow-md p-6">
            <Logo size="medium" />
            <h3 className="text-xl font-bold mt-4">Community Nexus</h3>
            <p className="text-sm mt-2">Together, Stronger and Better</p>
            <p className="text-xs mt-4 opacity-90">
              Abuja Community Organization is dedicated to bringing people together and building a stronger
              community.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Members page
const MembersPage = ({ members, setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Members</h2>
        <button
          onClick={() => setCurrentPage('add-member')}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800">{member.full_name}</h3>
            {member.email && <p className="text-gray-600 text-sm">{member.email}</p>}
            {member.location && <p className="text-gray-600 text-sm">📍 {member.location}</p>}
            {member.bio && <p className="text-gray-700 text-sm mt-3">{member.bio}</p>}
            <p className="text-xs text-gray-400 mt-4">
              Joined: {new Date(member.joined_date).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No members yet. Start by adding your first member!</p>
        </div>
      )}
    </div>
  </div>
);

// Events page
const EventsPage = ({ events, currentUser, setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Events</h2>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setCurrentPage('create-event')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus size={20} /> Create Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
            {event.description && <p className="text-gray-600 text-sm mt-2">{event.description}</p>}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>📅 {new Date(event.date).toLocaleDateString()}</p>
              {event.location && <p>📍 {event.location}</p>}
              {event.capacity && <p>👥 Capacity: {event.capacity}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {event.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No events yet. Create your first event!</p>
        </div>
      )}
    </div>
  </div>
);

// Announcements page
const AnnouncementsPage = ({ announcements, currentUser, setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Announcements</h2>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setCurrentPage('create-announcement')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Plus size={20} /> Post Announcement
          </button>
        )}
      </div>

      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-2xl font-bold text-gray-800">{announcement.title}</h3>
            <p className="text-gray-700 mt-4">{announcement.content}</p>
            <p className="text-xs text-gray-400 mt-4">
              Posted: {new Date(announcement.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {announcements.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Bell size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No announcements yet.</p>
        </div>
      )}
    </div>
  </div>
);

// Admin Dashboard
const AdminDashboard = ({ setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentPage('add-member')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-left"
            >
              ➕ Add New Member
            </button>
            <button
              onClick={() => setCurrentPage('create-event')}
              className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition text-left"
            >
              📅 Create Event
            </button>
            <button
              onClick={() => setCurrentPage('create-announcement')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-left"
            >
              📢 Post Announcement
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Organization</h3>
          <p className="text-sm">Abuja Community Organization</p>
          <p className="text-xs opacity-90 mt-2">Together, Stronger and Better</p>
          <p className="text-xs opacity-80 mt-4">Community Nexus Admin Portal</p>
        </div>
      </div>
    </div>
  </div>
);

// Add Member Form
const AddMemberPage = ({ formData, setFormData, loading, handleAddMember, setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Add New Member</h2>
      <div className="bg-white rounded-lg shadow-md p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddMember();
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
            <input
              type="text"
              value={formData.full_name || ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Location</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Bio</label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Adding member...' : 'Add Member'}
          </button>
        </form>
        <button
          onClick={() => setCurrentPage('members')}
          className="w-full mt-4 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Back to Members
        </button>
      </div>
    </div>
  </div>
);

// Create Event Form
const CreateEventPage = ({ formData, setFormData, loading, handleCreateEvent, setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Create Event</h2>
      <div className="bg-white rounded-lg shadow-md p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateEvent();
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Event Title *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="4"
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Date & Time *</label>
            <input
              type="datetime-local"
              value={formData.date || ''}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Location</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Capacity</label>
            <input
              type="number"
              value={formData.capacity || ''}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating event...' : 'Create Event'}
          </button>
        </form>
        <button
          onClick={() => setCurrentPage('events')}
          className="w-full mt-4 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Back to Events
        </button>
      </div>
    </div>
  </div>
);

// Create Announcement Form
const CreateAnnouncementPage = ({ formData, setFormData, loading, handleCreateAnnouncement, setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Post Announcement</h2>
      <div className="bg-white rounded-lg shadow-md p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateAnnouncement();
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Announcement Title *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Content *</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="6"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Announcement'}
          </button>
        </form>
        <button
          onClick={() => setCurrentPage('announcements')}
          className="w-full mt-4 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Back to Announcements
        </button>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => {
  const colorClass = {
    blue: 'from-blue-500 to-blue-600',
    teal: 'from-teal-500 to-teal-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  }[color];

  return (
    <div className={`bg-gradient-to-br ${colorClass} text-white rounded-lg shadow-md p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="opacity-30">{icon}</div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [orgSettings, setOrgSettings] = useState(null);

  // API Handler Functions
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        setCurrentPage('dashboard');
        setFormData({});
        fetchAllData(data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Error connecting to server. Please check if backend is running.');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password, name: formData.name }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        setCurrentPage('dashboard');
        setFormData({});
        fetchAllData(data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: currentUser.id }),
      });
      if (response.ok) {
        setCurrentPage('members');
        setFormData({});
        fetchMembers();
      }
    } catch (err) {
      setError('Error adding member');
    }
    setLoading(false);
  };

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, organizer_id: currentUser.id }),
      });
      if (response.ok) {
        setCurrentPage('events');
        setFormData({});
        fetchEvents();
      }
    } catch (err) {
      setError('Error creating event');
    }
    setLoading(false);
  };

  const handleCreateAnnouncement = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, author_id: currentUser.id }),
      });
      if (response.ok) {
        setCurrentPage('announcements');
        setFormData({});
        fetchAnnouncements();
      }
    } catch (err) {
      setError('Error creating announcement');
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/members`);
      setMembers(await response.json());
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      setEvents(await response.json());
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_URL}/announcements`);
      setAnnouncements(await response.json());
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/analytics/dashboard`);
      setAnalytics(await response.json());
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchAllData = async (user) => {
    await fetchMembers();
    await fetchEvents();
    await fetchAnnouncements();
    await fetchAnalytics();
  };

  // Render pages
  const renderPage = () => {
    if (!currentUser) {
      return currentPage === 'register' ? (
        <RegisterPage
          error={error}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          handleRegister={handleRegister}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <LoginPage
          error={error}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          handleLogin={handleLogin}
          setCurrentPage={setCurrentPage}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} analytics={analytics} announcements={announcements} />;
      case 'members':
        return <MembersPage members={members} setCurrentPage={setCurrentPage} />;
      case 'add-member':
        return (
          <AddMemberPage
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            handleAddMember={handleAddMember}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'events':
        return <EventsPage events={events} currentUser={currentUser} setCurrentPage={setCurrentPage} />;
      case 'create-event':
        return (
          <CreateEventPage
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            handleCreateEvent={handleCreateEvent}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'announcements':
        return <AnnouncementsPage announcements={announcements} currentUser={currentUser} setCurrentPage={setCurrentPage} />;
      case 'create-announcement':
        return (
          <CreateAnnouncementPage
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            handleCreateAnnouncement={handleCreateAnnouncement}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'admin':
        return <AdminDashboard setCurrentPage={setCurrentPage} />;
      default:
        return <Dashboard currentUser={currentUser} analytics={analytics} announcements={announcements} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentUser && (
        <Navigation
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      )}
      {renderPage()}
    </div>
  );
};

export default App;
