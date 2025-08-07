import React, { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap, indentWithTab, undo, redo } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import './NoteCodemirror.css';

const NoteCodemirror = ({ content = '', onUpdate, editable = true }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      history(),
      keymap.of([historyKeymap, defaultKeymap, indentWithTab]),
      basicSetup,
      EditorView.lineWrapping,
      markdown(),
      placeholder('Write something...'),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onUpdate) {
          const content = update.state.doc.toString();
          onUpdate(content);
        }
      }),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        '.cm-content': {
          padding: '16px',
          minHeight: '200px',
          lineHeight: '1.6'
        },
        '.cm-focused': {
          outline: 'none'
        },
        '.cm-editor': {
          border: '1px solid #e2e8f0',
          borderRadius: '8px'
        },
        '.cm-editor.cm-focused': {
          borderColor: '#3b82f6',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        }
      })
    ];

    if (!editable) {
      extensions.push(EditorState.readOnly.of(true));
    }

    const state = EditorState.create({
      doc: content,
      extensions
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [editable]);

  useEffect(() => {
    if (viewRef.current && content !== viewRef.current.state.doc.toString()) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content
        }
      });
      viewRef.current.dispatch(transaction);
    }
  }, [content]);

  const handleUndo = () => {
    if (viewRef.current) {
      undo(viewRef.current);
    }
  };

  const handleRedo = () => {
    if (viewRef.current) {
      redo(viewRef.current);
    }
  };

  const wrapSelection = (prefix, suffix = prefix) => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.doc.sliceString(from, to);
    
    const newText = `${prefix}${selectedText}${suffix}`;
    
    view.dispatch({
      changes: { from, to, insert: newText },
      selection: { anchor: from + prefix.length, head: to + prefix.length }
    });
    
    view.focus();
  };

  const insertAtCursor = (text) => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const { from } = view.state.selection.main;
    
    view.dispatch({
      changes: { from, insert: text },
      selection: { anchor: from + text.length }
    });
    
    view.focus();
  };

  const handleBold = () => wrapSelection('**');
  const handleItalic = () => wrapSelection('*');
  const handleStrikethrough = () => wrapSelection('~~');
  const handleCode = () => wrapSelection('`');
  
  const handleHeading = () => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);
    const lineStart = line.from;
    const lineText = line.text;
    
    // Toggle heading levels or add heading
    if (lineText.startsWith('### ')) {
      view.dispatch({
        changes: { from: lineStart, to: lineStart + 4, insert: '' }
      });
    } else if (lineText.startsWith('## ')) {
      view.dispatch({
        changes: { from: lineStart, to: lineStart + 3, insert: '### ' }
      });
    } else if (lineText.startsWith('# ')) {
      view.dispatch({
        changes: { from: lineStart, to: lineStart + 2, insert: '## ' }
      });
    } else {
      view.dispatch({
        changes: { from: lineStart, insert: '# ' }
      });
    }
    
    view.focus();
  };

  const handleLink = () => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const { from, to } = view.state.selection.main;
    const selectedText = view.state.doc.sliceString(from, to);
    
    const linkText = selectedText || 'link text';
    const newText = `[${linkText}](url)`;
    
    view.dispatch({
      changes: { from, to, insert: newText },
      selection: { 
        anchor: from + linkText.length + 3, 
        head: from + linkText.length + 6 
      }
    });
    
    view.focus();
  };

  const handleList = () => {
    if (!viewRef.current) return;
    
    const view = viewRef.current;
    const { from } = view.state.selection.main;
    const line = view.state.doc.lineAt(from);
    const lineStart = line.from;
    const lineText = line.text;
    
    if (lineText.startsWith('- ')) {
      view.dispatch({
        changes: { from: lineStart, to: lineStart + 2, insert: '' }
      });
    } else {
      view.dispatch({
        changes: { from: lineStart, insert: '- ' }
      });
    }
    
    view.focus();
  };

  return (
    <div className="codemirror-editor">
      <div className="editor-toolbar">
        <div className="toolbar-info">
          <span className="editor-mode">Markdown</span>
        </div>
        {editable && (
          <div className="toolbar-actions">
            <button
              className="toolbar-button"
              onClick={handleBold}
              title="Bold"
              aria-label="Bold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              </svg>
            </button>
            <button
              className="toolbar-button"
              onClick={handleItalic}
              title="Italic"
              aria-label="Italic"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="4" x2="10" y2="4" />
                <line x1="14" y1="20" x2="5" y2="20" />
                <line x1="15" y1="4" x2="9" y2="20" />
              </svg>
            </button>
            <button
              className="toolbar-button"
              onClick={handleStrikethrough}
              title="Strikethrough"
              aria-label="Strikethrough"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                <path d="M14 12a4 4 0 0 1 0 8H6" />
                <line x1="4" y1="12" x2="20" y2="12" />
              </svg>
            </button>
            <button
              className="toolbar-button"
              onClick={handleCode}
              title="Inline Code"
              aria-label="Inline Code"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </button>
            <div className="toolbar-divider"></div>
            <button
              className="toolbar-button"
              onClick={handleHeading}
              title="Heading"
              aria-label="Heading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 12h12" />
                <path d="M6 20V4" />
                <path d="M18 20V4" />
              </svg>
            </button>
            <button
              className="toolbar-button"
              onClick={handleList}
              title="Bullet List"
              aria-label="Bullet List"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
            <button
              className="toolbar-button"
              onClick={handleLink}
              title="Link"
              aria-label="Link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
            <div className="toolbar-divider"></div>
            <button
              className="toolbar-button"
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
              </svg>
            </button>
            <button
              className="toolbar-button"
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div ref={editorRef} className="editor-container" />
    </div>
  );
};

export default NoteCodemirror;