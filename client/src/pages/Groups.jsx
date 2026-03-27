import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import { Menu, X } from "lucide-react";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Inputs
  const [joinCode, setJoinCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupImageUrl, setNewGroupImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [isInvalidNew, setIsInvalidNew] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch My Groups
  useEffect(() => {
    fetchGroups();
    // Fetch current user to determine ownership for delete actions
    api.get('/auth/me')
      .then(res => setCurrentUser(res.data))
      .catch(() => setCurrentUser(null));
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
      await api.post('/groups/create', { name: newGroupName, profilePic: newGroupImageUrl });
      setShowCreate(false);
      setNewGroupName('');
      setNewGroupImageUrl('');
      fetchGroups(); // Refresh list
    } catch (err) {
      alert("Failed to create group");
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.imageUrl;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      // invalid file - shake
      setIsInvalidNew(true);
      setTimeout(() => setIsInvalidNew(false), 600);
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setNewGroupImageUrl(url);
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNewDrop = async (file) => {
    if (!file) return;
    setIsDraggingNew(false);
    if (!file.type.startsWith('image/')) {
      setIsInvalidNew(true);
      setTimeout(() => setIsInvalidNew(false), 600);
      return;
    }
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setNewGroupImageUrl(url);
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    } finally {
      setUploadingImage(false);
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

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#191919] custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">🤝 Collaborative Spaces</h1>
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
                className="p-6 bg-white dark:bg-[#191919] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-[#3C3D3D] transition flex items-center justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Join Existing Team</h3>
                  <p className="text-gray-500 text-sm mt-1">Have a code? Enter it here.</p>
                </div>
                <span className="text-4xl text-gray-300">→</span>
              </div>
            </div>

            {/* Groups Grid */}
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-500 mb-4">My Teams</h2>
            {loading ? (
              <div>Loading spaces...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <div key={group._id} className="bg-white dark:bg-[#202020] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                        {group.profilePic ? (
                          <img src={group.profilePic} alt={group.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                            {group.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="bg-gray-100 dark:bg-[#3C3D3D] text-gray-600 dark:text-gray-100 text-xs px-2 py-1 rounded font-mono">
                        {group.inviteCode}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 dark:text-gray-100">{group.name}</h3>
                    <p className="text-sm text-gray-500 mb-4">{group.members.length} Members</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/groups/${group._id}`)}
                        className="flex-1 py-2 text-indigo-600 dark:text-gray-200 bg-indigo-50 dark:bg-[#3C3D3D] rounded-lg text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-gray-500"
                      >
                        Open Space
                      </button>
                    </div>
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
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-[#202020] rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 dark:text-gray-100">Name your Team</h3>
                  <form onSubmit={handleCreate}>
                    <label className="text-sm text-gray-600 dark:text-gray-100 block mb-2">Team Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. Project Alpha"
                      className="w-full p-3 border rounded-lg mb-4 dark:bg-[#3C3D3D] dark:border-gray-600 dark:text-gray-100"
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      required
                    />

                    <div className="mb-4">
                      <label className="text-sm text-gray-600 dark:text-gray-100 block mb-2">Team Image</label>

                      <div
                        onDragEnter={(e) => { e.preventDefault(); setIsDraggingNew(true); }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={() => setIsDraggingNew(false)}
                        onDrop={(e) => { e.preventDefault(); setIsDraggingNew(false); const f = e.dataTransfer?.files?.[0]; if (f) handleNewDrop(f); }}
                        className={`border-2 border-dashed rounded-lg p-4 text-center ${isDraggingNew ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'} ${isInvalidNew ? 'animate-shake border-red-300 bg-red-50/30' : ''}`}
                      >
                        {newGroupImageUrl ? (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img src={newGroupImageUrl} alt="Group" className="w-16 h-16 rounded-md object-cover border" />
                              <div className="text-left">
                                <div className="font-medium">Selected Image</div>
                                <div className="text-xs text-gray-500">Click "Choose file" to replace</div>
                              </div>
                            </div>
                            <button type="button" onClick={() => setNewGroupImageUrl('')} className="text-sm text-red-500">Remove</button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 text-gray-300 ${isDraggingNew ? 'icon-pulse text-indigo-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V8a4 4 0 014-4h2a4 4 0 014 4v8M7 16h10M7 16l1.5 1.5M17 16l-1.5 1.5" />
                            </svg>
                            <div className="text-sm text-gray-500">Drag & drop an image or</div>
                            <label htmlFor="create-image-input" className="mt-1 inline-flex items-center px-3 py-2 bg-white dark:bg-[#3c3d3d] dark:text-gray-100 border rounded-md text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2c2c2c]">
                              Choose file
                            </label>
                          </div>
                        )}

                        <input id="create-image-input" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />

                        {uploadingImage && <p className="text-xs text-gray-500 mt-2">Uploading...</p>}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 bg-gray-100 dark:bg-[#2c2c2c] dark:text-gray-200 rounded-lg">Cancel</button>
                      <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">Create</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: Join Group */}
            {showJoin && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-[#202020] rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4 dark:text-gray-100">Enter Invite Code</h3>
                  {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                  <form onSubmit={handleJoin}>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. X7K9P2"
                      className="w-full p-3 border rounded-lg mb-4 font-mono uppercase tracking-widest text-center text-xl dark:bg-[#3C3D3D] dark:border-gray-600 dark:text-gray-100"
                      maxLength={6}
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      required
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowJoin(false)} className="flex-1 py-2 bg-gray-100 dark:bg-[#2c2c2c] dark:text-gray-200 rounded-lg">Cancel</button>
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