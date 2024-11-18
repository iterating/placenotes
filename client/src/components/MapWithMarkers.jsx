import React, { useEffect } from "react";
import L from "leaflet";
// import "./MapWithMarkers.css";

const MapWithMarkers = ({ notes }) => {
  useEffect(() => {
    const map = L.map("map").setView([34.052235, -118.243683], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      subdomains: ["a", "b", "c"],
    }).addTo(map);

    notes.forEach((note) => {
      const marker = L.marker([note.location.coordinates[1], note.location.coordinates[0]]).addTo(map);
      const notetitle = document.querySelector(`#note-${note._id} .note-preview`).textContent;
      marker.bindPopup(`${notetitle}<br /><a href="/notes/${note._id}/edit">View Note</a>`);
      marker.on("mouseover", function () {
        const noteElement = document.querySelector(`#note-${note._id}`);
        noteElement.style.backgroundColor = "#add8e6";
      });
      marker.on("mouseout", function () {
        const noteElement = document.querySelector(`#note-${note._id}`);
        noteElement.style.backgroundColor = "";
      });
    });

    return () => {
      map.remove();
    };
  }, [notes]);

  return <div id="map" style={{ height: "400px" }}></div>;
};

export { MapWithMarkers };