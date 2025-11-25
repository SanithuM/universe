import React, { useState } from 'react';

export default function NotionHome() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-full bg-white text-[#37352f] font-sans selection:bg-[#cce9ff]">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-60' : 'w-0'
                    } bg-[#F7F7F5] border-r border-[#E9E9E7] flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col`}
            >
                {/* Sidebar Header */}
                <div className="p-3 hover:bg-[#EFEFEF] cursor-pointer transition-colors flex items-center gap-2 m-1 rounded-md">
                    <div className="w-5 h-5 bg-orange-500 rounded text-white flex items-center justify-center text-xs font-bold">U</div>
                    <span className="text-sm font-medium truncate">UniVerse Workspace</span>
                    <svg className="w-3 h-3 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                {/* Sidebar Menu */}
                <div className="flex-1 overflow-y-auto px-1 py-2 space-y-0.5">
                    <SidebarItem icon="🔍" label="Search" />
                    <SidebarItem icon="🕒" label="Updates" />
                    <SidebarItem icon="⚙️" label="Settings & members" />
                    <SidebarItem icon="➕" label="New page" />

                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500">Favorites</div>
                    <SidebarItem icon="📄" label="Getting Started" active />
                    <SidebarItem icon="📓" label="Personal Home" />

                    <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500">Private</div>
                    <SidebarItem icon="📝" label="Class Notes" />
                    <SidebarItem icon="✅" label="Task List" />
                    <SidebarItem icon="📅" label="Course Schedule" />
                    <SidebarItem icon="💰" label="Budget Tracker" />
                </div>

                {/* Sidebar Footer */}
                <div className="p-2 border-t border-[#E9E9E7]">
                    <div className="px-3 py-1 text-xs text-gray-500 hover:bg-[#EFEFEF] rounded cursor-pointer">
                        + New page
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Top Bar */}
                <header className="h-11 flex items-center justify-between px-3 flex-shrink-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        {!isSidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-gray-200 rounded">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        <span className="flex items-center gap-1 cursor-pointer hover:underline decoration-gray-400 underline-offset-2">
                            <span className="text-lg">📄</span>
                            Getting Started
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <span className="text-xs text-gray-400">Edited 2h ago</span>
                        <button className="text-sm hover:bg-gray-200 px-2 py-1 rounded">Share</button>
                        <button className="hover:bg-gray-200 p-1 rounded">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-[900px] mx-auto px-12 pb-32">
                        {/* Cover Image (Optional, usually hidden by default in new pages but common in templates) */}
                        <div className="h-[30vh] -mx-12 mb-8 bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 opacity-50 group relative">
                            <button className="absolute bottom-2 right-2 bg-white/80 hover:bg-white text-xs px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Change cover</button>
                        </div>

                        {/* Page Icon */}
                        <div className="text-[78px] -mt-20 mb-4 relative group w-fit">
                            📄
                            <div className="absolute top-0 left-0 w-full h-full bg-gray-100/50 rounded opacity-0 group-hover:opacity-100 cursor-pointer"></div>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-[#37352f] mb-8 placeholder:text-gray-300 outline-none" contentEditable suppressContentEditableWarning>
                            Getting Started
                        </h1>

                        {/* Content Blocks */}
                        <div className="space-y-2 text-[#37352f]">
                            <p className="text-base mb-6">
                                Welcome to <b>UniVerse</b>! This is your new academic workspace. Here are the basics:
                            </p>

                            <div className="p-4 bg-[#F7F7F5] rounded-md border border-[#E9E9E7] mb-8 flex gap-4">
                                <div className="text-2xl">👋</div>
                                <div>
                                    <h3 className="font-semibold mb-1">Click anywhere and just start typing</h3>
                                    <p className="text-sm text-gray-600">UniVerse is a block-based editor. Every paragraph, heading, or list item is a block.</p>
                                </div>
                            </div>

                            <h2 className="text-2xl font-semibold mt-8 mb-4 border-b border-gray-200 pb-2">Checklist</h2>
                            <div className="space-y-1">
                                <CheckboxItem text="Click the + button to add a new page" checked={true} />
                                <CheckboxItem text="Type '/' to see the menu of block types" />
                                <CheckboxItem text="Highlight text to bold, italicize, or comment" />
                                <CheckboxItem text="Drag and drop blocks to reorganize" />
                            </div>

                            <h2 className="text-2xl font-semibold mt-10 mb-4 border-b border-gray-200 pb-2">Embedded Database</h2>
                            <div className="border border-gray-200 rounded overflow-hidden">
                                <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 flex">
                                    <div className="w-1/3">Name</div>
                                    <div className="w-1/3">Tags</div>
                                    <div className="w-1/3">Status</div>
                                </div>
                                <DatabaseRow name="Project Proposal" tag="Urgent" tagColor="bg-red-100 text-red-700" status="In Progress" />
                                <DatabaseRow name="Literature Review" tag="Research" tagColor="bg-blue-100 text-blue-700" status="Not Started" />
                                <DatabaseRow name="Final Presentation" tag="Design" tagColor="bg-purple-100 text-purple-700" status="Done" />
                            </div>

                            <div className="mt-12 text-gray-400 text-sm italic">
                                Press '/' for commands...
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active }) {
    return (
        <div className={`flex items-center gap-2 px-3 py-1 min-h-[28px] text-sm rounded cursor-pointer select-none transition-colors ${active ? 'bg-[#EFEFEF] text-[#37352f] font-medium' : 'text-gray-600 hover:bg-[#EFEFEF]'
            }`}>
            <span className="text-base opacity-80">{icon}</span>
            <span className="truncate">{label}</span>
        </div>
    );
}

function CheckboxItem({ text, checked }) {
    return (
        <div className="flex items-start gap-2 group py-1">
            <div className={`mt-1 w-4 h-4 border rounded flex items-center justify-center cursor-pointer transition-colors ${checked ? 'bg-blue-500 border-blue-500' : 'border-gray-400 hover:bg-gray-100'
                }`}>
                {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <span className={`${checked ? 'text-gray-400 line-through' : 'text-[#37352f]'}`}>{text}</span>
        </div>
    );
}

function DatabaseRow({ name, tag, tagColor, status }) {
    return (
        <div className="flex px-3 py-2 border-b border-gray-100 text-sm hover:bg-gray-50">
            <div className="w-1/3 font-medium">{name}</div>
            <div className="w-1/3"><span className={`px-1.5 py-0.5 rounded text-xs ${tagColor}`}>{tag}</span></div>
            <div className="w-1/3 text-gray-600">{status}</div>
        </div>
    )
}
