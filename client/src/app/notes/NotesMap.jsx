import L from "leaflet";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";


const NotesMap = React.memo(({ notes, handleMouseOver, handleMouseOut, markers }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(
        [34.052235, -118.243683],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        mapInstance.current
      );
    }

    const map = mapInstance.current;

    markers.current.forEach((marker) => map.removeLayer(marker));
    markers.current = notes?.flatMap((note) => {
      if (!note.location) return [];
      const marker = L.marker([
        note.location.coordinates[1],
        note.location.coordinates[0],
      ]).addTo(map);
      marker.bindPopup(
        `<div>${note.body.split('\n')[0]}</div><a href="/notes/${note._id}/edit">Edit Note</a>`
      );

      marker.on("mouseover", () => {
        handleMouseOver(note._id);
        marker.openPopup();
      });

      marker.on("mouseout", () => {
        handleMouseOut(note._id);
        marker.closePopup();
      });

      return [marker];
    });

    map.invalidateSize();
  }, [notes, handleMouseOver, handleMouseOut, markers]);

  return <div id="map" ref={mapRef} style={{ height: "400px" }}></div>;
});

export default NotesMap