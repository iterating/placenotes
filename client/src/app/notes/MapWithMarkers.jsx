// import React, { useRef, useEffect } from 'react';
// import L from 'leaflet';
// import "./Notes.css";
// import "leaflet/dist/leaflet.css"


// const MapWithMarkers = ({ notes }) => {
//   const mapRef = useRef(null);

//   useEffect(() => {
//     if (!mapRef.current) return;

//     const map = L.map(mapRef.current, {
//       center: [0, 0],
//       zoom: 1,
//       layers: [
//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
//         })
//       ]
//     });

//     const markers = notes?.map(note => {
//       if (!note.location || !note.location.coordinates) return null;
//       const marker = L.marker([note.location.coordinates[1], note.location.coordinates[0]])
//         .addTo(map)
//         .bindPopup(`${note.title}<br /><a href="/notes/${note._id}/edit">View Note</a>`);

//       marker.on('mouseover', () => {
//         document.querySelector(`#note-${note._id}`)?.style.setProperty('background-color', '#add8e6');
//       });
//       marker.on('mouseout', () => {
//         document.querySelector(`#note-${note._id}`)?.style.removeProperty('background-color');
//       });

//       return marker;
//     }).filter(Boolean);

//     map.invalidateSize();

//     return () => {
//       markers?.forEach(marker => map.removeLayer(marker));
//       map.remove();
//     };
//   }, [notes]);

//   return (
//     <div className="map-container" style={{ height: "400px", width: "100%", position: "relative" }}>
//       <div id="map" className="map" ref={mapRef} style={{ height: "100%", width: "100%", position: "relative" }}></div>
//     </div>
//   );
// };

// export default MapWithMarkers;

