import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Markdown } from 'tiptap-markdown'
import React, { useEffect } from 'react'
import './NoteTiptap.css'

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="editor-menu">
      <div className="format-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`btn btn-sm ${editor.isActive('bold') ? 'is-active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`btn btn-sm ${editor.isActive('italic') ? 'is-active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`btn btn-sm ${editor.isActive('strike') ? 'is-active' : ''}`}
          title="Strikethrough"
        >
          S̶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`btn btn-sm ${editor.isActive('code') ? 'is-active' : ''}`}
          title="Inline Code"
        >
          &lt;&gt;
        </button>
      </div>

      <div className="heading-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`btn btn-sm ${editor.isActive('paragraph') ? 'is-active' : ''}`}
          title="Normal Text"
        >
          ¶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`btn btn-sm ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`btn btn-sm ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
          title="Heading 2"
        >
          H2
        </button>
      </div>

      <div className="list-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn btn-sm ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn btn-sm ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`btn btn-sm ${editor.isActive('taskList') ? 'is-active' : ''}`}
          title="Task List"
        >
          ☑
        </button>
      </div>

      <div className="block-group">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`btn btn-sm ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
          title="Code Block"
        >
          { }
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`btn btn-sm ${editor.isActive('blockquote') ? 'is-active' : ''}`}
          title="Quote Block"
        >
          "
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Insert Horizontal Line"
          className="btn btn-sm"
        >
          —
        </button>
      </div>

      <div className="history-group">
        <button 
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
          className="btn btn-sm"
        >
          ↩
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
          className="btn btn-sm"
        >
          ↪
        </button>
      </div>
    </div>
  )
}

const NoteTiptap = ({ content = '', onUpdate, editable = true }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: true,
        orderedList: true,
        codeBlock: true,
        blockquote: true,
        horizontalRule: true,
        strike: true,
        bold: true,
        italic: true,
        code: true,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'note-link',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        protocols: ['http', 'https', 'mailto', 'tel'],
        validate: href => /^https?:\/\//.test(href) || /^mailto:/.test(href) || /^tel:/.test(href),
      }),
      Image.configure({
        inline: true,
      }),
      Placeholder.configure({
        placeholder: 'Write something...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Markdown.configure({
        html: false,
        transformCopiedText: true,
        transformPastedText: true,
        breaks: true,
      }),
    ],
    content: content,
    editable,
    onUpdate: ({ editor }) => {
      const content = editor.storage.markdown.getMarkdown();
      onUpdate(content);
    },
    editorProps: {
      attributes: {
        class: 'editor-content',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.storage.markdown.getMarkdown()) {
      // Try to parse content as markdown first
      try {
        editor.commands.setContent(content, {
          parseOptions: { preserveWhitespace: 'full' }
        });
      } catch (e) {
        // If parsing as markdown fails, set as plain text
        editor.commands.setContent(content);
      }
    }
  }, [content, editor])

  return (
    <div className="editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default NoteTiptap