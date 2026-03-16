import { Toaster } from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

// Import Utils
import { notifyLiveEvent } from './utils/toastHelpers';
import api from './api/axios'; // Need api to fetch the logged-in user

// Import Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Solution from './components/Solution';
import PriorityEngine from './components/PriorityEngine';
import DashboardPreview from './components/Dashboard';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import NotionHome from './components/Test';

// Import Pages
import UserDashboard from './pages/UserDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Groups from './pages/Groups';
import GroupRoom from './pages/GroupRoom';
import Settings from './pages/Settings';
import Calender from './pages/Calendar';
import NoteEditor from './pages/NoteEditor';
import Inbox from './pages/Inbox';

// Initialize Socket.io client
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

// Create a "LandingPage" component to group all marketing sections
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Navbar with navigation logic */}
      <Navbar onPricingClick={() => navigate('/notion-demo')} />

      <Hero />
      <Problem />
      <Solution />
      <PriorityEngine />
      <DashboardPreview /> 
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
};

// Main App Component with Routing
export default function UniVerseApp() {
  const [user, setUser] = useState(null);

  // SOCKET CONNECTION LOGIC
  useEffect(() => {
    // Fetch the logged-in user
    const fetchUser = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
        
        // Tell the backend "I am online!"
        const currentUserId = res.data._id || res.data.id;
        if (currentUserId) {
            socket.emit('addNewUser', currentUserId);
        }
      } catch (err) {
        console.log("No user logged in yet (or token expired).");
      }
    };
    
    fetchUser();

    // Listen for live notifications from the backend!
    socket.on('receive_notification', (data) => {
      // Trigger your beautiful custom toast
      notifyLiveEvent(data.senderName, data.senderPic, data.title, data.subtitle);
    });

    // Cleanup the listener when the component unmounts
    return () => {
      socket.off('receive_notification');
    };
  }, []);

  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
          },
        }}
      />
      <Routes>
        {/* Route 1: The Public Landing Page (http://localhost:5173/) */}
        <Route path="/" element={<LandingPage />} />

        {/* Route 2: The Real App Dashboard (http://localhost:5173/app) */}
        <Route path="/app" element={<UserDashboard />} />

        {/* Route 3: Your Notion Demo (http://localhost:5173/notion-demo) */}
        <Route path="/notion-demo" element={<NotionHome />} />

        {/* Route 4: Login Page (http://localhost:5173/login) */}
        <Route path="/login" element={<Login />} />

        {/* Route 5: Register Page (http://localhost:5173/register) */}
        <Route path="/register" element={<Register />} />

        {/* Route 6: Groups Page (http://localhost:5173/groups) */}
        <Route path="/groups" element={<Groups />} />

        {/* Route 7: Specific Group Room (http://localhost:5173/groups/:id) */}
        <Route path="/groups/:id" element={<GroupRoom />} />

        {/* Route 8: Settings Page (http://localhost:5173/settings) */}
        <Route path="/settings" element={<Settings />} />

        {/* Route 9: Calendar Page (http://localhost:5173/calendar) */}
        <Route path="/calendar" element={<Calender />} />

        {/* Route 10: Note Editor Page (http://localhost:5173/notes/:id) */}
        <Route path="/notes/:id" element={<NoteEditor />} />

        {/* Route 11: Inbox Page (http://localhost:5173/inbox) */}
        <Route path="/inbox" element={<Inbox />} />

      </Routes>
    </Router>
  );
}