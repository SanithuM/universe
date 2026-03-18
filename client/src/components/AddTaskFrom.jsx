import { useState } from 'react';
import api from '../api/axios';

const AddTaskForm = ({ onTaskAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    courseName: '',
    dueDate: '',
    academicWeight: 50 // Default to middle weight
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/assignments', formData);
      onTaskAdded(); // Tell parent to refresh the list
    } catch (err) {
      alert('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#191919] p-6 text-left align-middle shadow-xl transition-all relative">
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300 mb-6">New Assignment</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <input
              autoFocus
              required
              type="text"
              placeholder="Assignment Title"
              className="w-full text-xl font-semibold border-b border-gray-200 focus:border-blue-500 outline-none pb-2 placeholder-gray-300 dark:placeholder-[#3d3c3c] transition-colors"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Course Name Input */}
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Course</label>
            <input
              required
              type="text"
              placeholder="e.g. Computer Science"
              className="w-full bg-gray-50 dark:bg-[#2a2a2a] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
              value={formData.courseName}
              onChange={e => setFormData({ ...formData, courseName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Due Date</label>
              <input
                required
                type="date"
                className="w-full bg-gray-50 dark:bg-[#2a2a2a] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-700 dark:text-gray-400"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Weight (%)</label>
              <input
                required
                type="number"
                min="1" max="100"
                className="w-full bg-gray-50 dark:bg-[#2a2a2a] rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all text-gray-700 dark:text-gray-400"
                value={formData.academicWeight}
                onChange={e => setFormData({ ...formData, academicWeight: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Save Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm;