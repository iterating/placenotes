// import React, { useRef, useEffect } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// const Map = ({ notes }) => {
//   const mapRef = useRef(null);
//   const mapInstance = useRef(null);
//   const markers = useRef([]);

//   useEffect(() => {
//     if (!mapInstance.current) {
//       mapInstance.current = L.map(mapRef.current).setView(
//         [34.052235, -118.243683],
//         13
//       );
//       L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
//         mapInstance.current
//       );
//     }

//     const map = mapInstance.current;

//     markers.current.forEach((marker) => map.removeLayer(marker));
//     markers.current = notes?.flatMap((note) => {
//       if (!note.location) return [];
//       const marker = L.marker([
//         note.location.coordinates[1],
//         note.location.coordinates[0],
//       ]).addTo(map);
//       const notetitleElement = document.querySelector(
//         `#note-${note.id} .note-preview`
//       );
//       if (!notetitleElement) return [];
//       const notetitle = notetitleElement.textContent;
//       marker.bindPopup(
//         `${notetitle}<br /><a href="/notes/${note.id}/edit">View Note</a>`
//       );

//       marker.on("mouseover", () => {
//         document
//           .querySelector(`#note-${note.id}`)
//           ?.style.setProperty("background-color", "#add8e6");
//       });
//       marker.on("mouseout", () => {
//         document
//           .querySelector(`#note-${note.id}`)
//           ?.style.removeProperty("background-color");
//       });

//       return [marker];
//     });

//     map.invalidateSize();
//   }, [notes]);

//   return <div id="map" ref={mapRef} style={{ height: "400px" }}></div>;
// };

// export default Map;

