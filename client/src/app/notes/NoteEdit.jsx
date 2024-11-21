import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import noteSlice from "../../store/noteSlice";
import { useCallback, useEffect } from "react";
import "./Notes.css";
import Mapmark from "./Mapmark";

const NotesEdit = ({ note }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  console.log("NotesEdit token:", token);
  console.log("NotesEdit note:", note);

  const [body, setBody] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [radius, setRadius] = useState(0);

  useEffect(() => {
    if (note) {
      setBody(note.body);
      setCoordinates(note.location.coordinates);
      setRadius(note.radius);
    }
  }, [note]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        console.log("Updating note:", { body, location: { type: "Point", coordinates }, radius });
        await dispatch(noteSlice.actions.updateNote({ token, id: note._id, note: { body, location: { type: "Point", coordinates }, radius } }));
        console.log("Note updated successfully");
        navigate(`/notes/`);
      } catch (err) {
        console.error("Error updating note:", err);
      }
    },
    [body, coordinates, radius, token, navigate, dispatch]
  );

  const handleDelete = useCallback(
    async () => {
      try {
        console.log("Deleting note with id:", note._id);
        await dispatch(noteSlice.actions.deleteNote({ token, id: note._id }));
        console.log("Note deleted successfully");
        navigate(`/notes/`);
      } catch (err) {
        console.error("Error deleting note:", err);
      }
    },
    [token, navigate, dispatch]
  );

  return (
    <div>
      <h1>Edit Note</h1>
      <form onSubmit={handleSubmit} className="edit-note-form">
        <Mapmark
          note={note}
          onLocationChange={setCoordinates}
          onRadiusChange={setRadius}
          coordinates={coordinates}
          radius={radius}
        />
        <label htmlFor="body">Note:</label>
        <textarea
          name="body"
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ height: "400px", width: "800px" }}
        ></textarea>
        <button type="submit">Save Changes</button>
        <button type="button" onClick={() => navigate(-1)}>
          Go Back
        </button>
        <button type="button" onClick={handleDelete}>
          Delete Note
        </button>
      </form>
    </div>
  );
};

export default NotesEdit;

