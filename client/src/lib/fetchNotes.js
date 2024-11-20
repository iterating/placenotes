import axios from "axios";

export const fetchOneNote = async (token, id) => {
  console.log("FetchOneNote called with token:", token, "and id:", id);
  if (!token) return;
  console.log("Fetching note:", id);
  try {
    const { data } = await axios.get(`http://localhost:5000/notes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Fetched note:", data);
    return data;
  } catch (error) {
    console.error("Error fetching note:", error);
    return {};
  }
};


export const fetchUsersNotes = async (token, setNotes, setUserId) => {
  console.log("FetchUsersNotes called with token:", token);
  if (!token) return;
  console.log("Fetching users notes");
  try {
    const { data } = await axios.get("http://localhost:5000/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Received notes from server:", data);
    setNotes(data.map(note => ({ ...note, body: note.body, showFullNote: false })));
    setUserId(data[0].userId);
  } catch (error) {
    console.error("Error fetching users notes:", error);
  }
};

export default {}
