import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Solution from './components/Solution';
import PriorityEngine from './components/PriorityEngine';
import DashboardPreview from './components/Dashboard'; // I renamed this alias to avoid confusion
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import NotionHome from './components/Test';

// Import Pages
import UserDashboard from './pages/UserDashboard'; // This is your new REAL dashboard
import Login from './pages/Login';
import Register from './pages/Register';
import Groups from './pages/Groups';

// 1. Create a "LandingPage" component to group all marketing sections
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
      <DashboardPreview /> {/* This is the marketing preview, not the real app */}
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
};

// 2. Main App Component with Routing
export default function UniVerseApp() {
  return (
    <Router>
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

      </Routes>
    </Router>
  );
}