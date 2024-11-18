const NotesEdit = (props) => {
  return (
    <div className="edit-container">
    <h1 className="title">Edit Note</h1>
    <form
      action={`/notes/${props.note.id}/edit`}
      method="post"
      className="edit-note-form">
      {/* hidden input needed to send PUT request, default HTML forms only support GET and POST */}
      <input type="hidden" name="_method" value="PUT" />

      <label htmlFor="note-body">Note:</label><br />
      <textarea name="body" id="note-body" rows="20" cols="200" required>
        {props.note.body}
      </textarea><br />

      {props.children}
      <button type="submit">Save Changes</button>
    </form>
    <a href="/notes" className="button">Cancel</a><br>
    <form
      action={`/notes/${props.note.id}/delete`}
      method="POST"
      className="button delete-button">
      <button type="submit" className="button delete-button">Delete</button>
      <input type="hidden" name="_method" value="DELETE" />
    </form>

      <p><a href="/notes">Back to All Notes</a></p>
    </div>
  );
};

export default NotesEdit;

