import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Calendar, ArrowUpDown, Clock } from 'lucide-react';
import api from '../api/axios';

const SearchModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const inputRef = useRef(null);
  
  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const [filterDate, setFilterDate] = useState('');

  // 1. Focus Input on Open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    // Fetch initial "Recent" list when opened
    performSearch();
  }, [isOpen]);

  // 2. Search Logic (Debounced in effect)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [query, sortOrder, filterDate]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Build Query String
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (sortOrder) params.append('sort', sortOrder);
      if (filterDate) params.append('date', filterDate);

      const res = await api.get(`/notes/search?${params.toString()}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (noteId) => {
    navigate(`/notes/${noteId}`);
    onClose();
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
      
      {/* Modal Box */}
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search notes..."
            className="flex-1 text-lg outline-none placeholder:text-gray-300 text-gray-800"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-3 text-sm">
          
          {/* Sort Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-2 py-1 rounded cursor-pointer hover:border-gray-300">
            <ArrowUpDown size={14} className="text-gray-500" />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent outline-none text-gray-700 cursor-pointer appearance-none pr-2"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-2 py-1 rounded hover:border-gray-300">
            <Calendar size={14} className="text-gray-500" />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent outline-none text-gray-700 text-xs cursor-pointer"
            />
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="ml-1 text-gray-400 hover:text-red-500">
                <X size={12} />
              </button>
            )}
          </div>

          {(query || filterDate) && (
            <span className="ml-auto text-xs text-gray-400">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Searching...</div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {/* Category Label */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {query ? 'Matches' : 'Recent Pages'}
              </div>
              
              {results.map(note => (
                <div 
                  key={note._id}
                  onClick={() => handleNavigate(note._id)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer rounded-lg group transition-colors"
                >
                  <div className="flex items-center justify-center w-6 h-6 text-xl">
                    {note.icon ? note.icon : <FileText size={18} className="text-gray-400" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 group-hover:text-blue-700 truncate">
                        {note.title || "Untitled"}
                      </span>
                      {/* Date Display */}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                         <Clock size={10} />
                         {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search size={32} className="opacity-20 mb-3" />
              <p>No results found.</p>
              {filterDate && <p className="text-xs mt-1">Try clearing the date filter.</p>}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
           <span>Pro tip: Press <kbd className="bg-white border border-gray-200 px-1 rounded">ESC</kbd> to close</span>
           <span>UniVerse Search</span>
        </div>

      </div>
    </div>
  );
};

export default SearchModal;