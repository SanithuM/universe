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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">📝 Add New Assignment</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Task Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Final Dissertation"
              className="w-full p-2 border rounded mt-1"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Course Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Computer Science"
              className="w-full p-2 border rounded mt-1"
              value={formData.courseName}
              onChange={e => setFormData({...formData, courseName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input 
                required
                type="date" 
                className="w-full p-2 border rounded mt-1"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (%)</label>
              <input 
                required
                type="number" 
                min="1" max="100"
                className="w-full p-2 border rounded mt-1"
                value={formData.academicWeight}
                onChange={e => setFormData({...formData, academicWeight: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 font-semibold"
            >
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm;