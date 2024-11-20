import { marked } from "marked"
import React from "react";
import "./Notes.css";

const Note = ({ note }) => {
  const [showFullNote, setShowFullNote] = React.useState(false);

  return (
    <div>
      <div className="note-preview" onClick={() => setShowFullNote(!showFullNote)} data-note-id={note._id}>
        <div dangerouslySetInnerHTML={{ __html: marked(showFullNote ? note.body : note.body.split('\n')[0]) }} />
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

