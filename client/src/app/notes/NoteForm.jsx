import React, { useState, useRef } from 'react';
import axios from 'axios';

const NoteForm = () => {
  const [noteBody, setNoteBody] = useState('');
  const mapRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/notes/new', {
        body: noteBody,
        location: mapRef.current.getCenter(),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Note created:', response.data);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  return (
    <div className="edit-container">
      <h1 className="title">Create New Note</h1>
      <form onSubmit={handleSubmit} className="edit-note-form">
        <label htmlFor="note-body">Note:</label><br />
        <textarea
          name="body"
          id="note-body"
          rows="8"
          cols="80"
          required
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
        ></textarea>
        <div id="map-container" ref={mapRef} className="map" style={{ height: '400px' }}></div>
        <input type="submit" value="Create Note" />
        <a href="/notes" className="button">Cancel</a>
      </form>
      <p><a href="/notes">View All Notes</a></p>
    </div>
  );
};

export default NoteForm;

