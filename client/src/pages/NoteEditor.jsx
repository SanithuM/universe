import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Star, Share, MoreHorizontal, Smile, ImageIcon, MessageSquare } from 'lucide-react';
import api from '../api/axios';
import debounce from 'lodash.debounce'; // You might need to install this: npm i lodash.debounce

const NoteEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState({ title: '', content: '', icon: null, coverImage: null, isFavorite: false });
  const [loading, setLoading] = useState(true);

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Type '/' for commands...",
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

  const toggleFavorite = () => {
    const newStatus = !note.isFavorite;
    setNote(prev => ({ ...prev, isFavorite: newStatus }));
    debouncedSave({ isFavorite: newStatus });
  };

  // Placeholders for now - you can implement actual pickers later
  const handleAddIcon = () => {
    const emoji = prompt("Enter an emoji:");
    if (emoji) {
        setNote(prev => ({ ...prev, icon: emoji }));
        debouncedSave({ icon: emoji });
    }
  };
  const handleAddCover = () => {
      const url = prompt("Enter image URL:");
      if(url) {
          setNote(prev => ({...prev, coverImage: url}));
          debouncedSave({ coverImage: url });
      }
  }


  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-[#37352f]">
      {/* === HEADER === */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="truncate max-w-[200px]">{note.title || "Untitled"}</span>
          <span>/</span>
          <span className="text-gray-400">Private</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <button className="hover:bg-gray-100 p-1 rounded">Share</button>
          <button onClick={toggleFavorite} className={`hover:bg-gray-100 p-1 rounded ${note.isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`}>
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
            <div className="h-[20vh] w-full relative group">
                <img src={note.coverImage} alt="Cover" className="w-full h-full object-cover" />
                <button className="absolute bottom-2 right-2 bg-white/80 hover:bg-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">Change cover</button>
            </div>
        )}

        <div className="max-w-3xl mx-auto px-8 pb-20">
          {/* Icon */}
          {note.icon && (
            <div className="text-[78px] mt-[-40px] mb-4 relative z-10 group">
                {note.icon}
                <button className="absolute top-0 left-full ml-2 bg-white/80 hover:bg-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap" onClick={handleAddIcon}>Change icon</button>
            </div>
          )}

          {/* Options Bar (Add icon, cover, comment) */}
          <div className={`flex items-center gap-1 text-gray-400 text-sm mb-4 ${note.icon && note.coverImage ? 'hidden' : ''} group-hover:flex`}>
            {!note.icon && (
                <button onClick={handleAddIcon} className="hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                <Smile size={16} /> Add icon
                </button>
            )}
            {!note.coverImage && (
                <button onClick={handleAddCover} className="hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                <ImageIcon size={16} /> Add cover
                </button>
            )}
            <button className="hover:bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
              <MessageSquare size={16} /> Add comment
            </button>
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={note.title}
            onChange={handleTitleChange}
            placeholder="Untitled"
            className="text-4xl font-bold w-full outline-none placeholder:text-gray-300 mb-4"
          />

          {/* TipTap Editor Content */}
          <EditorContent editor={editor} className="prose prose-lg max-w-none focus:outline-none" />
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;