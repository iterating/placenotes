import React from 'react';

const NotesNew = () => {
  return (
    <div className="edit-container">
      <h1 className="title">Create New Note</h1>
      <form action="/notes/new" method="post" className="edit-note-form">
        <label htmlFor="note-body">Note:</label><br />
        <textarea name="body" id="note-body" rows="8" cols="80" required></textarea>
        <div id="map-container">
          <div id="map" className="map" style={{ height: '400px' }}></div>
        </div>
        <input type="submit" value="Create Note" />
        <a href="/notes" className="button">Cancel</a>
      </form>
      <p><a href="/notes">View All Notes</a></p>
    </div>
  );
};

export default NotesNew;
