import toast from 'react-hot-toast';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';

import {
  Star, Share, MoreHorizontal, Smile, ImageIcon, MessageSquare, Menu,
  Upload, Link as LinkIcon, X, Bold, Italic, Underline as UnderlineIcon,
  Strikethrough, Code, ChevronDown, MessageSquarePlus, Check, Type,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Search,
  FilePlus, CornerUpRight, Trash2, Sliders, Lock, Languages, FileDown,
  MoveHorizontal, Table as TableIcon, Columns, Rows, CheckSquare, PlusSquare,
  HelpCircle
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import debounce from 'lodash.debounce';

// Resize image sizes in the editor
  const ResizableImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: '100%', // Default to fitting nicely inside the editor
          renderHTML: attributes => {
            return {
              style: `width: ${attributes.width}; height: auto;`,
            };
          },
        },
        class: {
          // Add default Tailwind classes so images instantly look premium
          default: 'rounded-lg border border-gray-200 shadow-sm transition-all duration-300',
        }
      };
    },
  });

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // STATE VARIABLES
  const [note, setNote] = useState({ title: '', content: '', icon: null, coverImage: null, isFavorite: false });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Menus & Modals
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('link');
  const [coverInput, setCoverInput] = useState('');
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [activeIconTab, setActiveIconTab] = useState('emoji');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Editor Settings
  const [fontFactory, setFontFactory] = useState('default');
  const [isSmallText, setIsSmallText] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Sharing
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [openAccessMenuId, setOpenAccessMenuId] = useState(null);

  const menuRef = useRef(null);

  // FETCH CURRENT USER
  useEffect(() => {
    api.get('/auth/me')
      .then(res => setCurrentUser(res.data))
      .catch(console.error);
  }, []);

  // CALCULATE PERMISSIONS
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwner = currentUser && note.userId && (currentUserId === (note.userId._id || note.userId));
  const myShareRecord = note.sharedWith?.find(s =>
    s.user && (s.user._id === currentUserId || s.user === currentUserId)
  );

  const canEdit = !note._id || isOwner || (myShareRecord && myShareRecord.access === 'editor');

  // Colors Configuration
  const colors = [
    { name: 'Default', color: '#37352f', bg: null },
    { name: 'Gray', color: '#9B9A97', bg: '#EBECED' },
    { name: 'Brown', color: '#64473A', bg: '#E9E5E3' },
    { name: 'Orange', color: '#D9730D', bg: '#FAEBDD' },
    { name: 'Yellow', color: '#DFAB01', bg: '#FBF3DB' },
    { name: 'Green', color: '#0F7B6C', bg: '#DDEDEA' },
    { name: 'Blue', color: '#0B6E99', bg: '#DDEBF1' },
    { name: 'Purple', color: '#6940A5', bg: '#EAE4F2' },
    { name: 'Pink', color: '#AD1A72', bg: '#F4DFEB' },
    { name: 'Red', color: '#E03E3E', bg: '#FBE4E4' },
  ];

  // INITIALIZE ROCK-SOLID TIPTAP EDITOR
  const editor = useEditor({
    editable: canEdit,
    extensions: [
      StarterKit,
      History,
      Placeholder.configure({
        placeholder: ({ editor, node }) => {
          if (!editor) return '';
          const isEmpty = typeof editor.isEmpty === 'function' ? editor.isEmpty() : (editor.state?.doc?.content?.size <= 2);
          const isFirstParagraph = node.type.name === 'paragraph' && editor.state?.doc?.firstChild === node;
          return isEmpty && isFirstParagraph ? "Start writing here — your private note is saved automatically." : '';
        },
        includeChildren: false,
        showOnlyWhenEditable: true,
      }),
      BubbleMenuExtension,
      ResizableImage,
      TaskList,
      TaskItem.configure({ nested: true }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'my-table' } }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setNote(prev => ({ ...prev, content: html }));
      debouncedSave({ content: html });
    },
  });

  // Dynamically update permissions
  useEffect(() => {
    if (editor) editor.setEditable(canEdit);
  }, [canEdit, editor]);

  // Fetch Note Data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
        if (editor) {
          editor.commands.setContent(res.data.content || '');
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch note", err);
        navigate('/app');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNote();

    if (editor && id) {
      editor.commands.clearContent();
    }
  }, [id, editor, navigate]);

  // UI Listeners
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actions
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      const response = await api.post(`/notes/${id}/share`, { email: inviteEmail });
      setInviteEmail('');
      toast.success(`Successfully shared with ${response.data.sharedUser.username}!`);
      const res = await api.get(`/notes/${id}`);
      setNote(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share note.");
    }
  };

  const debouncedSave = useCallback(
    debounce(async (dataToUpdate) => {
      try {
        await api.put(`/notes/${id}`, dataToUpdate);
        toast.success("Saved to cloud", {
          id: 'auto-save-toast',
          duration: 2000,
          position: 'top-center',
          style: { borderRadius: '20px', background: 'white', color: 'black', fontSize: '12px', padding: '4px 12px' },
        });
      } catch (err) {
        console.error("Auto-save failed", err);
      }
    }, 1000),
    [id]
  );

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setNote(prev => ({ ...prev, title: newTitle }));
    debouncedSave({ title: newTitle });
  };

  const handleRemoveUser = async (userIdToRemove) => {
    try {
      await api.delete(`/notes/${id}/share/${userIdToRemove}`);
      setNote(prev => ({
        ...prev,
        sharedWith: prev.sharedWith.filter(shareItem => {
          const uId = shareItem.user?._id || shareItem.user;
          return uId !== userIdToRemove;
        })
      }));
      setOpenAccessMenuId(null);
      toast.success("User access removed.");
    } catch (err) {
      toast.error("Failed to remove user.");
    }
  };

  const handleUpdateAccess = async (userIdToUpdate, newAccess) => {
    try {
      const res = await api.put(`/notes/${id}/share/${userIdToUpdate}`, { access: newAccess });
      setNote(prev => ({ ...prev, sharedWith: res.data.sharedWith }));
      setOpenAccessMenuId(null);
    } catch (err) {
      console.error("Failed to update access", err);
    }
  };

  const toggleFavorite = async () => {
    const newStatus = !note.isFavorite;
    setNote(prev => ({ ...prev, isFavorite: newStatus }));
    try {
      await api.put(`/notes/${id}`, { isFavorite: newStatus });
      toast.success(`${newStatus ? 'Added to' : 'Removed from'} favorites.`);
    } catch (err) {
      setNote(prev => ({ ...prev, isFavorite: !newStatus }));
    }
  };

  // Media Handlers
  const handleAddIcon = () => setShowIconMenu(true);
  const onEmojiClick = (emojiData) => {
    setNote(prev => ({ ...prev, icon: emojiData.emoji }));
    debouncedSave({ icon: emojiData.emoji });
    setShowIconMenu(false);
  };
  const removeIcon = () => {
    setNote(prev => ({ ...prev, icon: null }));
    debouncedSave({ icon: null });
    setShowIconMenu(false);
  };

  const handleAddCover = () => setShowCoverMenu(true);
  const handleLinkSubmit = () => {
    if (coverInput.trim()) {
      setNote(prev => ({ ...prev, coverImage: coverInput }));
      debouncedSave({ coverImage: coverInput });
      setShowCoverMenu(false);
      setCoverInput('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Put up a loading toast so the user knows it's working
    const loadingToast = toast.loading('Uploading cover...');

    try {
      // Pack the file into a FormData object
      const formData = new FormData();
      formData.append('image', file);

      // Send it to the backend route
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fastImageUrl = res.data.imageUrl;

      // Save the new URL to state and the database!
      setNote(prev => ({ ...prev, coverImage: fastImageUrl }));
      debouncedSave({ coverImage: fastImageUrl });

      setShowCoverMenu(false);
      toast.success('Cover updated!', { id: loadingToast }); // Replaces the loading toast

    } catch (error) {
      console.error("Upload failed", error);
      toast.error('Failed to upload image', { id: loadingToast });
    }
  };

  const removeCover = () => {
    setNote(prev => ({ ...prev, coverImage: null }));
    debouncedSave({ coverImage: null });
    setShowCoverMenu(false);
  };

  // upload image for note content
  const handleTipTapImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loadingToast = toast.loading('Uploading image...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Send to the Cloudinary backend
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = res.data.imageUrl;

      // Inserts the image right where the cursor is
      editor.chain().focus().setImage({ src: imageUrl }).run();

      toast.success('Image inserted!', { id: loadingToast });

    } catch (error) {
      console.error("Upload failed", error);
      toast.error('Failed to upload image', { id: loadingToast });
    }
  };

  

  if (loading) return <div className="p-10 text-gray-400 flex items-center justify-center h-screen">Loading workspace...</div>;

  return (
    <div className="flex h-screen w-full bg-white font-sans text-[#37352f]">
      <Sidebar isOpen={isSidebarOpen} onAddTask={() => navigate('/app')} />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* HEADER */}
        <header className="flex items-center justify-between px-4 h-11 sticky top-0 bg-white dark:bg-[#191919] z-10 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-100">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-200 rounded mr-2 md:hidden">
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="truncate max-w-[200px] text-sm">{note.title || "Untitled"}</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-gray-400 dark:text-gray-100 hidden sm:inline">Private</span>
          </div>

          <div className="flex items-center gap-2 text-gray-500">
            {/* Avatar Bubbles Group */}
            <div className="flex items-center mr-2">
              {note.userId && (
                <div
                  className="w-7 h-7 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-white text-[11px] font-bold z-10 shadow-sm"
                  title={`${note.userId.username} (Owner)`}
                >
                  {note.userId.profilePic ? (
                    <img src={note.userId.profilePic} alt="Owner" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    note.userId.username?.charAt(0).toUpperCase()
                  )}
                </div>
              )}
              {note.sharedWith && note.sharedWith.map((shareItem, index) => {
                const sharedUser = shareItem?.user || shareItem;
                return (
                  <div
                    key={`avatar-${sharedUser._id || index}`}
                    className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-[11px] font-bold -ml-2 shadow-sm relative"
                    style={{ zIndex: 10 + index + 1 }}
                    title={sharedUser.username}
                  >
                    {sharedUser.profilePic ? (
                      <img src={sharedUser.profilePic} alt="Shared User" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      sharedUser.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                )
              })}
            </div>

            {/* SHARE BUTTON & MENU */}
            <div className="relative">
              <button
                onClick={() => setIsShareOpen(!isShareOpen)}
                className={`px-3 py-1 rounded text-sm transition-colors ${isShareOpen ? 'bg-gray-100 text-black dark:bg-[#3d3c3c] dark:text-gray-100' : 'hover:bg-gray-100 dark:hover:bg-[#3d3c3c]'}`}
              >
                Share
              </button>

              {isShareOpen && (
                <div
                  ref={menuRef}
                  className="absolute top-10 right-0 w-[380px] bg-white dark:bg-[#191919] rounded-lg shadow-[0_0_0_1px_rgba(15,15,15,0.05),0_8px_16px_rgba(15,15,15,0.1)] z-100 overflow-hidden flex flex-col text-[#37352f] dark:text-gray-100 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex px-4 border-b border-gray-100">
                    <button className="px-2 py-3 text-sm font-medium border-b-2 border-black text-black dark:border-gray-100 dark:text-gray-100">Share</button>
                  </div>

                  <div className="p-4">
                    <form onSubmit={handleInvite} className="flex gap-2 mb-4">
                      <input
                        type="email"
                        placeholder="Email or group, separated by commas"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-blue-400 rounded-md outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-sm font-medium text-white bg-[#2383e2] hover:bg-[#1d6bba] rounded-md transition-colors"
                      >
                        Invite
                      </button>
                    </form>

                    <div className="flex flex-col gap-4 mb-6 max-h-48 overflow-y-auto custom-scrollbar">
                      {note.userId && typeof note.userId === 'object' && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                              {note.userId.profilePic ? (
                                <img src={note.userId.profilePic} alt={note.userId.username} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                note.userId.username?.charAt(0).toUpperCase() || 'O'
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {note.userId.username} <span className="text-gray-400 font-normal ml-1">(Owner)</span>
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{note.userId.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-400 cursor-default">
                            Full access
                          </div>
                        </div>
                      )}

                      {note.sharedWith && note.sharedWith.map((shareItem, index) => {
                        const sharedUser = shareItem?.user || shareItem;
                        const userAccess = shareItem?.access || shareItem?.userAccess || sharedUser?.access;
                        return (
                          <div key={`row-${sharedUser._id || index}`} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                                {sharedUser.profilePic ? (
                                  <img src={sharedUser.profilePic} alt={sharedUser.username} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  sharedUser.username?.charAt(0).toUpperCase() || 'U'
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{sharedUser.username}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{sharedUser.email}</span>
                              </div>
                            </div>

                            <div className="flex items-center relative">
                              {isOwner ? (
                                <button
                                  onClick={() => setOpenAccessMenuId(openAccessMenuId === sharedUser._id ? null : sharedUser._id)}
                                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                                >
                                  <span className="capitalize">{userAccess || 'Editor'}</span> <ChevronDown size={14} />
                                </button>
                              ) : (
                                <span className="text-sm text-gray-400 capitalize pr-2">{userAccess || 'Editor'}</span>
                              )}

                              {openAccessMenuId === sharedUser._id && isOwner && (
                                <div className="absolute right-0 top-8 w-36 bg-white border border-gray-100 rounded-lg shadow-xl z-150 py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    onClick={() => handleUpdateAccess(sharedUser._id, 'editor')}
                                    className="px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-100 flex justify-between items-center"
                                  >
                                    Editor {(userAccess || 'editor') === 'editor' && <Check size={14} className="text-[#2383e2]" />}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateAccess(sharedUser._id, 'viewer')}
                                    className="px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-100 flex justify-between items-center"
                                  >
                                    Viewer {userAccess === 'viewer' && <Check size={14} className="text-[#2383e2]" />}
                                  </button>
                                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                  <button
                                    onClick={() => handleRemoveUser(sharedUser._id)}
                                    className="px-3 py-1.5 text-sm text-left text-red-600 hover:bg-red-50 font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-500 mb-2">General access</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-100 dark:bg-[#2c2c2c] rounded-md">
                            <Lock size={16} className="text-gray-500 dark:text-gray-100" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-700 dark:text-gray-100">Only people invited</span>
                          </div>
                        </div>
                        <ChevronDown size={14} className="text-gray-400 cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-gray-50 dark:bg-[#191919] border-t border-gray-100 flex items-center justify-between">
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                      <HelpCircle size={14} /> Learn about sharing
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-100 bg-white dark:bg-[#2c2c2c] border border-gray-300 dark:border-[#2c2c2c] rounded-md hover:bg-gray-50 dark:hover:bg-[#3d3c3c] transition-colors"
                    >
                      <LinkIcon size={14} />
                      {isCopied ? "Copied!" : "Copy link"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* END SHARE BUTTON */}

            <button onClick={toggleFavorite} className={`hover:bg-gray-100 dark:hover:bg-[#3d3c3c] p-1 rounded transition-colors ${note.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}>
              <Star size={18} />
            </button>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className={`hover:bg-gray-100 dark:hover:bg-[#3d3c3c] p-1 rounded transition-colors ${showOptionsMenu ? 'bg-gray-100 text-black' : ''}`}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        {/* OPTIONS MENU */}
        {showOptionsMenu && (
          <div className="absolute top-12 right-4 z-100 bg-white dark:bg-[#191919] rounded-xl shadow-[0_0_0_1px_rgba(15,15,15,0.05),0_8px_16px_rgba(15,15,15,0.1)] w-[260px] py-0.5 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col text-[#37352f] dark:text-gray-100 overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar">

            {/* Search */}
            <div className="px-3 pt-3 pb-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  className="w-full pl-8 pr-3 py-1 bg-white dark:bg-[#3d3c3c] border border-gray-200 dark:border-[#2c2c2c] rounded text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal"
                  autoFocus
                />
              </div>
            </div>

            {/* Typography Selection */}
            <div className="flex justify-between px-3 py-1.5 my-1">
              {[
                { name: 'Default', font: 'font-sans', id: 'default', label: 'Ag' },
                { name: 'Serif', font: 'font-serif', id: 'serif', label: 'Ag' },
                { name: 'Mono', font: 'font-mono', id: 'mono', label: 'Ag' }
              ].map((font) => (
                <button
                  key={font.id}
                  onClick={() => setFontFactory(font.id)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors ${fontFactory === font.id ? 'text-blue-600' : 'text-gray-500 dark:text-gray-100 hover:text-gray-900 dark:hover:text-gray-100'}`}
                >
                  <span className={`text-xl ${font.font}`}>{font.label}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-200 font-medium">{font.name}</span>
                </button>
              ))}
            </div>

            {/* Actions Group 1 */}
            <div className="flex flex-col text-[14px]">
              <button className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <LinkIcon size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                  <span className="">Copy link</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+Alt+L</span>
              </button>
              <button className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <FilePlus size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                  <span className="">Duplicate</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+D</span>
              </button>
              <button className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors group">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <CornerUpRight size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                  <span className="">Move to</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+Shift+P</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors text-red-600 hover:text-red-700">
                <Trash2 size={16} strokeWidth={1.5} className="text-red-500" />
                <span className="">Move to Trash</span>
              </button>
            </div>

            <div className="w-full border-t border-gray-300 my-1 mx-2" />

            {/* Page Settings */}
            <div className="flex flex-col text-[14px]">
              <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors cursor-pointer" onClick={() => setIsSmallText(!isSmallText)}>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Type size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                  <span className="">Small text</span>
                </div>
                <div className={`w-8 h-4.5 rounded-full relative transition-colors border border-transparent ${isSmallText ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${isSmallText ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors cursor-pointer" onClick={() => setIsFullWidth(!isFullWidth)}>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MoveHorizontal size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                  <span className="">Full width</span>
                </div>
                <div className={`w-8 h-4.5 rounded-full relative transition-colors border border-transparent ${isFullWidth ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${isFullWidth ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors text-gray-700 dark:text-gray-300">
                <Sliders size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                <span className="">Customize page</span>
              </button>
            </div>

            <div className="w-full border-t border-gray-300 my-1 mx-2" />

            {/* Advanced & Import/Export */}
            <div className="flex flex-col text-[14px]">
              <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors cursor-pointer" onClick={() => setIsLocked(!isLocked)}>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Lock size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                  <span className="">Lock page</span>
                </div>
                <div className={`w-8 h-4.5 rounded-full relative transition-colors border border-transparent ${isLocked ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${isLocked ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors text-gray-700 dark:text-gray-300">
                <MessageSquarePlus size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                <span className="">Suggest edits</span>
              </button>
              <button className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <Languages size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                  <span className="">Translate</span>
                </div>
                <ChevronDown size={14} className="text-gray-400 -rotate-90" />
              </button>

              <div className="w-full border-t border-gray-300 my-1 mx-2" />

              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700">
                <FileDown size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                <span className="">Import</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700">
                <Upload size={16} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
                <span className="">Export</span>
              </button>
            </div>

            {/* Footer Info */}
            <div className="flex flex-col px-4 py-2 text-xs text-gray-400 border-t border-gray-100 mt-1">
              <div className="flex justify-between">
                <span>Last edited by you</span>
                <span>Today 15:46</span>
              </div>
              <div className="mt-1">
                <span>Word count: 124</span>
              </div>
            </div>

          </div>
        )}

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Cover Image */}
          {note.coverImage && (
            <div className="h-[30vh] w-full relative group">
              <img src={note.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <button
                onClick={() => setShowCoverMenu(true)}
                className="absolute bottom-2 right-2 dark:text-gray-100 bg-white/80 dark:bg-[#0b0b0b] hover:bg-white dark:hover:bg-[#3d3c3c] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Change cover
              </button>
            </div>
          )}

          {/* Cover Menu Popover */}
          {showCoverMenu && (
            <div className="absolute top-20 right-10 z-50 bg-white dark:bg-[#0b0b0b] rounded-xl shadow-2xl border border-gray-200 dark:border-[#2c2c2c] w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-[#F7F7F5] dark:bg-[#0f0f0f] dark:border-[#2c2c2c]">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cover Image</span>
                </div>
                <button onClick={() => setShowCoverMenu(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'upload' ? 'border-black text-black dark:border-gray-100 dark:text-gray-100' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab('link')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'link' ? 'border-black text-black dark:border-gray-100 dark:text-gray-100' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
                >
                  Link
                </button>
                <button
                  onClick={removeCover}
                  className="ml-auto px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>

              <div className="p-4 bg-white dark:bg-[#0b0b0b]">
                {activeTab === 'link' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={coverInput}
                        onChange={(e) => setCoverInput(e.target.value)}
                        placeholder="Paste an image link..."
                        className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors dark:border-[#3a3a3a] dark:bg-transparent dark:text-gray-100"
                        autoFocus
                      />
                      <button
                        onClick={handleLinkSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Works with any image from the web.</p>
                  </div>
                )}

                {activeTab === 'upload' && (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-[#2f2f2f] rounded-lg p-8 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="bg-gray-100 dark:bg-[#161616] p-3 rounded-full mb-3">
                      <Upload size={20} className="text-gray-500 dark:text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-100">Upload file</p>
                    <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">Images up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="max-w-4xl w-full md:ml-20 px-4 md:px-8 pb-20">
            {/* Icon */}
            {note.icon && (
              <div className={`text-[78px] mb-4 relative z-10 group w-fit ${note.coverImage ? '-mt-10' : 'mt-4'}`}>
                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded px-2 transition-colors" onClick={() => setShowIconMenu(true)}>
                  {note.icon}
                </div>
              </div>
            )}

            {/* Icon Menu Popover */}
            {showIconMenu && (
              <div className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-[350px] overflow-hidden animate-in fade-in zoom-in-95 duration-200" style={{ top: '220px', left: '10%' }}>
                {/* Tabs Header */}
                <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100">
                  <div className="flex">
                    <button
                      onClick={() => setActiveIconTab('emoji')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${activeIconTab === 'emoji' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      Emoji
                    </button>
                    <button
                      onClick={() => setActiveIconTab('icons')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${activeIconTab === 'icons' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      Icons
                    </button>
                    <button
                      onClick={() => setActiveIconTab('upload')}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${activeIconTab === 'upload' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      Upload
                    </button>
                  </div>
                  <button
                    onClick={removeIcon}
                    className="text-xs text-gray-400 hover:text-red-500 px-2 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {/* Content */}
                <div className="h-[400px]">
                  {activeIconTab === 'emoji' && (
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      width="100%"
                      height="100%"
                      lazyLoadEmojis={true}
                      searchDisabled={false}
                      skinTonesDisabled
                      previewConfig={{ showPreview: false }}
                    />
                  )}
                  {activeIconTab !== 'emoji' && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                      <span>Coming soon</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Options Bar (Add icon, cover, comment) */}
            <div className={`flex items-center gap-4 text-gray-400 text-sm mb-8 transition-opacity duration-200`}>
              {!note.icon && (
                <button onClick={handleAddIcon} className="hover:bg-gray-100 py-1 rounded flex items-center gap-1.5 transition-colors">
                  <Smile size={18} className="text-gray-400" />
                  <span className="text-gray-500 hover:text-gray-700">Add icon</span>
                </button>
              )}
              {!note.coverImage && (
                <button onClick={handleAddCover} className="hover:bg-gray-100 py-1 rounded flex items-center gap-1.5 transition-colors">
                  <ImageIcon size={18} className="text-gray-400" />
                  <span className="text-gray-500 hover:text-gray-700">Add cover</span>
                </button>
              )}
              {!note.icon && !note.coverImage && (
                <button className="hover:bg-gray-100 py-1 rounded flex items-center gap-1.5 transition-colors">
                  <MessageSquare size={18} className="text-gray-400" />
                  <span className="text-gray-500 hover:text-gray-700">Add comment</span>
                </button>
              )}
            </div>

            {/* Title Input */}
            <input
              type="text"
              value={note.title}
              onChange={handleTitleChange}
              disabled={!canEdit}
              placeholder="New page"
              className={`text-3xl md:text-5xl font-bold w-full outline-none placeholder:text-gray-200 text-[#37352f] mb-6 ${!canEdit && 'bg-transparent'}`}
            />

            {/* TipTap Editor Content */}
            {editor && (
              <BubbleMenu editor={editor} options={{ duration: 100 }} className="flex items-center gap-1 bg-white dark:bg-[#202020] shadow-xl border border-gray-200 rounded-lg px-2 py-1.5 animate-in fade-in zoom-in-95 duration-200">

                {/* IF IMAGE IS SELECTED */}
                {editor.isActive('image') ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-2 border-r border-gray-200 mr-1">
                      Image Size
                    </span>
                    <button 
                      onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()} 
                      className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      Small
                    </button>
                    <button 
                      onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()} 
                      className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      Medium
                    </button>
                    <button 
                      onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()} 
                      className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      Full
                    </button>
                    
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    
                    <button 
                      onClick={() => editor.chain().focus().deleteSelection().run()} 
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  
                  /* OTHERWISE, SHOW THE STANDARD TEXT & TABLE CONTROLS */
                  <>
                    {/* Node Type Selector */}
                    <div className="relative flex items-center gap-1 pr-2 border-r border-gray-200 mr-1">
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] rounded min-w-20 justify-between"
                        onClick={() => setShowTypeMenu(!showTypeMenu)}
                      >
                        <span className="truncate">
                          {editor.isActive('heading', { level: 1 }) ? 'Heading 1' :
                            editor.isActive('heading', { level: 2 }) ? 'Heading 2' :
                              editor.isActive('heading', { level: 3 }) ? 'Heading 3' :
                                editor.isActive('bulletList') ? 'Bulleted List' :
                                  editor.isActive('orderedList') ? 'Numbered List' :
                                    editor.isActive('blockquote') ? 'Quote' :
                                      editor.isActive('codeBlock') ? 'Code' :
                                        editor.isActive('taskList') ? 'To-do' : 'Text'}
                        </span>
                        <ChevronDown size={12} className="text-gray-400 shrink-0" />
                      </button>

                      {/* Type Menu Dropdown */}
                      {showTypeMenu && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-gray-200 w-[200px] z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
                          <div className="px-3 py-2 text-[11px] font-semibold text-gray-500 dark:text-gray-100 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50 dark:bg-[#3d3c3c]">Turn into</div>
                          <div className="p-1.5 flex flex-col gap-0.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {[
                              { label: 'Text', icon: <Type size={14} />, isActive: () => editor.isActive('paragraph'), action: () => editor.chain().focus().setParagraph().run() },
                              { label: 'Heading 1', icon: <Heading1 size={14} />, isActive: () => editor.isActive('heading', { level: 1 }), action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
                              { label: 'Heading 2', icon: <Heading2 size={14} />, isActive: () => editor.isActive('heading', { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
                              { label: 'Heading 3', icon: <Heading3 size={14} />, isActive: () => editor.isActive('heading', { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
                              { label: 'Bulleted list', icon: <List size={14} />, isActive: () => editor.isActive('bulletList'), action: () => editor.chain().focus().toggleBulletList().run() },
                              { label: 'Numbered list', icon: <ListOrdered size={14} />, isActive: () => editor.isActive('orderedList'), action: () => editor.chain().focus().toggleOrderedList().run() },
                              { label: 'To-do list', icon: <CheckSquare size={14} />, isActive: () => editor.isActive('taskList'), action: () => editor.chain().focus().toggleTaskList().run() },
                              { label: 'Quote', icon: <Quote size={14} />, isActive: () => editor.isActive('blockquote'), action: () => editor.chain().focus().toggleBlockquote().run() },
                              { label: 'Code', icon: <Code size={14} />, isActive: () => editor.isActive('codeBlock'), action: () => editor.chain().focus().toggleCodeBlock().run() },
                              { label: 'Table', icon: <TableIcon size={14} />, isActive: () => editor.isActive('table'), action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
                            ].map((type) => (
                              <button
                                key={type.label}
                                onClick={() => {
                                  type.action();
                                  setShowTypeMenu(false);
                                }}
                                className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#3d3c3c] rounded-md transition-colors text-left"
                              >
                                <div className="text-gray-400">{type.icon}</div>
                                <span className="flex-1">{type.label}</span>
                                {type.isActive() && <Check size={14} className="text-blue-600" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Formatting Group */}
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors ${editor.isActive('bold') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 dark:text-gray-100'}`}><Bold size={15} /></button>
                      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors ${editor.isActive('italic') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 dark:text-gray-100'}`}><Italic size={15} /></button>
                      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors ${editor.isActive('underline') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 dark:text-gray-100'}`}><UnderlineIcon size={15} /></button>
                      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors ${editor.isActive('strike') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 dark:text-gray-100'}`}><Strikethrough size={15} /></button>
                      <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors ${editor.isActive('code') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 dark:text-gray-100'}`}><Code size={15} /></button>
                      <button onClick={() => {
                        const previousUrl = editor.getAttributes('link').href;
                        const url = window.prompt('URL', previousUrl);
                        if (url === null) return;
                        if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
                        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                      }} className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors ${editor.isActive('link') ? 'text-blue-600 bg-blue-50' : 'text-gray-600 dark:text-gray-100'}`}><LinkIcon size={15} /></button>

                      {/* Image Upload Button */}
                      <div className="relative flex items-center border-r border-gray-200 pr-1 mr-1">
                        <label
                          className="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors text-gray-600 dark:text-gray-100 flex items-center justify-center"
                          title="Insert Image"
                        >
                          <ImageIcon size={15} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleTipTapImageUpload}
                          />
                        </label>
                      </div>

                      {/* Color Picker Container */}
                      <div className="relative">
                        <button onClick={() => setShowColorMenu(!showColorMenu)} className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-[#3d3c3c] transition-colors flex items-center gap-0.5 ${showColorMenu ? 'bg-gray-100 dark:bg-[#3d3c3c] text-black dark:text-white' : 'text-gray-600 dark:text-gray-100'}`}>
                          <span className="text-sm font-serif font-bold">A</span>
                          <ChevronDown size={10} className="opacity-50" />
                        </button>
                        {showColorMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-[#202020] rounded-xl shadow-2xl border border-gray-200 p-3 w-[200px] z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                            <div>
                              <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-100 uppercase tracking-wider mb-2">Text color</div>
                              <div className="grid grid-cols-5 gap-1.5">
                                {colors.map((c) => (
                                  <button key={`text-${c.name}`} onClick={() => { editor.chain().focus().setColor(c.color).run(); setShowColorMenu(false); }} className="w-7 h-7 mx-auto rounded-md border border-gray-200 dark:border-[#3d3c3c] bg-white dark:bg-[#2c2c2c] hover:bg-gray-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 text-base font-serif font-bold" style={{ color: c.color }} title={c.name}>A</button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-100 uppercase tracking-wider mb-2">Background color</div>
                              <div className="grid grid-cols-5 gap-1.5">
                                {colors.map((c) => (
                                  <button key={`bg-${c.name}`} onClick={() => { if (c.bg) { editor.chain().focus().toggleHighlight({ color: c.bg }).run(); } else { editor.chain().focus().unsetHighlight().run(); } setShowColorMenu(false); }} className={`w-7 h-7 mx-auto rounded-md border border-gray-200 dark:border-[#3d3c3c] flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${!c.bg ? 'bg-white' : ''}`} style={{ backgroundColor: c.bg || 'transparent' }} title={`${c.name} Background`}>{!c.bg && <div className="w-full h-px bg-red-400 dark:bg-red-600 rotate-45 transform scale-110"></div>}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TABLE OPTIONS MENU */}
                    {editor.isActive('table') && (
                      <div className="relative ml-1 pl-1 border-l border-gray-200">
                        <button
                          onClick={() => setShowTableMenu(!showTableMenu)}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-0.5 ${showTableMenu ? 'bg-gray-100 text-black' : 'text-gray-600'}`}
                        >
                          <TableIcon size={15} />
                          <ChevronDown size={10} className="opacity-50" />
                        </button>

                        {showTableMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 w-[180px] z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden py-1">
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">Table Controls</div>
                            <div className="flex flex-col p-1 gap-0.5">
                              <button onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded text-left"><Columns size={14} /><span className="flex-1">Add Column</span><PlusSquare size={10} className="text-blue-500" /></button>
                              <button onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded text-left"><Rows size={14} /><span className="flex-1">Add Row</span><PlusSquare size={10} className="text-blue-500" /></button>
                              <button onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded text-left"><Columns size={14} /><span className="flex-1">Delete Column</span><Trash2 size={10} className="text-red-500" /></button>
                              <button onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded text-left"><Rows size={14} /><span className="flex-1">Delete Row</span><Trash2 size={10} className="text-red-500" /></button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button onClick={() => { editor.chain().focus().toggleHeaderCell().run(); setShowTableMenu(false); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded text-left"><TableIcon size={14} /><span>Toggle Header</span></button>
                              <button onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }} className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded text-left"><Trash2 size={14} /><span>Delete Table</span></button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </BubbleMenu>
            )}

          <>
            <style>{`.ProseMirror p.is-empty::before { content: attr(data-placeholder); color: #9ca3af; pointer-events: none; height: 0; display: block; } .ProseMirror p.is-empty { position: relative; }`}</style>
            <EditorContent editor={editor} className="prose max-w-none focus:outline-none prose-p:my-1 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 leading-normal text-[#37352f] pb-32" />
          </>
        </div>
    </div>
      </main >
    </div >
  );
};

export default NoteEditor;