import { Color } from "@tiptap/extension-color"
import ListItem from "@tiptap/extension-list-item"
import TextStyle from "@tiptap/extension-text-style"
import { EditorProvider, useCurrentEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import React from "react"
import { marked } from "marked"

const MenuBar = () => {
  const { editor } = useCurrentEditor()

  if (!editor) {
    console.log("Editor not initialized")
    return null
  }

  console.log("Editor initialized")

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleBold().run()
              console.log("Toggled Bold")
            }
          }}
          disabled={!editor || !editor.can().chain().focus().toggleBold().run()}
          className={editor && editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleItalic().run()
              console.log("Toggled Italic")
            }
          }}
          disabled={!editor || !editor.can().chain().focus().toggleItalic().run()}
          className={editor && editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleStrike().run()
              console.log("Toggled Strike")
            }
          }}
          disabled={!editor || !editor.can().chain().focus().toggleStrike().run()}
          className={editor && editor.isActive("strike") ? "is-active" : ""}
        >
          Strike
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleCode().run()
              console.log("Toggled Code")
            }
          }}
          disabled={!editor || !editor.can().chain().focus().toggleCode().run()}
          className={editor && editor.isActive("code") ? "is-active" : ""}
        >
          Code
        </button>
        <button onClick={() => {
          if (editor) {
            editor.chain().focus().unsetAllMarks().run()
            console.log("Cleared all marks")
          }
        }}>
          Clear marks
        </button>
        <button onClick={() => {
          if (editor) {
            editor.chain().focus().clearNodes().run()
            console.log("Cleared nodes")
          }
        }}>
          Clear nodes
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().setParagraph().run()
              console.log("Set to Paragraph")
            }
          }}
          className={editor && editor.isActive("paragraph") ? "is-active" : ""}
        >
          Paragraph
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleHeading({ level: 1 }).run()
              console.log("Toggled Heading 1")
            }
          }}
          className={
            editor &&
            editor.isActive("heading", { level: 1 }) ?
              "is-active"
              :
              ""
          }
        >
          H1
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleHeading({ level: 2 }).run()
              console.log("Toggled Heading 2")
            }
          }}
          className={
            editor &&
            editor.isActive("heading", { level: 2 }) ?
              "is-active"
              :
              ""
          }
        >
          H2
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleHeading({ level: 3 }).run()
              console.log("Toggled Heading 3")
            }
          }}
          className={
            editor &&
            editor.isActive("heading", { level: 3 }) ?
              "is-active"
              :
              ""
          }
        >
          H3
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleHeading({ level: 4 }).run()
              console.log("Toggled Heading 4")
            }
          }}
          className={
            editor &&
            editor.isActive("heading", { level: 4 }) ?
              "is-active"
              :
              ""
          }
        >
          H4
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleHeading({ level: 5 }).run()
              console.log("Toggled Heading 5")
            }
          }}
          className={
            editor &&
            editor.isActive("heading", { level: 5 }) ?
              "is-active"
              :
              ""
          }
        >
          H5
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleHeading({ level: 6 }).run()
              console.log("Toggled Heading 6")
            }
          }}
          className={
            editor &&
            editor.isActive("heading", { level: 6 }) ?
              "is-active"
              :
              ""
          }
        >
          H6
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleBulletList().run()
              console.log("Toggled Bullet List")
            }
          }}
          className={
            editor &&
            editor.isActive("bulletList") ?
              "is-active"
              :
              ""
          }
        >
          Bullet list
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleOrderedList().run()
              console.log("Toggled Ordered List")
            }
          }}
          className={
            editor &&
            editor.isActive("orderedList") ?
              "is-active"
              :
              ""
          }
        >
          Ordered list
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleCodeBlock().run()
              console.log("Toggled Code Block")
            }
          }}
          className={
            editor &&
            editor.isActive("codeBlock") ?
              "is-active"
              :
              ""
          }
        >
          Code block
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().toggleBlockquote().run()
              console.log("Toggled Blockquote")
            }
          }}
          className={
            editor &&
            editor.isActive("blockquote") ?
              "is-active"
              :
              ""
          }
        >
          Blockquote
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().setHorizontalRule().run()
              console.log("Inserted Horizontal Rule")
            }
          }}
        >
          Horizontal rule
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().setHardBreak().run()
              console.log("Inserted Hard Break")
            }
          }}
        >
          Hard break
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().undo().run()
              console.log("Undo action")
            }
          }}
          disabled={!editor || !editor.can().chain().focus().undo().run()}
        >
          Undo
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().redo().run()
              console.log("Redo action")
            }
          }}
          disabled={!editor || !editor.can().chain().focus().redo().run()}
        >
          Redo
        </button>
        <button
          onClick={() => {
            if (editor) {
              editor.chain().focus().setColor("#958DF1").run()
              console.log("Set text color to Purple")
            }
          }}
          className={
            editor &&
            editor.isActive("textStyle", { color: "#958DF1" })
              ? "is-active"
              :
              ""
          }
        >
          Purple
        </button>
      </div>
    </div>
  )
}

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
]

export default ({ note }) => {
  console.log("Rendering EditorProvider with content:", note)
  return (
    <EditorProvider
      slotBefore={<MenuBar />}
      extensions={extensions}
      content={note}
    ></EditorProvider>
  )
}

