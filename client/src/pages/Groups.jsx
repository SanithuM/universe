import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Menu, X } from "lucide-react";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Inputs
  const [joinCode, setJoinCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch My Groups
  useEffect(() => {
    fetchGroups();
  }, []);

  // Initialize sidebar visibility based on screen size and update on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Handle Create group
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/groups/create', { name: newGroupName });
      setShowCreate(false);
      setNewGroupName('');
      fetchGroups(); // Refresh list
    } catch (err) {
      alert("Failed to create group");
    }
  };

  // Handle Join group
  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/groups/join', { inviteCode: joinCode });
      setShowJoin(false);
      setJoinCode('');
      fetchGroups(); // Refresh list
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to join group";
      alert(message);
    }
  };

  
  return (
    <div className="flex h-screen w-full bg-white font-sans text-[#37352f]">
      <Sidebar isOpen={isSidebarOpen} onAddTask={() => navigate('/app')} />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Mobile Toggle */}
        <div className="absolute top-4 left-4 z-10 md:hidden">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-200 rounded text-gray-500">
            {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">🤝 Collaborative Spaces</h1>
                <p className="text-gray-500">Manage projects with your friends.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div
                onClick={() => setShowCreate(true)}
                className="p-6 bg-indigo-600 rounded-xl shadow-lg cursor-pointer transform transition hover:scale-[1.02] text-white flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold">Create New Team</h3>
                  <p className="text-indigo-200 text-sm mt-1">Start a new project and invite others.</p>
                </div>
                <span className="text-4xl">+</span>
              </div>

              <div
                onClick={() => setShowJoin(true)}
                className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-700">Join Existing Team</h3>
                  <p className="text-gray-500 text-sm mt-1">Have a code? Enter it here.</p>
                </div>
                <span className="text-4xl text-gray-300">→</span>
              </div>
            </div>

            {/* Groups Grid */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Teams</h2>
            {loading ? (
              <div>Loading spaces...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <div key={group._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {group.name.charAt(0)}
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">
                        {group.inviteCode}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{group.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{group.members.length} Members</p>
                    <button
                      onClick={() => navigate(`/groups/${group._id}`)}
                      className="w-full py-2 text-indigo-600 bg-indigo-50 rounded-lg text-sm font-semibold hover:bg-indigo-100"
                    >
                      Open Space
                    </button>
                  </div>
                ))}
                {groups.length === 0 && (
                  <div className="col-span-full text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                    You haven't joined any teams yet.
                  </div>
                )}
              </div>
            )}

            {/* MODAL: Create Group */}
            {showCreate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Name your Team</h3>
                  <form onSubmit={handleCreate}>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. Project Alpha"
                      className="w-full p-3 border rounded-lg mb-4"
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
                      <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Create</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: Join Group */}
            {showJoin && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Enter Invite Code</h3>
                  {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                  <form onSubmit={handleJoin}>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. X7K9P2"
                      className="w-full p-3 border rounded-lg mb-4 font-mono uppercase tracking-widest text-center text-xl"
                      maxLength={6}
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      required
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowJoin(false)} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
                      <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Join Team</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Groups;