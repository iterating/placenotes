import L from "leaflet";
import "leaflet-control-geocoder";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";

const NotesMap = ({ notes, handleMouseOver, handleMouseOut, markers }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const currentLocation = JSON.parse(sessionStorage.getItem("currentLocation")) || null;

  useEffect(() => {
    if (!mapInstance.current) {
      const initialView = currentLocation
        ? [currentLocation.latitude, currentLocation.longitude]
        : [34.052235, -118.243683]; // Default to LA if no location is found
      mapInstance.current = L.map(mapRef.current).setView(initialView, currentLocation ? 15 : 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);

      const geocoder = L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
          format: "json",
          addressdetails: 1,
        },
      });

      const geocoderControl = L.Control.geocoder({
        geocoder,
        defaultMarkGeocode: false,
        placeholder: 'Search location...',
        collapsed: false,
        showResultIcons: false,
        position: 'topleft'
      }).addTo(mapInstance.current);

      // Remove default icon and style
      const geocoderContainer = geocoderControl.getContainer();
      geocoderContainer.className = 'custom-geocoder-control';
      
      const searchInput = geocoderContainer.querySelector('input');
      if (searchInput) {
        searchInput.className = 'custom-geocoder-input';
      }

      // Remove the geocoder icon
      const iconElement = geocoderContainer.querySelector('.leaflet-control-geocoder-icon');
      if (iconElement) {
        iconElement.remove();
      }

      geocoderControl.on("markgeocode", (e) => {
        const latlng = e.geocode.center;
        const address = e.geocode.properties;
        console.log("selected address:", address);
        const note = {
          _id: new Date().toISOString(),
          title: address.address?.road 
            ? `${address.address.road} ${address.address.house_number || ''}`
            : address.display_name,
          body: address.display_name,
          location: {
            type: "Point",
            coordinates: [latlng.lng, latlng.lat],
          },
        };
        console.log("creating new note:", note);
      });
    }

    const map = mapInstance.current;

    // Clear previous markers
    markers.current.forEach((marker) => map.removeLayer(marker));
    markers.current = []; // Clear the markers array

    // Add new markers based on the current notes
    notes?.forEach((note) => {
      if (!note.location || !note.location.coordinates) return;

      const marker = L.marker([note.location.coordinates[1], note.location.coordinates[0]])
        .addTo(map)
        .bindPopup(
          `<div class="popup-content">
            <div class="popup-title">${note.title || 'Untitled Note'}</div>
            <div class="popup-body">${note.body?.split('\n')[0]}</div>
            <a href="/notes/${note._id}/edit" class="popup-link">Edit Note</a>
          </div>`
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

      markers.current.push(marker);
    });

    map.invalidateSize();

    return () => {
      markers.current.forEach((marker) => map.removeLayer(marker));
    };
  }, [notes, handleMouseOver, handleMouseOut, markers, currentLocation]);

  return <div ref={mapRef} className="map-container" />;
};

export default NotesMap;
