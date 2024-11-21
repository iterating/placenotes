import axios from "axios";

const fetchOneNote = async (token, id) => {
  if (!token) return {};
  const { data } = await axios.get(`http://localhost:5000/notes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

const fetchUsersNotes = async (token, setNotes, setUserId) => {
  if (!token) return;
  const { data } = await axios.get("http://localhost:5000/notes", {
    headers: { Authorization: `Bearer ${token}` },
  });
  setNotes(data.map(note => ({ ...note, body: note.body, showFullNote: false })));
  setUserId(data[0].userId);
};

export { fetchOneNote, fetchUsersNotes };

