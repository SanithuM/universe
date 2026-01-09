import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import GroupTasks from '../components/GroupTasks';

const GroupRoom = () => {
    const { id } = useParams(); // Get group ID from URL
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch Group Data (Name, Members, Invite Code)
    // Note: We don't need to fetch 'tasks' here anymore because GroupTasks component handles its own data.
    const fetchGroupData = async () => {
        try {
            const res = await api.get(`/groups/${id}`);
            setGroup(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Access Denied or Group Not Found");
            navigate('/groups');
        }
    };

    useEffect(() => {
        fetchGroupData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
            Loading Team Data...
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-[#37352f]">

            {/* SIDEBAR: Info & Members */}
            <aside className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-6 flex-shrink-0 h-auto md:h-screen overflow-y-auto">
                <button onClick={() => navigate('/groups')} className="text-sm text-gray-500 hover:text-black mb-6 flex items-center gap-2 transition-colors">
                    ← Back to Lobby
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 break-words leading-tight mb-4">{group.name}</h1>
                    
                    <div className="bg-white border border-gray-200 p-3 rounded-lg text-center shadow-sm">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Invite Code</p>
                        <p className="text-xl font-mono font-bold text-blue-600 tracking-wide select-all cursor-pointer" title="Click to copy" onClick={() => {navigator.clipboard.writeText(group.inviteCode); alert("Copied!")}}>
                            {group.inviteCode}
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Team Members ({group.members.length})</h3>
                    <ul className="space-y-3">
                        {group.members.map(member => (
                            <li key={member._id} className="flex items-center gap-3 text-sm text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center font-bold text-gray-500">
                                    {member.profilePic ? (
                                        <img src={member.profilePic} alt={member.username} className="w-full h-full object-cover" />
                                    ) : (
                                        member.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className="font-medium truncate">{member.username}</span>
                            </li>
                        ))}
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
                    {/* We pass the group ID and the list of members so we can assign tasks to them */}
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