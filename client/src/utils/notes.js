// const Notes = ({ notes, user }) => {
//   return (
//     <div className="note-container">
//       <h1 className="title">Your Notes</h1>
//       <div className="map-container" id="map-container">
//         <div id="map" className="map" style={{ height: '400px' }}></div>
//       </div>

//       {notes.length > 0 ? (
//         notes.map(note => (
//           user && user._id && note.userId.toString() === user._id.toString() ? (
//             <div className="note" id={`note-${note._id}`} key={note._id}>
//               <div className="note-preview" data-note-id={note._id}>
//                 {marked(note.body.split('\n')[0])}
//               </div>
//               <div className="note-full" style={{ display: 'none' }}>
//                 {marked(note.body.split('\n').slice(1).join('\n'))}
//               </div>
//               <div className="note-actions-ui">
//                 <form action={`/notes/${note._id}/edit`} method="GET" className="button">
//                   <button type="submit">Edit</button>
//                 </form>
//                 <form
//                   action={`/notes/${note._id}/delete`}
//                   method="POST"
//                   className="button"
//                   className="delete-button"
//                 >
//                   <button type="submit">Delete</button>
//                   <input type="hidden" name="_method" value="DELETE" />
//                 </form>
//               </div>
//             </div>
//           ) : null
//         ))
//       ) : (
//         <p>You don't have any notes yet.</p>
//       )}
//       <p><a href="/notes/new">Create a new note</a></p>

//       <script>
//         function toggleNote(noteId) {
//           const noteFull = document.querySelector(`#note-${noteId} .note-full`)
//           if (noteFull.style.display === "none" || noteFull.style.display === "") {
//             noteFull.style.display = "block"
//           } else {
//             noteFull.style.display = "none"
//           }
//         }

//         const notePreviews = document.querySelectorAll(".note-preview")
//         notePreviews.forEach((element) => {
//           element.addEventListener("click", (event) => {
//             const noteId = element.getAttribute("data-note-id")
//             toggleNote(noteId)
//           })
//         })
//       </script>
//     </div>
//   );
// }


// import React, { useEffect } from 'react';
// import L from 'leaflet';

// const MapWithMarkers = ({ notes }) => {
//   useEffect(() => {
//     const map = L.map('map').setView([34.052235, -118.243683], 13);
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       subdomains: ['a', 'b', 'c']
//     }).addTo(map);

//     notes.forEach(note => {
//       const marker = L.marker([note.location.lat, note.location.lng]).addTo(map);
//       const notetitle = document.querySelector(`#note-${note.id} .note-preview`).textContent;
//       marker.bindPopup(`${notetitle}<br /><a href="/notes/${note.id}/edit">View Note</a>`);
//       marker.on('mouseover', function() {
//         const noteElement = document.querySelector(`#note-${note.id}`);
//         noteElement.style.backgroundColor = "#add8e6";
//       });
//       marker.on('mouseout', function() {
//         const noteElement = document.querySelector(`#note-${note.id}`);
//         noteElement.style.backgroundColor = "";
//       });
//     });

//     return () => {
//       map.remove();
//     };
//   }, [notes]);

//   return <div id="map" style={{ height: '400px' }}></div>;
// };

// export default MapWithMarkers;

