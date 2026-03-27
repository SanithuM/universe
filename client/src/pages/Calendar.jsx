import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isSameMonth, addDays,
  addMonths, subMonths, parseISO, isToday, addHours, differenceInMinutes, setHours
} from 'date-fns';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, Bars3Icon, TrashIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/20/solid';
import api from '../api/axios';

const Calendar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // --- STATE MANAGEMENT ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'month', 'week', '3day', 'day'
  const [selectedEvent, setSelectedEvent] = useState(null); // For Right Sidebar

  // Data State
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', startTime: '', endTime: '', type: 'Study', participantEmail: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
      } catch (e) {
        // Fallback or ignore
      }

      const [eventRes, assignRes] = await Promise.all([
        api.get('/events'),
        api.get('/assignments')
      ]);
      setEvents(eventRes.data);
      setAssignments(assignRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- ACTIONS ---
  const handleAddOrUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      if (newEvent.type === 'Meeting' && !newEvent.participantEmail) {
        alert("Please enter an email to invite."); return;
      }

      if (isEditing && newEvent._id) {
        // Update existing
        await api.put(`/events/${newEvent._id}`, newEvent);
      } else {
        // Create new
        await api.post('/events', newEvent);
      }

      setShowModal(false);
      setIsEditing(false);
      setNewEvent({ title: '', description: '', startTime: '', endTime: '', type: 'Study', participantEmail: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save event");
    }
  };

  const toggleEventCompletion = async (event) => {
    try {
      const updatedStatus = !event.isCompleted;
      // Optimistic update
      const updatedEvents = events.map(e => e._id === event._id ? { ...e, isCompleted: updatedStatus } : e);
      setEvents(updatedEvents);
      if (selectedEvent && selectedEvent._id === event._id) {
        setSelectedEvent({ ...selectedEvent, isCompleted: updatedStatus });
      }

      // API Call (Assuming endpoint supports this, otherwise just local update is shown)
      await api.put(`/events/${event._id}`, { ...event, isCompleted: updatedStatus });
    } catch (err) {
      console.error("Failed to toggle completion", err);
      fetchData(); // Revert on error
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      setSelectedEvent(null);
      fetchData();
    } catch (err) {
      alert("Failed to delete event");
    }
  }

  const openEditModal = (event) => {
    setNewEvent({
      _id: event._id,
      title: event.title,
      description: event.description || '',
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      participantEmail: event.participantEmail || ''
    });
    setIsEditing(true);
    setShowModal(true);
  }

  const getItemsForDay = (day) => {
    const dayEvents = events.filter(e => isSameDay(parseISO(e.startTime), day));
    const dayAssignments = assignments.filter(a => isSameDay(parseISO(a.dueDate), day));

    // Normalize assignments to have consistent start/end times for the grid
    const processedAssignments = dayAssignments.map(a => {
      const start = parseISO(a.dueDate);
      // Default to 1 hour duration for visualization if no end time concept exists for due date
      const end = addHours(start, 1);
      return {
        ...a,
        isAssignment: true,
        title: a.title || a.courseName || "Assignment",
        startTime: a.dueDate,
        endTime: end.toISOString()
      };
    });

    return [...dayEvents.map(e => ({ ...e, isEvent: true })), ...processedAssignments]
      .sort((a, b) => parseISO(a.startTime) - parseISO(b.startTime));
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-400 dark:text-gray-300">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-white font-sans text-[#37352f] overflow-hidden selection:bg-[#cce9ff] dark:bg-[#191919] dark:text-gray-100">

      {/* === HEADER === */}
      <header className="px-4 py-3 flex justify-between items-center bg-white shrink-0 border-b border-transparent hover:border-gray-100 transition-colors z-20 dark:bg-[#191919] dark:text-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/app')} className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition mr-2 dark:text-gray-300 dark:hover:bg-[#2C2C2C] dark:hover:text-gray-100" title="Back to Dashboard">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
              {format(currentMonth, 'MMMM yyyy')}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-500 dark:text-gray-300 dark:hover:bg-[#2C2C2C]"><ChevronLeftIcon className="w-5 h-5" /></button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-500 dark:text-gray-300 dark:hover:bg-[#2C2C2C]"><ChevronRightIcon className="w-5 h-5" /></button>
            <button
              onClick={() => { setSelectedDate(new Date()); setCurrentMonth(new Date()); }}
              className="ml-2 px-3 py-1 text-sm font-medium border border-gray-200 rounded hover:bg-gray-50 text-gray-700 transition dark:bg-[#1F1F1F] dark:border-gray-700 dark:hover:bg-[#2C2C2C] dark:text-gray-100"
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Menu as="div" className="relative">
            <Menu.Button className="px-3 py-1.5 text-sm font-medium bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 flex items-center gap-2 transition dark:bg-[#1F1F1F] dark:border-gray-700 dark:hover:bg-[#2C2C2C] dark:text-gray-100">
              <span className="capitalize">{viewMode === '3day' ? '3 Days' : viewMode}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Menu.Items className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 focus:outline-none py-1 z-50 dark:bg-[#1F1F1F] dark:border-gray-700 dark:text-gray-100">
                {['month', 'week', '3day', 'day'].map(mode => (
                  <Menu.Item key={mode}>
                    {({ active }) => (
                      <button onClick={() => setViewMode(mode)} className={`${active ? 'bg-gray-50' : ''} block w-full text-left px-4 py-2 text-sm capitalize text-gray-700`}>
                        {mode === '3day' ? '3 Days' : mode}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Transition>
          </Menu>

          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden text-gray-500 flex items-center justify-center cursor-pointer hover:ring-2 ring-gray-100 transition dark:bg-[#2C2C2C] dark:border-gray-700 dark:text-gray-200">
            {user?.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <span className="text-xs font-semibold">U</span>}
          </div>
        </div>
      </header>

      {/* === BODY === */}
      <div className="flex-1 flex overflow-hidden">

        {/* --- LEFT SIDEBAR --- */}
        <aside className="w-[260px] shrink-0 bg-[#F7F7F5] flex flex-col border-r border-gray-200 md:flex dark:bg-[#202020] dark:border-gray-700">
          <div className="p-4">
            <MiniCalendar
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider pl-1 dark:text-gray-400">Calendars</p>
              <SidebarItem color="bg-blue-500" label="Study" active />
              <SidebarItem color="bg-purple-500" label="Meeting" active />
              <SidebarItem color="bg-red-500" label="Assignment Due" active />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider pl-1 dark:text-gray-400">Other</p>
              <SidebarItem color="bg-yellow-500" label="Personal" active />
              <SidebarItem color="bg-orange-500" label="Kids" />
              <SidebarItem color="bg-gray-400" label="Holidays" icon />
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => {
              setNewEvent({ title: '', description: '', startTime: '', endTime: '', type: 'Study', participantEmail: '' });
              setIsEditing(false);
              setShowModal(true);
            }} className="w-full py-2 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded shadow-sm text-sm font-medium hover:bg-gray-50 transition text-gray-700 dark:bg-[#1F1F1F] dark:border-gray-700 dark:hover:bg-[#2C2C2C] dark:text-gray-100">
              <span>+</span> Add new event
            </button>
          </div>
        </aside>

        {/* --- MAIN CALENDAR AREA --- */}
        <main className="flex-1 flex flex-col relative bg-white overflow-hidden dark:bg-[#191919] dark:text-gray-100">
          {viewMode === 'month' ? (
            <MonthView
              currentMonth={currentMonth}
              getItemsForDay={getItemsForDay}
              selectedDate={selectedDate}
              onEventClick={setSelectedEvent}
            />
          ) : (
            <TimeGridView
              viewMode={viewMode} // week, 3day, day
              selectedDate={selectedDate}
              getItemsForDay={getItemsForDay}
              onEventClick={setSelectedEvent}
              onSlotClick={(date) => {
                setNewEvent(prev => ({
                  ...prev,
                  startTime: format(date, "yyyy-MM-dd'T'HH:mm"),
                  endTime: format(addHours(date, 1), "yyyy-MM-dd'T'HH:mm")
                }));
                setIsEditing(false);
                setShowModal(true);
              }}
            />
          )}
        </main>

        {/* --- RIGHT SIDEBAR (UPDATED) --- */}
        <aside className="w-[300px] shrink-0 bg-white border-l border-gray-200 hidden lg:flex flex-col dark:bg-[#191919] dark:border-gray-700 dark:text-gray-100">
          {/* Search Bar */}
          <div className="p-4 pb-2 border-b border-transparent focus-within:border-gray-100 transition">
            <div className="relative group">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 group-hover:text-gray-600 transition dark:text-gray-300" />
              <input
                type="text"
                placeholder="Find anything..."
                className="w-full bg-[#F7F7F5] border-none rounded-md py-2 pl-9 pr-4 text-sm focus:ring-1 focus:ring-gray-300 placeholder-gray-400 transition dark:bg-[#2C2C2C] dark:placeholder-gray-400 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!selectedEvent ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 dark:bg-[#2C2C2C]">
                  <span className="text-xl">📅</span>
                </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No event selected</p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Select an event on the calendar to see details or edit.</p>
              </div>
            ) : (
              <div className="p-5 animate-in fade-in duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Checkbox for Done */}
                    <div
                        onClick={() => toggleEventCompletion(selectedEvent)}
                        className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition
                                      ${selectedEvent.isCompleted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300 hover:border-gray-400 dark:bg-[#1F1F1F] dark:border-gray-700 dark:hover:border-gray-500'}`}
                    >
                      {selectedEvent.isCompleted && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded
                                ${selectedEvent.isAssignment ? 'bg-red-100 text-red-700' :
                        selectedEvent.type === 'Meeting' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {selectedEvent.isAssignment ? 'Assignment' : selectedEvent.type}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditModal(selectedEvent)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition dark:text-gray-300 dark:hover:bg-[#2C2C2C] dark:hover:text-gray-100"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteEvent(selectedEvent._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition dark:text-gray-300 dark:hover:bg-[#2C2C2C] dark:hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                  </div>
                </div>

                <h2 className={`text-xl font-bold leading-tight mb-2 ${selectedEvent.isCompleted ? 'line-through text-gray-400 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                  {selectedEvent.title}
                </h2>

                <div className="text-sm text-gray-600 mb-6 flex flex-col gap-1 dark:text-gray-400">
                  <div className="font-medium">
                    {format(parseISO(selectedEvent.startTime || selectedEvent.dueDate), 'EEEE, MMMM do')}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {selectedEvent.startTime ? (
                      `${format(parseISO(selectedEvent.startTime), 'h:mm a')} - ${format(parseISO(selectedEvent.endTime), 'h:mm a')}`
                    ) : 'All Day'}
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">Description</h3>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap dark:text-gray-100">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.type === 'Meeting' && (selectedEvent.participants?.length > 0 || selectedEvent.participantEmail) && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 text-purple-600 dark:text-gray-400">Participants</h3>

                    {/* Check for populated participants array */}
                    {selectedEvent.participants && selectedEvent.participants.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {selectedEvent.participants.map((p, i) => (
                          <div key={p._id || i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 dark:hover:bg-[#2C2C2C] dark:border-transparent dark:hover:border-gray-700">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-100 to-blue-100 border border-gray-200 overflow-hidden shrink-0">
                              {p.profilePic ? (
                                <img src={p.profilePic} alt={p.username} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500">
                                  {(p.username || p.email || "?").charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-gray-900 truncate dark:text-gray-100">{p.username || "Guest User"}</span>
                              {p.email && <span className="text-xs text-gray-500 truncate dark:text-gray-400">{p.email}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Fallback if only email string is available */
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 dark:bg-[#2C2C2C] dark:border-gray-700">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 border border-purple-200 dark:bg-purple-100">
                          {selectedEvent.participantEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 truncate dark:text-gray-100">{selectedEvent.participantEmail}</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedEvent.isAssignment && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-sm text-red-800">
                    Create a plan for this assignment to break it down.
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

      </div>

      {/* === MODAL === */}
      {showModal && (
        <CreateEventModal
          showModal={showModal} setShowModal={setShowModal}
          newEvent={newEvent} setNewEvent={setNewEvent}
          handleAddEvent={handleAddOrUpdateEvent}
          isEditing={isEditing}
        />
      )}

    </div>
  );
};

// =======================
// SUB COMPONENTS
// =======================

const SidebarItem = ({ color, label, active, icon }) => (
  <div className="flex items-center gap-3 py-1 px-2 rounded hover:bg-gray-100 cursor-pointer group transition">
    <div className={`w-3 h-3 rounded box-border ${active ? color : 'border-2 border-gray-300'}`}>
      {icon && <Bars3Icon className="w-full h-full text-gray-400" />}
    </div>
    <span className={`text-sm truncate ${active ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>{label}</span>
  </div>
);


// --- MINI CALENDAR ---
const MiniCalendar = ({ currentMonth, setCurrentMonth, selectedDate, setSelectedDate }) => {
  const monthStart = startOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const days = eachDayOfInterval({ start: startDate, end: endOfWeek(endOfMonth(monthStart)) });

  return (
    <div className="select-none">
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{format(currentMonth, 'MMMM yyyy')}</span>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-gray-400 font-medium dark:text-gray-400">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          return (
            <button key={i}
              onClick={() => { setSelectedDate(day); setCurrentMonth(day); }}
              className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-xs transition relative
                      ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                      ${isSelected ? 'bg-red-500 text-white font-semibold shadow-sm' : 'hover:bg-gray-200'}
                      ${today && !isSelected ? 'text-red-500 font-bold' : ''}
                   `}
            >
              {format(day, 'd')}
            </button>
            
          )
        })}
      </div>
    </div>
  )
}

// --- MONTH VIEW ---
const MonthView = ({ currentMonth, getItemsForDay, selectedDate, onEventClick }) => {
  const monthStart = startOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const days = eachDayOfInterval({ start: startDate, end: endOfWeek(endOfMonth(monthStart)) });

  return (
    <div className="h-full grid grid-cols-7 grid-rows-5 border-l border-gray-200 bg-gray-200 gap-px dark:bg-[#0f0f0f]">
      {days.slice(0, 35).map((day, i) => {
        const items = getItemsForDay(day);
        const isCurrentMonth = isSameMonth(day, currentMonth);
        return (
          <div key={i} className={`bg-white p-2 flex flex-col gap-1 transition-colors hover:bg-gray-50 cursor-default dark:bg-[#101010] dark:hover:bg-[#1f1f1f] ${!isCurrentMonth ? 'bg-gray-50 dark:bg-[#0b0b0b]' : ''}`}>
            <div className={`text-right text-xs font-semibold mb-1 ${isToday(day) ? 'text-red-500' : 'text-gray-500'} dark:text-gray-300`}>
              {format(day, 'd')}
            </div>
            {items.slice(0, 4).map((item, idx) => (
              <div key={idx}
                onClick={(e) => { e.stopPropagation(); onEventClick(item); }}
                className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium cursor-pointer transition
                        ${item.isCompleted ? 'bg-gray-100 text-gray-400 line-through' :
                    item.type === 'Meeting' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' :
                      item.isAssignment ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'} dark:bg-[#1F1F1F] dark:text-gray-100` }>
                {item.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

// --- TIME GRID VIEW (Week/Day/3Day) ---
const TimeGridView = ({ viewMode, selectedDate, getItemsForDay, onSlotClick, onEventClick }) => {
  let daysToShow = [];
  const start = startOfWeek(selectedDate);
  if (viewMode === 'week') daysToShow = eachDayOfInterval({ start, end: addDays(start, 6) });
  else if (viewMode === '3day') daysToShow = [selectedDate, addDays(selectedDate, 1), addDays(selectedDate, 2)];
  else if (viewMode === 'day') daysToShow = [selectedDate];

  // Configuration
  const HOUR_HEIGHT = 60; // px
  const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-[#0b0b0b]">
      {/* Grid Header */}
      <div className="flex border-b border-gray-200 bg-white ml-14 shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)] z-10 dark:bg-[#0f0f0f] dark:border-gray-700">
        {daysToShow.map((day, i) => (
          <div key={i} className="flex-1 text-center py-3 border-l first:border-l-0 border-gray-100 transition hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:hover:bg-[#1f1f1f]">
            <div className={`text-xs uppercase font-medium mb-1 ${isToday(day) ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400`}>{format(day, 'EEE')}</div>
            <div className={`text-xl font-normal w-8 h-8 flex items-center justify-center mx-auto rounded-full ${isToday(day) ? 'bg-red-500 text-white shadow-sm' : 'text-gray-800 dark:text-gray-100'}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
        <div className="w-2 shrink-0"></div> {/* Scrollbar spacer */}
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar flex">
        {/* Time Axis Sidebar */}
        <div className="w-14 flex-shrink-0 bg-white right-0 text-right pr-2 select-none border-r border-gray-100 dark:bg-[#0b0b0b] dark:border-gray-700" style={{ height: TOTAL_HEIGHT }}>
          {hours.map(h => (
            <div key={h} className="relative text-xs text-gray-400 font-medium" style={{ height: HOUR_HEIGHT }}>
              {/* Label positioned to center on the grid line (which is at the top of this slot) */}
              {h !== 0 && (
                <span className="absolute -top-2.5 right-2 bg-white px-1 z-10 dark:bg-[#0b0b0b] dark:text-gray-400">
                  {format(setHours(new Date(), h), 'h a')}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Days Columns Container */}
        <div className="flex flex-1 relative" style={{ height: TOTAL_HEIGHT }}>

          {/* Background Grid Lines (Absolute overlay to guarantee sync) */}
          <div className="absolute inset-0 pointer-events-none z-0 flex flex-col">
            {hours.map(h => (
              <div key={h} className="w-full border-t border-gray-100/50 dark:border-gray-700/40" style={{ height: HOUR_HEIGHT }}></div>
            ))}
          </div>

          {/* Active Days Columns */}
          {daysToShow.map((day, dayIndex) => {
            const items = getItemsForDay(day);
            return (
              <div key={dayIndex} className="flex-1 relative border-l border-gray-100/50 z-10 h-full dark:border-gray-700/40" onClick={() => onSlotClick(day)}>
                {/* Events */}
                {items.map((item, idx) => {
                  if (!item.startTime) return null;
                  const eventStart = parseISO(item.startTime);
                  const eventEnd = parseISO(item.endTime);
                  const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
                  const durationMinutes = differenceInMinutes(eventEnd, eventStart);

                  const top = (startMinutes * HOUR_HEIGHT) / 60;
                  const height = Math.max((durationMinutes * HOUR_HEIGHT) / 60, 26); // Min height ensuring readability

                  return (
                    <div key={idx}
                      className={`absolute inset-x-1 rounded px-2 py-1 text-xs border-l-2 shadow-sm overflow-hidden z-20 cursor-pointer transition-all hover:brightness-95 group
                                   ${item.isCompleted ? 'bg-gray-100 border-gray-300 text-gray-400 grayscale opacity-70' :
                          item.type === 'Meeting' ? 'bg-purple-50 border-purple-500 text-purple-900' :
                            item.isAssignment ? 'bg-red-50 border-red-500 text-red-900' : 'bg-blue-50 border-blue-500 text-blue-900'} dark:bg-[#1F1F1F] dark:text-gray-100`}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      onClick={(e) => { e.stopPropagation(); onEventClick(item); }}
                    >
                      <div className={`font-semibold truncate leading-tight ${item.isCompleted ? 'line-through' : ''}`}>
                        {item.isAssignment ? `DUE: ${item.title}` : item.title}
                      </div>
                      <div className="text-[10px] opacity-80 truncate flex gap-1">
                        <span>{format(eventStart, 'h:mm a')}</span>
                        <span>-</span>
                        <span>{format(eventEnd, 'h:mm a')}</span>
                      </div>
                    </div>
                  )
                })}

                {/* Current Time Indicator */}
                {isToday(day) && (
                  <div className="absolute w-full border-t border-red-500 z-30 pointer-events-none flex items-center"
                    style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) * HOUR_HEIGHT / 60}px` }}>
                    <div className="w-2 h-2 bg-red-500 rounded-full -ml-1"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- MODAL REUSED ---
const CreateEventModal = ({ showModal, setShowModal, newEvent, setNewEvent, handleAddEvent, isEditing }) => {
  return (
    <Transition appear show={showModal} as={Fragment}>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          </Transition.Child>

          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{isEditing ? 'Edit Event' : 'New Event'}</h3>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <input autoFocus type="text" placeholder="Event Title" className="w-full text-xl font-semibold border-b border-gray-200 focus:border-red-500 outline-none pb-2 placeholder-gray-300"
                  value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />

                <div className="flex gap-2">
                  {['Study', 'Meeting'].map(t => (
                    <button key={t} type="button" onClick={() => setNewEvent({ ...newEvent, type: t })}
                      className={`flex-1 py-1 text-sm rounded border ${newEvent.type === t ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Start</label>
                    <input type="datetime-local" className="w-full bg-gray-50 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      value={newEvent.startTime} onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })} required />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">End</label>
                    <input type="datetime-local" className="w-full bg-gray-50 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                      value={newEvent.endTime} onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })} required />
                  </div>
                </div>

                {newEvent.type === 'Meeting' && (
                  <div>
                    <input type="email" placeholder="Add guest email" className="w-full bg-transparent border-b border-gray-200 text-sm py-1 outline-none focus:border-purple-500"
                      value={newEvent.participantEmail} onChange={e => setNewEvent({ ...newEvent, participantEmail: e.target.value })} />
                  </div>
                )}

                <textarea placeholder="Description / Notes" rows={3} className="w-full bg-gray-50 rounded p-2 text-sm outline-none resize-none"
                  value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />

                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded font-medium shadow-sm">Save Event</button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition>
  )
}

export default Calendar;