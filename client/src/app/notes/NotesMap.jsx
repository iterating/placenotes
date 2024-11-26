import L from "leaflet";
import "leaflet-control-geocoder";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";

const NotesMap = React.memo(({ notes, handleMouseOver, handleMouseOut, markers }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const currentLocation = JSON.parse(sessionStorage.getItem("currentLocation")) || null;

  useEffect(() => {
    if (!mapInstance.current) {
      const initialView = currentLocation
        ? [currentLocation.latitude, currentLocation.longitude]
        : [34.052235, -118.243683]; // Default to LA if no location is found
      mapInstance.current = L.map(mapRef.current).setView(initialView, 13);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);

      const geocoder = L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
          format: "json",
          addressdetails: 1,
        },
      });
      const geocoderControl = L.Control.geocoder({ geocoder }).addTo(mapInstance.current);

      geocoderControl.on("markgeocode", (e) => {
        const latlng = e.geocode.center;
        const address = e.geocode.address;
        console.log("selected address:", address);
        const note = {
          _id: new Date().toISOString(),
          title: address.road + " " + address.house_number,
          body: address.display_name,
          location: {
            type: "Point",
            coordinates: [latlng.lng, latlng.lat],
          },
        };
        console.log("creating new note:", note);
        // dispatch(createNote(note)); // Uncomment to actually dispatch the action
      });
    }

    const map = mapInstance.current;

    // Clear previous markers
    markers.current.forEach((marker) => map.removeLayer(marker));
    markers.current = [];

    // Add new markers based on the current notes
    notes?.forEach((note) => {
      if (!note.location || !note.location.coordinates) return;

      const marker = L.marker([note.location.coordinates[1], note.location.coordinates[0]])
        .addTo(map)
        .bindPopup(
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

      marker.on("click", () => {
        const noteCardElement = document.querySelector(`.note-preview[data-note-id="${note._id}"]`);
        if (noteCardElement) {
          noteCardElement.click();
        }
      });

      markers.current.push(marker); // Store the marker for future cleanup
    });

    map.invalidateSize(); // Ensure the map size is correctly adjusted after marker updates

    // Cleanup function to remove markers when the component is unmounted or notes change
    return () => {
      markers.current.forEach((marker) => map.removeLayer(marker));
      markers.current = []; // Clear the markers array
    };
  }, [notes, handleMouseOver, handleMouseOut, markers, currentLocation]);

  return <div id="map" ref={mapRef} style={{ height: "400px" }}></div>;
});

export default NotesMap;
