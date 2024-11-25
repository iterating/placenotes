import axios from "axios";

const fetchOneNote = async (token, id) => {
  if (!token) return {};
  try {
    const { data } = await axios.get(`http://localhost:5000/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    console.error("Error fetching note:", error);
    return {};
  }
};

const fetchUsersNotes = async (token, setNotes, setUserId) => {
  if (!token) return;
  try {
    const { data } = await axios.get("http://localhost:5000/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const notes = data.map(note => ({ ...note, showFullNote: false }));
    setNotes(notes);
    if (notes.length) setUserId(notes[0].userId);
  } catch (error) {
    console.error("Error fetching user notes:", error);
  }
};

export { fetchOneNote, fetchUsersNotes };

