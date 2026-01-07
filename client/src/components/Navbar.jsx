import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onPricingClick }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/80 backdrop-blur-md border-b border-gray-200/50 py-3 shadow-sm'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="UniVerse Logo"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-xl font-bold text-gray-900 tracking-tight">UniVerse</span>
            </a>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            {['Features', 'Priority Engine', 'How it Works', 'Pricing'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '')}`}
                className="hover:text-indigo-600 transition-colors relative group"
                onClick={(e) => {
                  if (item === 'Pricing') {
                    e.preventDefault();
                    if (onPricingClick) onPricingClick();
                  }
                }}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden md:inline-block text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
