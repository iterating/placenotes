import React, { useRef, useEffect } from 'react';
import L from 'leaflet';

const MapWithMarkers = ({ notes }) => {
  const mapRef = useRef(null);
  console.log("Notes:", notes);

  useEffect(() => {
    let map;
    if (!mapRef.current) {
      map = L.map(mapRef.current).setView([34.052235, -118.243683], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        subdomains: ['a', 'b', 'c']
      }).addTo(map);
    }

    if (notes) {
      notes.forEach(note => {
        if (!note.location) {
          return;
        }
        const marker = L.marker([note.location.coordinates[1], note.location.coordinates[0]]).addTo(map);
        const noteTitle = document.querySelector(`#note-${note._id} .note-preview`)?.textContent;
        marker.bindPopup(`${noteTitle}<br /><a href="/notes/${note._id}/edit">View Note</a>`);
        marker.on('mouseover', function() {
          const noteElement = document.querySelector(`#note-${note._id}`);
          if (noteElement) {
            noteElement.style.backgroundColor = "#add8e6";
          }
        });
        marker.on('mouseout', function() {
          const noteElement = document.querySelector(`#note-${note._id}`);
          if (noteElement) {
            noteElement.style.backgroundColor = "";
          }
        });
      });
    }

    if (map) {
      map.invalidateSize();
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [notes]);

  return (
    <div className="map-container" style={{ height: "400px", width: "100%" }}>
      <div id="map" className="map" ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
};

export default MapWithMarkers;

