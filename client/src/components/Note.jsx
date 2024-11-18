import React from "react";
import { marked } from "marked";

const Note = ({ note }) => {
  const toggleNote = (noteId) => {
    const noteFull = document.querySelector(`#note-${noteId} .note-full`);
    if (noteFull.style.display === "none" || noteFull.style.display === "") {
      noteFull.style.display = "block";
    } else {
      noteFull.style.display = "none";
    }
  };

  return (
    <div>
      <div className="note-preview" onClick={() => toggleNote(note._id)} data-note-id={note._id}>
        {marked(note.body.split('\n')[0])}
      </div>
      <div className="note-full" style={{ display: 'none' }}>
        {marked(note.body.split('\n').slice(1).join('\n'))}
      </div>
      <div className="note-actions-ui">
        <form action={`/notes/${note._id}/edit`} method="GET" className="button">
          <button type="submit">Edit</button>
        </form>
        <br/>
        <form action={`/notes/${note._id}/delete`} method="POST" className="button delete-button">
          <button type="submit">Delete</button>
          <input type="hidden" name="_method" value="DELETE" />
        </form>
      </div>
    </div>
  );
};

export default Note;