import axios from "axios"


const FetchNotes = async (token, setNotes, setUserId) => {
    if (!token) return;
    const { data } = await axios.get("http://localhost:5000/notes", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Received notes from server:", data);
    setNotes(data.map(note => ({ ...note, body: note.body, showFullNote: false })));
    setUserId(data[0].userId);
  };

export default FetchNotes

