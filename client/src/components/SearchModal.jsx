import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Calendar, Clock, ChevronDown, ArrowUpDown, Type, User, CornerDownLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Listbox, Transition } from '@headlessui/react';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';
import api from '../api/axios';

const SearchModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dateInputRef = useRef(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = filterDate ? new Date(filterDate) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const calendarRef = useRef(null);

  // Search State
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // 1. Focus Input on Open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    // Fetch initial "Recent" list when opened
    if (isOpen) {
      performSearch();
    }
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

  // Group results helper
  const groupedResults = results.reduce((acc, note) => {
    const date = parseISO(note.updatedAt);
    let group = 'Older';
    if (isToday(date)) group = 'Today';
    else if (isYesterday(date)) group = 'Yesterday';
    else if (isThisWeek(date)) group = 'Past 7 days';
    else group = 'Past 30 days'; // Simplified bucket for demo

    if (!acc[group]) acc[group] = [];
    acc[group].push(note);
    return acc;
  }, {});

  const groupsOrder = ['Today', 'Yesterday', 'Past 7 days', 'Past 30 days', 'Older'];

  const sortOptions = [
    { id: 'newest', name: 'Newest' },
    { id: 'oldest', name: 'Oldest' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-[2px] flex items-start justify-center pt-[15vh] px-4 font-sans animate-in fade-in duration-200">

      {/* Modal Box */}
      <div className="bg-[#FBFAF9] w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] ring-1 ring-black/5">

        {/* Search Header & Filters */}
        <div className="flex flex-col border-b border-gray-200/60 pb-2">
          {/* Input Area */}
          <div className="px-4 pt-4 pb-2 flex items-center gap-3">
            <Search className="text-gray-400" size={20} strokeWidth={2} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search or ask a question in UniVerse..."
              className="flex-1 text-[17px] outline-none placeholder:text-gray-400 text-gray-700 bg-transparent font-normal"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-500 rounded-full"></div>}
          </div>

          {/* New Filter Bar */}
          <div className="px-4 flex items-center gap-1 flex-wrap">
            {/* Sort Dropdown */}
            <div className="relative">
              <Listbox value={sortOrder} onChange={setSortOrder}>
                <Listbox.Button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-200/50 transition-colors">
                  <ArrowUpDown size={14} />
                  <span>{sortOptions.find(o => o.id === sortOrder)?.name || 'Sort'}</span>
                  <ChevronDown size={12} className="opacity-50" />
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute top-full left-0 z-20 mt-1 w-32 overflow-hidden rounded-lg bg-white py-1 text-sm shadow-xl ring-1 ring-black/5 focus:outline-none">
                    {sortOptions.map((opt) => (
                      <Listbox.Option
                        key={opt.id}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-2 px-3 ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'}`
                        }
                        value={opt.id}
                      >
                        {opt.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </Listbox>
            </div>

            {/* Visual-only Filters (Mocked for UI Match) */}
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-200/50 transition-colors">
              <Type size={14} />
              <span>Title only</span>
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-200/50 transition-colors">
              <User size={14} />
              <span>Created by</span>
              <ChevronDown size={12} className="opacity-50" />
            </button>
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm text-gray-500 hover:bg-gray-200/50 transition-colors">
              <FileText size={14} /> {/* Using FileText as proxy for 'In' context */}
              <span>In</span>
              <ChevronDown size={12} className="opacity-50" />
            </button>

            {/* Date Filter (Functional) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCalendar(!showCalendar);
                  if (!filterDate) {
                    const d = new Date();
                    setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                  }
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-sm transition-colors ${filterDate ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-200/50'}`}
              >
                <Calendar size={14} />
                <span>{filterDate ? format(new Date(filterDate), 'MMM d') : 'Date'}</span>
                <ChevronDown size={12} className="opacity-50" />
              </button>

              {/* Calendar Popup */}
              {showCalendar && (
                <div ref={calendarRef} className="absolute top-full mt-2 left-0 w-64 bg-white rounded-xl shadow-xl border border-gray-100 ring-1 ring-black/5 z-50 flex flex-col font-sans animate-in fade-in zoom-in-95 duration-100">

                  {/* Shortcuts Header */}
                  <div className="p-2 border-b border-gray-100 space-y-0.5">
                    <div className="flex items-center justify-between px-2 py-1 mb-1">
                      <button className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors">
                        <span>Last edited</span>
                        <ChevronDown size={10} />
                      </button>
                      {filterDate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterDate('');
                            setShowCalendar(false);
                          }}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {[
                      { label: 'Today', val: new Date() },
                      { label: 'Last 7 days', val: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Approximate logic for demo
                      { label: 'Last 30 days', val: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setFilterDate(format(opt.val, 'yyyy-MM-dd'));
                          setShowCalendar(false);
                        }}
                        className="w-full text-left text-[13px] py-1.5 px-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Calendar Section */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="font-semibold text-sm text-gray-800 ml-1">
                        {format(calendarMonth, 'MMM yyyy')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-[11px] text-gray-400 mb-2 text-center font-medium">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <div key={d} className="h-6 flex items-center justify-center">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-xs text-center">
                      {(() => {
                        const year = calendarMonth.getFullYear();
                        const month = calendarMonth.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const prevDays = new Date(year, month, 0).getDate();
                        const cells = [];

                        // previous month's tail
                        for (let i = firstDay - 1; i >= 0; i--) {
                          const dayNum = prevDays - i;
                          cells.push({ day: dayNum, inCurrent: false, date: new Date(year, month - 1, dayNum) });
                        }

                        // current month
                        for (let d = 1; d <= daysInMonth; d++) {
                          cells.push({ day: d, inCurrent: true, date: new Date(year, month, d) });
                        }

                        // next month's head
                        while (cells.length % 7 !== 0) {
                          const nextDay = cells.length - (firstDay + daysInMonth) + 1;
                          cells.push({ day: nextDay, inCurrent: false, date: new Date(year, month + 1, nextDay) });
                        }

                        return cells.map((c, idx) => {
                          const dateStr = format(c.date, 'yyyy-MM-dd');
                          const selected = filterDate === dateStr;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setFilterDate(dateStr);
                                setShowCalendar(false);
                              }}
                              className={`
                                h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200
                                ${c.inCurrent ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'}
                                ${selected ? '!bg-[#EB5757] !text-white shadow-sm font-medium hover:!bg-[#D94545]' : ''}
                              `}
                            >
                              {c.day}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(query || filterDate) && (
              <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {results.length > 0 ? (
              <div className="pb-2">
                {groupsOrder.map(group => {
                  const groupItems = groupedResults[group];
                  if (!groupItems || groupItems.length === 0) return null;

                  return (
                    <div key={group} className="mb-4">
                      <h3 className="px-3 mb-1.5 text-xs font-semibold text-gray-500/80">{group}</h3>
                      <div className="space-y-0.5">
                        {groupItems.map(note => (
                          <div
                            key={note._id}
                            onClick={() => handleNavigate(note._id)}
                            className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#EFEFEE] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-gray-400">
                                {note.icon ? note.icon : <FileText size={18} strokeWidth={1.5} />}
                              </div>
                              <span className="text-[14px] text-gray-700 font-medium truncate group-hover:text-gray-900">
                                {note.title || "Untitled"}
                              </span>
                            </div>

                            <div className="flex items-center text-gray-400">
                              {/* Show arrow on group hover, else maybe date? The image shows an enter icon-like arrow */}
                              <CornerDownLeft size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Search size={32} className="text-gray-200 mb-3" />
                <p className="text-gray-500 text-sm">No results found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#FBFAF9] px-4 py-2 border-t border-gray-200/60 flex justify-between items-center text-[11px] text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ArrowUpDown size={12} className="text-gray-400" />
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <CornerDownLeft size={12} className="text-gray-400" />
                <span>Open</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-gray-400">Ctrl+↵</span>
                <span>Open in new tab</span>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span>UniVerse Search</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SearchModal;