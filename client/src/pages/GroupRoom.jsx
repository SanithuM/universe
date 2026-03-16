import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import GroupTasks from '../components/GroupTasks';

const GroupRoom = () => {
    const { id } = useParams(); // Get group ID from URL
    const [group, setGroup] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
            Loading Team Data...
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-[#37352f]">

            {/* SIDEBAR: Info & Members */}
            <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6 shrink-0to md:h-screen overflow-y-auto">
                <button onClick={() => navigate('/groups')} className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-2 transition-colors">
                    ← Back to Lobby
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 wrap-break-word leading-tight mb-4">{group.name}</h1>
                    
                    <div className="bg-white border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Invite Code</p>
                        <p className="text-xl font-mono font-bold text-blue-600 tracking-wide select-all cursor-pointer" title="Click to copy" onClick={() => {navigator.clipboard.writeText(group.inviteCode); toast.success("Code Copied!")}}>
                            {group.inviteCode}
                        </p>
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
            <main className="flex-1 p-8 bg-white overflow-y-auto">
                <div className="max-w-5xl mx-auto h-full flex flex-col">
                    
                    {/* Header Section */}
                    <div className="mb-8 border-b border-gray-100 pb-4">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Workspace</h2>
                        <p className="text-gray-500">Manage tasks and collaborate with your team.</p>
                    </div>

                    {/* Group Tasks Component */}
                    <div className="flex-1">
                         <GroupTasks 
                            groupId={group._id} 
                            members={group.members} 
                        />
                    </div>

                </div>
            </main>
        </div>
    );
};

export default GroupRoom;