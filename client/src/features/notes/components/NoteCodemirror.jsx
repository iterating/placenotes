import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { placeholder } from '@codemirror/view';
import './NoteCodemirror.css';

const NoteCodemirror = ({ content = '', onUpdate, editable = true }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      basicSetup,
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

  return (
    <div className="codemirror-editor">
      <div className="editor-toolbar">
        <div className="toolbar-info">
          <span className="editor-mode">Markdown</span>
        </div>
      </div>
      <div ref={editorRef} className="editor-container" />
    </div>
  );
};

export default NoteCodemirror;