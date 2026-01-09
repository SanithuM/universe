import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
  Star, Share, MoreHorizontal, Smile, ImageIcon, MessageSquare, Menu,
  Upload, Link as LinkIcon, X, Bold, Italic, Underline as UnderlineIcon,
  Strikethrough, Code, Sparkles, ChevronDown, MessageSquarePlus, Palette
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
  const [activeTab, setActiveTab] = useState('link'); // 'upload' | 'link'
  const [coverInput, setCoverInput] = useState('');

  // Icon Menu State
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [activeIconTab, setActiveIconTab] = useState('emoji'); // 'emoji' | 'icons' | 'upload'

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false }
      }),
      Placeholder.configure({
        placeholder: "Write here ...",
      }),
      BubbleMenuExtension,
      
      TextStyle,
      Color,
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
            <button className="hover:bg-gray-100 p-1 rounded">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

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

                {/* AI / Comment Group */}
                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded transition-colors">
                    <Sparkles size={14} />
                    Ask AI
                  </button>
                  <button className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors">
                    <MessageSquarePlus size={14} />
                    Comment
                  </button>
                </div>

                {/* Node Type Selector (Simplified) */}
                <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1">
                  <button
                    className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => {
                      const isHeading = editor.isActive('heading');
                      if (isHeading) editor.chain().focus().setParagraph().run();
                      else editor.chain().focus().toggleHeading({ level: 2 }).run();
                    }}
                  >
                    {editor.isActive('heading', { level: 1 }) ? 'H1' :
                      editor.isActive('heading', { level: 2 }) ? 'H2' :
                        editor.isActive('heading', { level: 3 }) ? 'H3' : 'Text'}
                    <ChevronDown size={12} className="text-gray-400" />
                  </button>
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

                  {/* Color (Simplified toggle to Red for demo) */}
                  <button
                    onClick={() => {
                      if (editor.isActive('textStyle', { color: '#E03E3E' })) {
                        editor.chain().focus().unsetColor().run();
                      } else {
                        editor.chain().focus().setColor('#E03E3E').run();
                      }
                    }}
                    className={`p-1 rounded hover:bg-gray-100 transition-colors flex items-center gap-0.5 ${editor.isActive('textStyle', { color: '#E03E3E' }) ? 'text-red-500 bg-red-50' : 'text-gray-600'}`}
                  >
                    <span className="text-sm font-serif font-bold">A</span>
                    <ChevronDown size={10} className="opacity-50" />
                  </button>
                </div>
              </BubbleMenu>
            )}
            <EditorContent editor={editor} className="prose prose-lg max-w-none focus:outline-none" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default NoteEditor;