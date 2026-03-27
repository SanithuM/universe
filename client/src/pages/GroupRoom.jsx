import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash, Edit2 } from 'lucide-react';
import api from '../api/axios';
import GroupTasks from '../components/GroupTasks';

const GroupRoom = () => {
    const { id } = useParams(); // Get group ID from URL
    const [group, setGroup] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isDraggingEdit, setIsDraggingEdit] = useState(false);
    const [isInvalidEdit, setIsInvalidEdit] = useState(false);
    const navigate = useNavigate();

    // Fetch Group Data & Current User
    useEffect(() => {
                const fetchData = async () => {
            try {
                // Fetch both at the same time for maximum speed
                const [userRes, groupRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get(`/groups/${id}`)
                ]);
                setCurrentUser(userRes.data);
                setGroup(groupRes.data);
                setEditName(groupRes.data.name || '');
                setEditImageUrl(groupRes.data.profilePic || '');
                setLoading(false);
            } catch (err) {
                console.error(err);
                toast.error("Access Denied or Group Not Found");
                navigate('/groups');
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleRemoveMember = async (memberId, memberName) => {
        // Standard browser confirmation so they don't accidentally kick someone
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) return;

        try {
            // Send the request using the 'id' from useParams
            await api.delete(`/groups/${id}/members/${memberId}`);
            
            // Instantly remove them from the screen without refreshing the page
            setGroup(prevGroup => ({
                ...prevGroup,
                members: prevGroup.members.filter(m => (m._id || m) !== memberId)
            }));
            
            toast.success(`${memberName} has been removed.`);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to remove member.");
        }
    };

    const handleDeleteGroup = async () => {
        setShowDeleteConfirm(false);
        try {
            await api.delete(`/groups/${id}`);
            toast.success('Group deleted');
            navigate('/groups');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete group.');
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

    const handleEditImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setIsInvalidEdit(true);
            setTimeout(() => setIsInvalidEdit(false), 600);
            return;
        }
        setUploadingImage(true);
        try {
            const url = await uploadImage(file);
            setEditImageUrl(url);
        } catch (err) {
            console.error(err);
            toast.error('Image upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleEditDrop = async (file) => {
        if (!file) return;
        setIsDraggingEdit(false);
        if (!file.type.startsWith('image/')) {
            setIsInvalidEdit(true);
            setTimeout(() => setIsInvalidEdit(false), 600);
            return;
        }
        setUploadingImage(true);
        try {
            const url = await uploadImage(file);
            setEditImageUrl(url);
        } catch (err) {
            console.error(err);
            toast.error('Image upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSaveEdit = async () => {
        try {
            const res = await api.put(`/groups/${id}`, { name: editName, profilePic: editImageUrl });
            setGroup(res.data);
            setShowEditModal(false);
            toast.success('Group updated');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update group');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
            Loading Team Data...
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-[#37352f]">

            {/* SIDEBAR: Info & Members */}
            <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6 shrink-0to md:h-screen overflow-y-auto custom-scrollbar">
                <button onClick={() => navigate('/groups')} className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-2 transition-colors">
                    ← Back to Lobby
                </button>

                <div className="mb-8 border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-gray-800 wrap-break-word leading-tight mb-0">{group.name}</h1>
                    </div>
                    
                    <div className="mt-4">
                        <div className="bg-white border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Invite Code</p>
                            <p className="text-xl font-mono font-bold text-blue-600 tracking-wide select-all cursor-pointer" title="Click to copy" onClick={() => {navigator.clipboard.writeText(group.inviteCode); toast.success("Code Copied!")}}>
                                {group.inviteCode}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Team Members ({group.members.length})
                    </h3>
                    <ul className="space-y-1">
                        {group.members.map(member => {
                            // Check if this specific member is the boss
                            const isCreator = group.creator === member._id || group.creator?._id === member._id;

                            return (
                                <li key={member._id} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group/member">
                                    
                                    {/* Left Side: Avatar and Name */}
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center font-bold text-gray-500 shadow-sm">
                                            {member.profilePic ? (
                                                <img src={member.profilePic} alt={member.username} className="w-full h-full object-cover" />
                                            ) : (
                                                member.username.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="font-medium truncate">{member.username}</span>
                                            
                                            {/* The Creator Badge */}
                                            {isCreator && (
                                                <span className="text-[10px] font-bold bg-blue-100 text-[#2383e2] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                                    Creator
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: The Remove Button */}
                                    {/* Only shows if YOU are the creator, and the target is NOT the creator */}
                                    {currentUser?._id === (group.creator?._id || group.creator) && !isCreator && (
                                        <button
                                            onClick={() => handleRemoveMember(member._id, member.username)}
                                            className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded opacity-0 group-hover/member:opacity-100 transition-all duration-200"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </aside>

            {/* MAIN: Workspace */}
            <main className="flex-1 p-8 bg-white overflow-y-auto custom-scrollbar">
                <div className="max-w-5xl mx-auto h-full flex flex-col">
                    
                    {/* Header Section */}
                    <div className="mb-8 border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Workspace</h2>
                                <p className="text-gray-500">Manage tasks and collaborate with your team.</p>
                            </div>

                            {currentUser?._id === (group.creator?._id || group.creator) && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShowEditModal(true)} title="Edit Team" className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                                        <Edit2 size={16} />
                                        <span className="hidden sm:inline">Edit</span>
                                    </button>
                                    <button onClick={() => setShowDeleteConfirm(true)} title="Delete Team" className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 flex items-center gap-2">
                                        <Trash size={16} />
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group Tasks Component */}
                    <div className="flex-1">
                         <GroupTasks 
                            groupId={group._id} 
                            members={group.members} 
                        />
                    </div>

                </div>
                {/* DELETE CONFIRMATION MODAL */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-2">Delete Team</h3>
                            <p className="text-sm text-gray-600 mb-4">Are you sure you want to permanently delete the team "{group.name}"? This action cannot be undone and will remove access for all members.</p>
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowDeleteConfirm(false)} className="py-2 px-4 bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleDeleteGroup} className="py-2 px-4 bg-red-600 text-white rounded-lg font-bold">Delete</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* EDIT GROUP MODAL */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold mb-2">Edit Team</h3>
                            <p className="text-sm text-gray-600 mb-4">Update the team's name or profile image.</p>

                            <label className="text-sm text-gray-600 block mb-2">Team Name</label>
                            <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-3 border rounded-lg mb-4" />

                            <div className="mb-4">
                                <label className="text-sm text-gray-600 block mb-2">Team Image</label>

                                <div
                                    onDragEnter={(e) => { e.preventDefault(); setIsDraggingEdit(true); }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDragLeave={() => setIsDraggingEdit(false)}
                                    onDrop={(e) => { e.preventDefault(); setIsDraggingEdit(false); const f = e.dataTransfer?.files?.[0]; if (f) handleEditDrop(f); }}
                                    className={`border-2 border-dashed rounded-lg p-4 text-center ${isDraggingEdit ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200'} ${isInvalidEdit ? 'animate-shake border-red-300 bg-red-50/30' : ''}`}
                                >
                                    {editImageUrl ? (
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img src={editImageUrl} alt="Group" className="w-16 h-16 rounded-md object-cover border" />
                                                <div className="text-left">
                                                    <div className="font-medium">Selected Image</div>
                                                    <div className="text-xs text-gray-500">Click "Choose file" to replace</div>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setEditImageUrl('')} className="text-sm text-red-500">Remove</button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 text-gray-300 ${isDraggingEdit ? 'icon-pulse text-indigo-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V8a4 4 0 014-4h2a4 4 0 014 4v8M7 16h10M7 16l1.5 1.5M17 16l-1.5 1.5" />
                                            </svg>
                                            <div className="text-sm text-gray-500">Drag & drop an image or</div>
                                            <label htmlFor="edit-image-input" className="mt-1 inline-flex items-center px-3 py-2 bg-white border rounded-md text-sm cursor-pointer hover:bg-gray-50">
                                                Choose file
                                            </label>
                                        </div>
                                    )}

                                    <input id="edit-image-input" type="file" accept="image/*" onChange={handleEditImageChange} className="sr-only" />

                                    {uploadingImage && <p className="text-xs text-gray-500 mt-2">Uploading...</p>}
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-4">
                                <button onClick={() => setShowEditModal(false)} className="py-2 px-4 bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleSaveEdit} className="py-2 px-4 bg-indigo-600 text-white rounded-lg font-bold">Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default GroupRoom;