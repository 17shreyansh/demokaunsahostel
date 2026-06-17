import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { message } from 'antd';

const MenuBar = ({ editor }) => {
  const fileInputRef = useRef(null);

  if (!editor) return null;

  const addImageFromURL = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const uploadImage = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const hideLoading = message.loading('Uploading image...', 0);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/blog/admin/image/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      hideLoading();

      if (response.data.success) {
        editor.chain().focus().setImage({ src: response.data.data.url }).run();
        message.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      message.error(error.response?.data?.message || 'Failed to upload image');
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        message.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        message.error('Image size should be less than 10MB');
        return;
      }
      uploadImage(file);
    }
    e.target.value = '';
  };

  const setLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-1">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1 rounded ${editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white'}`}>
        <strong>B</strong>
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1 rounded ${editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white'}`}>
        <em>I</em>
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`px-3 py-1 rounded ${editor.isActive('strike') ? 'bg-blue-500 text-white' : 'bg-white'}`}>
        <s>S</s>
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-500 text-white' : 'bg-white'}`}>H1</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-500 text-white' : 'bg-white'}`}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-500 text-white' : 'bg-white'}`}>H3</button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-3 py-1 rounded ${editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-white'}`}>• List</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-3 py-1 rounded ${editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-white'}`}>1. List</button>
      <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={`px-3 py-1 rounded ${editor.isActive('taskList') ? 'bg-blue-500 text-white' : 'bg-white'}`}>☑ Task</button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`px-3 py-1 rounded ${editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-white'}`}>Quote</button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-3 py-1 rounded ${editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-white'}`}>Code</button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button onClick={setLink} className={`px-3 py-1 rounded ${editor.isActive('link') ? 'bg-blue-500 text-white' : 'bg-white'}`}>Link</button>
      <button onClick={handleImageUpload} className="px-3 py-1 rounded bg-white font-bold">📷 Upload</button>
      <button onClick={addImageFromURL} className="px-3 py-1 rounded bg-white">🔗 Image URL</button>
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`px-3 py-1 rounded ${editor.isActive('highlight') ? 'bg-yellow-300' : 'bg-white'}`}>Highlight</button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-3 py-1 rounded bg-white">HR</button>
      <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="px-3 py-1 rounded bg-white disabled:opacity-50">Undo</button>
      <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="px-3 py-1 rounded bg-white disabled:opacity-50">Redo</button>
    </div>
  );
};

export default function TiptapEditor({ content, onChange, placeholder = 'Start writing...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false
      }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Color,
      TextStyle,
      Placeholder.configure({ placeholder })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] p-4'
      }
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
