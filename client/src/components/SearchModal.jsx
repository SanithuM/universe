import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Calendar, Clock, ChevronDown, Check } from 'lucide-react';
import { Listbox, Transition } from '@headlessui/react';
import { format } from 'date-fns';
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

  const sortOptions = [
    { id: 'newest', name: 'Newest first' },
    { id: 'oldest', name: 'Oldest first' },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-200">

      {/* Modal Box */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] ring-1 ring-black/5">

        {/* Search Header */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-4">
          <Search className="text-gray-400" size={22} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search your notes..."
            className="flex-1 text-xl outline-none placeholder:text-gray-300 text-gray-800 bg-transparent font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="px-5 py-3 bg-white border-b border-gray-50 flex flex-wrap items-center gap-3">

          {/* Custom Sort Select (Headless UI) */}
          <Listbox value={sortOrder} onChange={setSortOrder}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-gray-50 py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-100 transition-all sm:text-sm sm:leading-6 min-w-[140px]">
                <span className="block truncate font-medium text-gray-700">
                  {sortOptions.find(opt => opt.id === sortOrder)?.name}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {sortOptions.map((opt) => (
                    <Listbox.Option
                      key={opt.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                        }`
                      }
                      value={opt.id}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {opt.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                              <Check className="h-4 w-4" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {/* Styled Date Picker */}
          <div className="relative group">
            <div
              onClick={() => {
                setShowCalendar((s) => !s);
                // ensure calendar shows month of currently selected date
                const d = filterDate ? new Date(filterDate) : new Date();
                setCalendarMonth(new Date(d.getFullYear(), d.getMonth(), 1));
              }}
              className={`
              cursor-pointer flex items-center gap-2 px-3 py-2 pr-8 rounded-lg border shadow-sm text-sm font-medium transition-all
              ${filterDate
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                }
            `}>
              <Calendar size={16} className={filterDate ? 'text-blue-500' : 'text-gray-400'} />
              <span className="block truncate">
                {filterDate ? format(new Date(filterDate), 'MMM d, yyyy') : 'All time'}
              </span>
              <span className="absolute inset-y-0 right-3 flex items-center z-20 cursor-pointer">
                <ChevronDown className={filterDate ? 'h-4 w-4 text-blue-500' : 'h-4 w-4 text-gray-400'} aria-hidden="true" />
              </span>
              {filterDate && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFilterDate('');
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-blue-100 text-blue-500 transition-colors z-20"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Calendar Popup */}
            {showCalendar && (
              <div ref={calendarRef} className="absolute top-full mt-2 left-0 w-56 bg-white rounded-lg shadow-xl border ring-1 ring-black/5 z-50 p-2">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Previous month"
                  >
                    <span className="text-gray-500 text-base">‹</span>
                  </button>
                  <div className="font-semibold text-xs text-gray-700">{format(calendarMonth, 'MMM yyyy')}</div>
                  <button
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Next month"
                  >
                    <span className="text-gray-500 text-base">›</span>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-0.5 text-[10px] text-gray-400 mb-1 text-center font-medium uppercase tracking-wide">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5 text-xs text-center">
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

                    // next month's head to fill grid (optional)
                    while (cells.length % 7 !== 0) {
                      const nextDay = cells.length - (firstDay + daysInMonth) + 1;
                      cells.push({ day: nextDay, inCurrent: false, date: new Date(year, month + 1, nextDay) });
                    }

                    return cells.map((c, idx) => {
                      const iso = c.date.toISOString().split('T')[0];
                      const selected = filterDate === iso;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const isoDate = c.date.toISOString().split('T')[0];
                            setFilterDate(isoDate);
                            setShowCalendar(false);
                          }}
                          className={`
                            h-7 w-7 rounded-md flex items-center justify-center transition-colors
                            ${c.inCurrent ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300'}
                            ${selected ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : ''}
                          `}
                        >
                          <div className={`${selected ? 'font-semibold' : 'font-normal'}`}>{c.day}</div>
                        </button>
                      );
                    });
                  })()}
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
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-full mb-3"></div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {/* Category Label */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>{query ? 'Matches' : 'Recently edited'}</span>
              </div>

              {results.map(note => (
                <div
                  key={note._id}
                  onClick={() => handleNavigate(note._id)}
                  className="flex items-center gap-4 px-4 py-3 mx-2 hover:bg-gray-50 cursor-pointer rounded-xl group transition-all duration-200 border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-sm text-xl transition-all">
                    {note.icon ? note.icon : <FileText size={18} className="text-gray-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="font-medium text-gray-800 group-hover:text-blue-600 truncate transition-colors text-base">
                        {note.title || "Untitled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1 group-hover:text-gray-500 transition-colors">
                        <Clock size={12} />
                        {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                      </span>
                      {note.tags && note.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{note.tags.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No results found</p>
              {(filterDate || query) && <p className="text-sm mt-1 text-gray-400">Try adjusting your filters</p>}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-sans shadow-sm">esc</kbd>
              to close
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] font-sans shadow-sm">↵</kbd>
              to select
            </span>
          </div>
          <span className="font-medium text-gray-300">UniVerse</span>
        </div>

      </div>
    </div>
  );
};

export default SearchModal;