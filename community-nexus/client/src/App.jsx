import React, { useState, useEffect } from 'react';
import { Heart, LogOut, Menu, X, Plus, Calendar, Bell, Users, Settings, BarChart3, TrendingUp, Activity, Check, Building2, Key } from 'lucide-react';

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
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentPage(currentUser?.role === 'super_admin' ? 'super-admin' : 'dashboard')}>
          <Logo size="small" />
          <div>
            <h1 className="font-bold text-lg">Community Nexus</h1>
            <p className="text-xs text-teal-300">
              {currentUser?.role === 'super_admin' ? 'Platform Super Admin' : 'Together, Stronger and Better'}
            </p>
          </div>
        </div>

        {currentUser && (
          <>
            <div className="hidden md:flex gap-6">
              {currentUser.role === 'super_admin' ? (
                <button onClick={() => setCurrentPage('super-admin')} className="hover:text-teal-300 transition">
                  Communities
                </button>
              ) : (
                <>
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
                </>
              )}
              <button onClick={() => setCurrentPage('change-password')} className="hover:text-teal-300 transition">
                Change Password
              </button>
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
          {currentUser.role === 'super_admin' ? (
            <button
              onClick={() => {
                setCurrentPage('super-admin');
                setMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-teal-300"
            >
              Communities
            </button>
          ) : (
            <>
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
            </>
          )}
          <button
            onClick={() => {
              setCurrentPage('change-password');
              setMenuOpen(false);
            }}
            className="block w-full text-left py-2 hover:text-teal-300"
          >
            Change Password
          </button>
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

// Community Picker — landing page listing all communities
const CommunityPickerPage = ({ organizations, setCurrentPage, setFormData }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-center mb-6">
        <Logo size="large" />
      </div>
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Community Nexus</h1>
      <p className="text-center text-teal-600 mb-10 font-semibold">Choose your community to get started</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {organizations.map((org) => (
          <div key={org.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="text-teal-600" size={28} />
              <h3 className="text-xl font-bold text-gray-800">{org.name}</h3>
            </div>
            {org.tagline && <p className="text-gray-600 text-sm mb-4">{org.tagline}</p>}
            <div className="mt-auto flex gap-2">
              <button
                onClick={() => setCurrentPage('login')}
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition text-sm font-semibold"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setFormData({ organization_id: org.id });
                  setCurrentPage('register');
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
              >
                Join
              </button>
            </div>
          </div>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No communities have been set up yet.</p>
        </div>
      )}

      <div className="text-center">
        <button onClick={() => setCurrentPage('login')} className="text-teal-600 font-semibold hover:text-teal-800">
          Already have an account? Login directly
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-10">Authored: Yahaya Ismail</p>
    </div>
  </div>
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
        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-2">Password</label>
          <input
            type="password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Your password"
          />
        </div>
        <div className="mb-6 text-right">
          <button
            type="button"
            onClick={() => setCurrentPage('forgot-password')}
            className="text-sm text-teal-600 hover:text-teal-800 font-semibold"
          >
            Forgot Password?
          </button>
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
          onClick={() => setCurrentPage('community-picker')}
          className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Choose a Community to Join
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">Authored: Yahaya Ismail</p>
    </div>
  </div>
);

// Register page
const RegisterPage = ({ error, formData, setFormData, loading, handleRegister, setCurrentPage, organizations }) => {
  const selectedOrg = organizations.find((o) => o.id === formData.organization_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Join Community Nexus</h1>
        <p className="text-center text-teal-600 mb-8 font-semibold">
          {selectedOrg ? `Joining: ${selectedOrg.name}` : 'Create your account'}
        </p>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Community *</label>
            <select
              value={formData.organization_id || ''}
              onChange={(e) => setFormData({ ...formData, organization_id: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select a community...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
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
};

// Forgot Password page
const ForgotPasswordPage = ({ error, success, formData, setFormData, loading, handleForgotPassword, setCurrentPage }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
      <div className="flex justify-center mb-6">
        <Logo size="large" />
      </div>
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Your Password</h1>
      <p className="text-center text-gray-600 mb-8 text-sm">
        Enter your email below. Your community admin will review your request and reach out to help you reset your password.
      </p>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      {!success && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleForgotPassword();
          }}
        >
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="your@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Request Password Reset'}
          </button>
        </form>
      )}

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

// Change Password page — for any logged-in user, including first login after a default password
const ChangePasswordPage = ({ error, success, formData, setFormData, loading, handleChangePassword, setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <Key size={28} /> Change Password
      </h2>
      <div className="bg-white rounded-lg shadow-md p-8">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Current Password *</label>
            <input
              type="password"
              value={formData.current_password || ''}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">New Password *</label>
            <input
              type="password"
              value={formData.new_password || ''}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="At least 6 characters"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
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
        <p className="text-gray-600">{currentUser?.organization_name || 'Your Community'} - Together, Stronger and Better</p>
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
            <h3 className="text-xl font-bold mt-4">{currentUser?.organization_name || 'Community Nexus'}</h3>
            <p className="text-sm mt-2">Together, Stronger and Better</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Members page
const MembersPage = ({ members, currentUser, setCurrentPage }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Members</h2>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setCurrentPage('add-member')}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition flex items-center gap-2"
          >
            <Plus size={20} /> Add Member
          </button>
        )}
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
const EventsPage = ({ events, currentUser, myRsvps, handleRSVP, handleCancelRSVP, setCurrentPage }) => (
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
        {events.map((event) => {
          const isGoing = myRsvps.includes(event.id);
          return (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
              {event.description && <p className="text-gray-600 text-sm mt-2">{event.description}</p>}
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                {event.location && <p>📍 {event.location}</p>}
                {event.capacity && <p>👥 Capacity: {event.capacity}</p>}
                <p>✅ {event.rsvp_count || 0} going</p>
              </div>
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {event.status}
                </span>
                {isGoing ? (
                  <button
                    onClick={() => handleCancelRSVP(event.id)}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-red-600 transition"
                  >
                    <Check size={14} /> Going · Cancel RSVP
                  </button>
                ) : (
                  <button
                    onClick={() => handleRSVP(event.id)}
                    className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:bg-teal-700 transition"
                  >
                    RSVP - I'm Going
                  </button>
                )}
              </div>
            </div>
          );
        })}
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

// Community Admin Dashboard (scoped to their own organization)
const AdminDashboard = ({ setCurrentPage, resetRequests, resetPasswordInputs, setResetPasswordInputs, handleResolveReset, currentUser }) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
      <p className="text-gray-600 mb-8">Managing: {currentUser?.organization_name}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          <h3 className="text-xl font-bold mb-4">Your Community</h3>
          <p className="text-sm">{currentUser?.organization_name}</p>
          <p className="text-xs opacity-90 mt-2">Together, Stronger and Better</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Password Reset Requests</h3>
        {resetRequests.length === 0 ? (
          <p className="text-gray-600 text-sm">No pending password reset requests.</p>
        ) : (
          <div className="space-y-4">
            {resetRequests.map((r) => (
              <div key={r.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{r.name}</p>
                  <p className="text-sm text-gray-600">{r.email}</p>
                  <p className="text-xs text-gray-400">Requested: {new Date(r.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New password"
                    value={resetPasswordInputs[r.id] || ''}
                    onChange={(e) => setResetPasswordInputs({ ...resetPasswordInputs, [r.id]: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    onClick={() => handleResolveReset(r.id)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition whitespace-nowrap"
                  >
                    Set & Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Super Admin Panel — manages all communities on the platform
const SuperAdminPage = ({
  organizations,
  newOrgForm,
  setNewOrgForm,
  handleCreateOrganization,
  newAdminForms,
  setNewAdminForms,
  handleCreateAdmin,
  createdAdminInfo,
  loading,
}) => (
  <div className="min-h-screen bg-gray-50 py-8 px-4">
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Super Admin — Manage Communities</h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Create a New Community</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateOrganization();
          }}
          className="flex flex-col md:flex-row gap-3"
        >
          <input
            type="text"
            placeholder="Community name"
            value={newOrgForm.name || ''}
            onChange={(e) => setNewOrgForm({ ...newOrgForm, name: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          <input
            type="text"
            placeholder="Tagline (optional)"
            value={newOrgForm.tagline || ''}
            onChange={(e) => setNewOrgForm({ ...newOrgForm, tagline: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      </div>

      {createdAdminInfo && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-8">
          <p className="text-green-800 font-semibold">Admin account created for {createdAdminInfo.organization_name}:</p>
          <p className="text-green-700 text-sm">Email: {createdAdminInfo.email}</p>
          <p className="text-green-700 text-sm">Default Password: {createdAdminInfo.password}</p>
          <p className="text-green-600 text-xs mt-2">Share these with the community admin — they'll be asked to change the password after first login.</p>
        </div>
      )}

      <div className="space-y-4">
        {organizations.map((org) => (
          <div key={org.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="text-teal-600" size={20} />
              <h4 className="font-bold text-gray-800 text-lg">{org.name}</h4>
            </div>
            {org.tagline && <p className="text-gray-600 text-sm mb-4">{org.tagline}</p>}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAdmin(org.id, org.name);
              }}
              className="flex flex-col md:flex-row gap-2 mt-4 pt-4 border-t"
            >
              <input
                type="text"
                placeholder="Admin full name"
                value={newAdminForms[org.id]?.name || ''}
                onChange={(e) =>
                  setNewAdminForms({ ...newAdminForms, [org.id]: { ...newAdminForms[org.id], name: e.target.value } })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <input
                type="email"
                placeholder="Admin email"
                value={newAdminForms[org.id]?.email || ''}
                onChange={(e) =>
                  setNewAdminForms({ ...newAdminForms, [org.id]: { ...newAdminForms[org.id], email: e.target.value } })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition whitespace-nowrap"
              >
                Assign Admin
              </button>
            </form>
          </div>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No communities yet. Create the first one above.</p>
        </div>
      )}
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
  const [currentPage, setCurrentPage] = useState('community-picker');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [myRsvps, setMyRsvps] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  const [resetPasswordInputs, setResetPasswordInputs] = useState({});
  const [organizations, setOrganizations] = useState([]);
  const [newOrgForm, setNewOrgForm] = useState({});
  const [newAdminForms, setNewAdminForms] = useState({});
  const [createdAdminInfo, setCreatedAdminInfo] = useState(null);

  const authHeaders = (user = currentUser) => (user?.token ? { Authorization: `Bearer ${user.token}` } : {});

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/organizations`);
      setOrganizations(await response.json());
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  };

  // API Handler Functions
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        const userWithToken = { ...data.user, token: data.token };
        setCurrentUser(userWithToken);
        setCurrentPage(userWithToken.role === 'super_admin' ? 'super-admin' : 'dashboard');
        setFormData({});
        if (userWithToken.role === 'super_admin') {
          fetchOrganizations();
        } else {
          fetchAllData(userWithToken);
        }
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
    if (!formData.organization_id) {
      setError('Please select a community');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          organization_id: formData.organization_id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const userWithToken = { ...data.user, token: data.token };
        setCurrentUser(userWithToken);
        setCurrentPage('dashboard');
        setFormData({});
        fetchAllData(userWithToken);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setFormData({});
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Password updated successfully.');
        setFormData({});
      } else {
        setError(data.error || 'Error changing password');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setCurrentPage('members');
        setFormData({});
        fetchMembers();
      } else {
        const data = await response.json();
        setError(data.error || 'Error adding member');
      }
    } catch (err) {
      setError('Error adding member');
    }
    setLoading(false);
  };

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setCurrentPage('events');
        setFormData({});
        fetchEvents();
      } else {
        const data = await response.json();
        setError(data.error || 'Error creating event');
      }
    } catch (err) {
      setError('Error creating event');
    }
    setLoading(false);
  };

  const handleCreateAnnouncement = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setCurrentPage('announcements');
        setFormData({});
        fetchAnnouncements();
      } else {
        const data = await response.json();
        setError(data.error || 'Error creating announcement');
      }
    } catch (err) {
      setError('Error creating announcement');
    }
    setLoading(false);
  };

  const handleRSVP = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/api/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ event_id: eventId, status: 'going' }),
      });
      if (response.ok) {
        fetchMyRsvps();
        fetchEvents();
      }
    } catch (err) {
      console.error('Error RSVPing:', err);
    }
  };

  const handleCancelRSVP = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/api/rsvps/event/${eventId}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      });
      if (response.ok) {
        fetchMyRsvps();
        fetchEvents();
      }
    } catch (err) {
      console.error('Error cancelling RSVP:', err);
    }
  };

  const handleResolveReset = async (requestId) => {
    const newPassword = resetPasswordInputs[requestId];
    if (!newPassword || newPassword.length < 6) {
      setError('Enter a new password of at least 6 characters before resolving');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/reset-requests/${requestId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ new_password: newPassword }),
      });
      if (response.ok) {
        const updated = { ...resetPasswordInputs };
        delete updated[requestId];
        setResetPasswordInputs(updated);
        fetchResetRequests();
      } else {
        const data = await response.json();
        setError(data.error || 'Error resolving request');
      }
    } catch (err) {
      setError('Error resolving request');
    }
  };

  const handleCreateOrganization = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(newOrgForm),
      });
      if (response.ok) {
        setNewOrgForm({});
        fetchOrganizations();
      } else {
        const data = await response.json();
        setError(data.error || 'Error creating community');
      }
    } catch (err) {
      setError('Error creating community');
    }
    setLoading(false);
  };

  const handleCreateAdmin = async (organizationId, organizationName) => {
    setError('');
    const adminForm = newAdminForms[organizationId] || {};
    try {
      const response = await fetch(`${API_URL}/api/organizations/${organizationId}/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(adminForm),
      });
      const data = await response.json();
      if (response.ok) {
        setCreatedAdminInfo({ organization_name: organizationName, email: adminForm.email, password: data.default_password });
        setNewAdminForms({ ...newAdminForms, [organizationId]: {} });
      } else {
        setError(data.error || 'Error assigning admin');
      }
    } catch (err) {
      setError('Error assigning admin');
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/members`, { headers: { ...authHeaders() } });
      setMembers(await response.json());
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`, { headers: { ...authHeaders() } });
      setEvents(await response.json());
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_URL}/api/announcements`, { headers: { ...authHeaders() } });
      setAnnouncements(await response.json());
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/dashboard`, { headers: { ...authHeaders() } });
      setAnalytics(await response.json());
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchMyRsvps = async () => {
    if (!currentUser?.token) return;
    try {
      const response = await fetch(`${API_URL}/api/rsvps/mine`, { headers: { ...authHeaders() } });
      setMyRsvps(await response.json());
    } catch (err) {
      console.error('Error fetching RSVPs:', err);
    }
  };

  const fetchResetRequests = async () => {
    if (!currentUser?.token || currentUser.role !== 'admin') return;
    try {
      const response = await fetch(`${API_URL}/api/admin/reset-requests`, { headers: { ...authHeaders() } });
      setResetRequests(await response.json());
    } catch (err) {
      console.error('Error fetching reset requests:', err);
    }
  };

  const fetchAllData = async (user) => {
    const headers = { ...authHeaders(user) };
    try {
      const [membersRes, eventsRes, announcementsRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/api/members`, { headers }),
        fetch(`${API_URL}/api/events`, { headers }),
        fetch(`${API_URL}/api/announcements`, { headers }),
        fetch(`${API_URL}/api/analytics/dashboard`, { headers }),
      ]);
      setMembers(await membersRes.json());
      setEvents(await eventsRes.json());
      setAnnouncements(await announcementsRes.json());
      setAnalytics(await analyticsRes.json());

      const rsvpRes = await fetch(`${API_URL}/api/rsvps/mine`, { headers });
      setMyRsvps(await rsvpRes.json());

      if (user.role === 'admin') {
        const resetRes = await fetch(`${API_URL}/api/admin/reset-requests`, { headers });
        setResetRequests(await resetRes.json());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Render pages
  const renderPage = () => {
    if (!currentUser) {
      if (currentPage === 'community-picker') {
        return <CommunityPickerPage organizations={organizations} setCurrentPage={setCurrentPage} setFormData={setFormData} />;
      }
      if (currentPage === 'register') {
        return (
          <RegisterPage
            error={error}
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            handleRegister={handleRegister}
            setCurrentPage={setCurrentPage}
            organizations={organizations}
          />
        );
      }
      if (currentPage === 'forgot-password') {
        return (
          <ForgotPasswordPage
            error={error}
            success={success}
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            handleForgotPassword={handleForgotPassword}
            setCurrentPage={setCurrentPage}
          />
        );
      }
      return (
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

    if (currentPage === 'change-password') {
      return (
        <ChangePasswordPage
          error={error}
          success={success}
          formData={formData}
          setFormData={setFormData}
          loading={loading}
          handleChangePassword={handleChangePassword}
          setCurrentPage={setCurrentPage}
        />
      );
    }

    if (currentUser.role === 'super_admin') {
      return (
        <SuperAdminPage
          organizations={organizations}
          newOrgForm={newOrgForm}
          setNewOrgForm={setNewOrgForm}
          handleCreateOrganization={handleCreateOrganization}
          newAdminForms={newAdminForms}
          setNewAdminForms={setNewAdminForms}
          handleCreateAdmin={handleCreateAdmin}
          createdAdminInfo={createdAdminInfo}
          loading={loading}
        />
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} analytics={analytics} announcements={announcements} />;
      case 'members':
        return <MembersPage members={members} currentUser={currentUser} setCurrentPage={setCurrentPage} />;
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
        return (
          <EventsPage
            events={events}
            currentUser={currentUser}
            myRsvps={myRsvps}
            handleRSVP={handleRSVP}
            handleCancelRSVP={handleCancelRSVP}
            setCurrentPage={setCurrentPage}
          />
        );
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
        return (
          <AdminDashboard
            setCurrentPage={setCurrentPage}
            resetRequests={resetRequests}
            resetPasswordInputs={resetPasswordInputs}
            setResetPasswordInputs={setResetPasswordInputs}
            handleResolveReset={handleResolveReset}
            currentUser={currentUser}
          />
        );
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
