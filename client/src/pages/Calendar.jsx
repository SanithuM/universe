import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import api from '../api/axios';

const Calendar = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]); // Study Plans
    const [assignments, setAssignments] = useState([]); // Deadlines
    const [loading, setLoading] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '', type: 'Study' });

    // Fetch Data
    const fetchData = async () => {
        try {
            const [eventRes, assignRes] = await Promise.all([
                api.get('/events'),
                api.get('/assignments')
            ]);
            setEvents(eventRes.data);
            setAssignments(assignRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Generate Week Days
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    // Handle Add Event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', newEvent);
            setShowModal(false);
            setNewEvent({ title: '', startTime: '', endTime: '', type: 'Study' });
            fetchData();
        } catch (err) {
            alert("Failed to add event");
        }
    };

    // Helper to render events for a specific day
    const renderEventsForDay = (day) => {
        // Study Plans
        const dayEvents = events.filter(e => isSameDay(parseISO(e.startTime), day));

        // Assignment Deadlines
        const dayAssignments = assignments.filter(a => isSameDay(parseISO(a.dueDate), day));

        return (
            <div className="space-y-2 mt-2">
                {/* Render Assignments (Red/Orange) */}
                {dayAssignments.map(task => (
                    <div key={task._id} className="p-2 bg-red-50 border-l-4 border-red-500 rounded text-xs">
                        <div className="font-bold text-red-700">⚠️ DUE: {task.title}</div>
                        <div className="text-red-400">{task.courseName}</div>
                    </div>
                ))}

                {/* Render Study Plans (Blue/Green) */}
                {dayEvents.map(event => (
                    <div key={event._id} className="p-2 bg-blue-50 border-l-4 border-blue-400 rounded text-xs shadow-sm">
                        <div className="font-bold text-gray-700">{format(parseISO(event.startTime), 'HH:mm')} - {event.title}</div>
                        <div className="text-gray-500">{event.type}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-[#37352f]">

            {/* Header */}
            <div className="px-8 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/app')} className="text-gray-500 hover:text-black">← Dashboard</button>
                    <h1 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm font-medium transition"
                >
                    + Add Plan
                </button>
            </div>

            {/* Calendar Grid (Weekly View) */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="grid grid-cols-7 gap-4 h-full min-h-[600px]">
                    {weekDays.map((day, i) => (
                        <div key={i} className="flex flex-col h-full border-r border-gray-100 last:border-0">
                            {/* Day Header */}
                            <div className="text-center mb-4 pb-2 border-b border-gray-100">
                                <p className="text-xs text-gray-400 uppercase font-semibold">{format(day, 'EEE')}</p>
                                <div className={`text-2xl font-light w-10 h-10 mx-auto flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-red-500 text-white' : 'text-gray-800'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>

                            {/* Events Area */}
                            <div className="flex-1 bg-gray-50/30 rounded-lg p-2 min-h-[200px]">
                                {renderEventsForDay(day)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">📅 Plan Your Day</h2>
                        <form onSubmit={handleAddEvent} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                <input
                                    type="text" required placeholder="e.g. Study Math Chapter 4"
                                    className="w-full p-2 border rounded mt-1 outline-none focus:border-blue-500"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
                                    <input
                                        type="datetime-local" required
                                        className="w-full p-2 border rounded mt-1 text-sm"
                                        value={newEvent.startTime}
                                        onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">End Time</label>
                                    <input
                                        type="datetime-local" required
                                        className="w-full p-2 border rounded mt-1 text-sm"
                                        value={newEvent.endTime}
                                        onChange={e => setNewEvent({ ...newEvent, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">Save Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;