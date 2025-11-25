import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Solution from './components/Solution';
import PriorityEngine from './components/PriorityEngine';
import Dashboard from './components/Dashboard';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import NotionHome from './components/Test';

export default function UniVerseApp() {
  const [showNotionDemo, setShowNotionDemo] = useState(false);

  // If the demo state is active, show the Notion clone page
  if (showNotionDemo) {
    return <NotionHome />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Pass the state setter to the Navbar */}
      <Navbar onPricingClick={() => setShowNotionDemo(true)} />
      <Hero />
      <Problem />
      <Solution />
      <PriorityEngine />
      <Dashboard />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
}
