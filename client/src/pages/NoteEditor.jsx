import { useState, useEffect, useCallback } from 'react';
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
import {
  Star, Share, MoreHorizontal, Smile, ImageIcon, MessageSquare, Menu,
  Upload, Link as LinkIcon, X, Bold, Italic, Underline as UnderlineIcon,
  Strikethrough, Code, Sparkles, ChevronDown, MessageSquarePlus, Palette,
  Check, Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote, CheckSquare,
  Search, Copy, FilePlus, CornerUpRight, Trash2, ArrowLeftRight, Sliders, Lock,
  Languages, Download, FileDown, AlignLeft, AlignJustify, MoveHorizontal
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import debounce from 'lodash.debounce';

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState({ title: '', content: '', icon: null, coverImage: null, isFavorite: false });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Cover Menu State
  const [showCoverMenu, setShowCoverMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // 'upload' | 'link'
  const [coverInput, setCoverInput] = useState('');

  // Icon Menu State
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [activeIconTab, setActiveIconTab] = useState('emoji'); // 'emoji' | 'icons' | 'upload'

  // Options Menu State
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [fontFactory, setFontFactory] = useState('default'); // 'default', 'serif', 'mono'
  const [isSmallText, setIsSmallText] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isLocked, setIsLocked] = useState(false);


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

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write here ...",
      }),
      BubbleMenuExtension,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: '', // Will be updated when data fetches
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setNote(prev => ({ ...prev, content: html }));
      debouncedSave({ content: html });
    },
  });

  // Fetch Note Data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
        if (editor) {
          editor.commands.setContent(res.data.content);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch note", err);
        navigate('/app'); // Redirect back if not found
      }
    };
    if (id && editor) {
      fetchNote();
    }
  }, [id, editor]);

  // Auto-save function (debounced to prevent too many API calls)
  const debouncedSave = useCallback(
    debounce(async (dataToUpdate) => {
      try {
        await api.put(`/notes/${id}`, dataToUpdate);
      } catch (err) {
        console.error("Auto-save failed", err);
      }
    }, 1000),
    [id]
  );

  // Handlers for interactions
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setNote(prev => ({ ...prev, title: newTitle }));
    debouncedSave({ title: newTitle });
  };

  const toggleFavorite = async () => {
    // Optimistically update UI
    const newStatus = !note.isFavorite;
    setNote(prev => ({ ...prev, isFavorite: newStatus }));

    try {
      // send request immediately
      await api.put(`/notes/${id}`, { isFavorite: newStatus });
    } catch (err) {

      console.error("Failed to toggle favorite", err);
      // Revert on error if you want, or just log it
      setNote(prev => ({ ...prev, isFavorite: !newStatus }));
    }
  };

  const handleAddIcon = () => {
    setShowIconMenu(true);
  };

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
  const handleAddCover = () => {
    setShowCoverMenu(true);
  };

  const handleLinkSubmit = () => {
    if (coverInput.trim()) {
      setNote(prev => ({ ...prev, coverImage: coverInput }));
      debouncedSave({ coverImage: coverInput });
      setShowCoverMenu(false);
      setCoverInput('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setNote(prev => ({ ...prev, coverImage: base64String }));
        debouncedSave({ coverImage: base64String });
        setShowCoverMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setNote(prev => ({ ...prev, coverImage: null }));
    debouncedSave({ coverImage: null });
    setShowCoverMenu(false);
  };


  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex h-screen w-full bg-white font-sans text-[#37352f]">
      <Sidebar isOpen={isSidebarOpen} onAddTask={() => navigate('/app')} />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* === HEADER === */}
        <header className="flex items-center justify-between px-4 h-11 sticky top-0 bg-white z-10 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {!isSidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-gray-200 rounded mr-2">
                <Menu size={18} />
              </button>
            )}
            <span className="truncate max-w-[200px]">{note.title || "Untitled"}</span>
            <span>/</span>
            <span className="text-gray-400">Private</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <button className="hover:bg-gray-100 p-1 rounded">Share</button>
            <button onClick={toggleFavorite} className={`hover:bg-gray-100 p-1 rounded transition-colors ${note.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}>
              <Star size={18} />
            </button>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className={`hover:bg-gray-100 p-1 rounded transition-colors ${showOptionsMenu ? 'bg-gray-100 text-black' : ''}`}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        {/* === OPTIONS MENU === */}
        {showOptionsMenu && (
          <div className="absolute top-12 right-4 z-[100] bg-white rounded-xl shadow-[0_0_0_1px_rgba(15,15,15,0.05),0_8px_16px_rgba(15,15,15,0.1)] w-[260px] py-0.5 animate-in fade-in zoom-in-95 duration-100 origin-top-right flex flex-col text-[#37352f] overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar">

            {/* Search */}
            <div className="px-3 pt-3 pb-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  className="w-full pl-8 pr-3 py-1 bg-white border border-gray-200 rounded text-sm placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-normal"
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
                  className={`flex flex-col items-center gap-1 p-1.5 rounded hover:bg-gray-100 transition-colors ${fontFactory === font.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <span className={`text-xl ${font.font}`}>{font.label}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{font.name}</span>
                </button>
              ))}
            </div>


            {/* Actions Group 1 */}
            <div className="flex flex-col text-[14px]">
              <button className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-3 text-gray-700">
                  <LinkIcon size={16} strokeWidth={1.5} className="text-gray-600" />
                  <span className="">Copy link</span>
                </div>
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+Alt+L</span>
              </button>
              <button className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-3 text-gray-700">
                  <FilePlus size={16} strokeWidth={1.5} className="text-gray-600" />
                  <span className="">Duplicate</span>
                </div>
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+D</span>
              </button>
              <button className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-3 text-gray-700">
                  <CornerUpRight size={16} strokeWidth={1.5} className="text-gray-600" />
                  <span className="">Move to</span>
                </div>
                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Ctrl+Shift+P</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 transition-colors text-red-600 hover:text-red-700">
                <Trash2 size={16} strokeWidth={1.5} className="text-red-500" />
                <span className="">Move to Trash</span>
              </button>
            </div>

            <div className="w-full border-t border-gray-300 my-1 mx-2" />

            {/* Page Settings */}
            <div className="flex flex-col text-[14px]">
              <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setIsSmallText(!isSmallText)}>
                <div className="flex items-center gap-3 text-gray-700">
                  <Type size={16} strokeWidth={1.5} className="text-gray-600" />
                  <span className="">Small text</span>
                </div>
                {/* Toggle Switch */}
                <div className={`w-8 h-4.5 rounded-full relative transition-colors border border-transparent ${isSmallText ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${isSmallText ? 'translate-x-[14px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setIsFullWidth(!isFullWidth)}>
                <div className="flex items-center gap-3 text-gray-700">
                  <MoveHorizontal size={16} strokeWidth={1.5} className="text-gray-600" />
                  <span className="">Full width</span>
                </div>
                <div className={`w-8 h-4.5 rounded-full relative transition-colors border border-transparent ${isFullWidth ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${isFullWidth ? 'translate-x-[14px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700">
                <Sliders size={16} strokeWidth={1.5} className="text-gray-600" />
                <span className="">Customize page</span>
              </button>
            </div>

            <div className="w-full border-t border-gray-300 my-1 mx-2" />

            {/* Advanced & Import/Export */}
            <div className="flex flex-col text-[14px]">
              <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setIsLocked(!isLocked)}>
                <div className="flex items-center gap-3 text-gray-700">
                  <Lock size={16} strokeWidth={1.5} className="text-gray-600" />
                  <span className="">Lock page</span>
                </div>
                <div className={`w-8 h-4.5 rounded-full relative transition-colors border border-transparent ${isLocked ? 'bg-blue-500' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${isLocked ? 'translate-x-[14px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700">
                <MessageSquarePlus size={16} strokeWidth={1.5} className="text-gray-600" />
                <span className="">Suggest edits</span>
              </button>
              <button className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700">
                <div className="flex items-center gap-3">
                  <Languages size={16} strokeWidth={1.5} className="text-gray-600" />
                  <span className="">Translate</span>
                </div>
                <ChevronDown size={14} className="text-gray-400 -rotate-90" />
              </button>

              <div className="w-full border-t border-gray-300 my-1 mx-2" />

              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700">
                <FileDown size={16} strokeWidth={1.5} className="text-gray-600" />
                <span className="">Import</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-100 transition-colors text-gray-700">
                <Upload size={16} strokeWidth={1.5} className="text-gray-600" />
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

        {/* === SCROLLABLE CONTENT AREA === */}
        <div className="flex-1 overflow-y-auto">
          {/* Cover Image */}
          {note.coverImage && (
            <div className="h-[30vh] w-full relative group">
              <img src={note.coverImage} alt="Cover" className="w-full h-full object-cover" />
              <button
                onClick={() => setShowCoverMenu(true)}
                className="absolute bottom-2 right-2 bg-white/80 hover:bg-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Change cover
              </button>
            </div>
          )}

          {/* Cover Menu Popover */}
          {showCoverMenu && (
            <div className="absolute top-20 right-10 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 w-[500px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-[#F7F7F5]">
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
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'upload' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab('link')}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'link' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                  Link
                </button>
                <button
                  onClick={removeCover}
                  className="ml-auto px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>

              <div className="p-4 bg-white">
                {activeTab === 'link' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={coverInput}
                        onChange={(e) => setCoverInput(e.target.value)}
                        placeholder="Paste an image link..."
                        className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors"
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
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg p-8 hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="bg-gray-100 p-3 rounded-full mb-3">
                      <Upload size={20} className="text-gray-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-600">Upload file</p>
                    <p className="text-xs text-gray-400 mt-1">Images up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="max-w-4xl ml-20 px-8 pb-20">
            {/* Icon */}
            {note.icon && (
              <div className={`text-[78px] mb-4 relative z-10 group w-fit ${note.coverImage ? 'mt-[-40px]' : 'mt-4'}`}>
                <div className="cursor-pointer hover:bg-gray-100 rounded px-2 transition-colors" onClick={() => setShowIconMenu(true)}>
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
              placeholder="New page"
              className="text-5xl font-bold w-full outline-none placeholder:text-gray-200 text-[#37352f] mb-6"
            />

            {/* TipTap Editor Content */}
            {editor && (
              <BubbleMenu editor={editor} options={{ duration: 100 }} className="flex items-center gap-1 bg-white shadow-xl border border-gray-200 rounded-lg px-2 py-1.5 animate-in fade-in zoom-in-95 duration-200">

                {/* Node Type Selector */}
                <div className="relative flex items-center gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button
                    className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded min-w-[80px] justify-between"
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
                    <ChevronDown size={12} className="text-gray-400 flex-shrink-0" />
                  </button>

                  {/* Type Menu Dropdown */}
                  {showTypeMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 w-[200px] z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
                      <div className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50">Turn into</div>
                      <div className="p-1.5 flex flex-col gap-0.5 max-h-[300px] overflow-y-auto">
                        {[
                          { label: 'Text', icon: <Type size={14} />, isActive: () => editor.isActive('paragraph'), action: () => editor.chain().focus().setParagraph().run() },
                          { label: 'Heading 1', icon: <Heading1 size={14} />, isActive: () => editor.isActive('heading', { level: 1 }), action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
                          { label: 'Heading 2', icon: <Heading2 size={14} />, isActive: () => editor.isActive('heading', { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
                          { label: 'Heading 3', icon: <Heading3 size={14} />, isActive: () => editor.isActive('heading', { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
                          { label: 'Bulleted list', icon: <List size={14} />, isActive: () => editor.isActive('bulletList'), action: () => editor.chain().focus().toggleBulletList().run() },
                          { label: 'Numbered list', icon: <ListOrdered size={14} />, isActive: () => editor.isActive('orderedList'), action: () => editor.chain().focus().toggleOrderedList().run() },
                          { label: 'To-do list', icon: <CheckSquare size={14} />, isActive: () => editor.isActive('taskList'), action: () => editor.chain().focus().toggleTaskList().run() }, // Requires extension-task-list
                          { label: 'Quote', icon: <Quote size={14} />, isActive: () => editor.isActive('blockquote'), action: () => editor.chain().focus().toggleBlockquote().run() },
                          { label: 'Code', icon: <Code size={14} />, isActive: () => editor.isActive('codeBlock'), action: () => editor.chain().focus().toggleCodeBlock().run() },
                        ].map((type) => (
                          <button
                            key={type.label}
                            onClick={() => {
                              type.action();
                              setShowTypeMenu(false);
                            }}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
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
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${editor.isActive('bold') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                  >
                    <Bold size={15} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${editor.isActive('italic') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                  >
                    <Italic size={15} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${editor.isActive('underline') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                  >
                    <UnderlineIcon size={15} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${editor.isActive('strike') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                  >
                    <Strikethrough size={15} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${editor.isActive('code') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                  >
                    <Code size={15} />
                  </button>

                  {/* Link */}
                  <button
                    onClick={() => {
                      const previousUrl = editor.getAttributes('link').href;
                      const url = window.prompt('URL', previousUrl);
                      if (url === null) return;
                      if (url === '') {
                        editor.chain().focus().extendMarkRange('link').unsetLink().run();
                        return;
                      }
                      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                    }}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors ${editor.isActive('link') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                  >
                    <LinkIcon size={15} />
                  </button>

                  {/* Color Picker Container */}
                  <div className="relative">
                    <button
                      onClick={() => setShowColorMenu(!showColorMenu)}
                      className={`p-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-0.5 ${showColorMenu ? 'bg-gray-100 text-black' : 'text-gray-600'}`}
                    >
                      <span className="text-sm font-serif font-bold">A</span>
                      <ChevronDown size={10} className="opacity-50" />
                    </button>

                    {/* Color Dropdown */}
                    {showColorMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-[200px] z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-3 max-h-[400px] overflow-y-auto">

                        {/* Recently Used (Placeholder) */}
                        <div>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Recently used</div>
                          <div className="flex gap-2">
                            <button className="w-7 h-7 rounded-md border border-gray-200 bg-[#FBF3DB] hover:opacity-90 transition-opacity"></button>
                          </div>
                        </div>

                        {/* Text Color Section */}
                        <div>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Text color</div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {colors.map((c) => (
                              <button
                                key={`text-${c.name}`}
                                onClick={() => {
                                  editor.chain().focus().setColor(c.color).run();
                                  setShowColorMenu(false);
                                }}
                                className="w-7 h-7 mx-auto rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 text-base font-serif font-bold"
                                style={{ color: c.color }}
                                title={c.name}
                              >
                                A
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Background Color Section */}
                        <div>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Background color</div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {colors.map((c) => (
                              <button
                                key={`bg-${c.name}`}
                                onClick={() => {
                                  if (c.bg) {
                                    editor.chain().focus().toggleHighlight({ color: c.bg }).run();
                                  } else {
                                    editor.chain().focus().unsetHighlight().run();
                                  }
                                  setShowColorMenu(false);
                                }}
                                className={`w-7 h-7 mx-auto rounded-md border border-gray-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${!c.bg ? 'bg-white' : ''}`}
                                style={{ backgroundColor: c.bg || 'transparent' }}
                                title={`${c.name} Background`}
                              >
                                {!c.bg && <div className="w-full h-px bg-red-400 rotate-45 transform scale-110"></div>}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </BubbleMenu>
            )}
            <EditorContent editor={editor} className="prose max-w-none focus:outline-none prose-p:my-1 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 leading-normal text-[#37352f]" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;