import L from "leaflet";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import './NotesMap.css';
import './ToggleBar.css';

// Set up default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const NotesMap = ({ notes, handleMouseOver, handleMouseOut, markers }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const currentLocation = JSON.parse(sessionStorage.getItem("currentLocation")) || null;
  const [isExpanded, setIsExpanded] = useState(true);
  const [{ height, opacity }, api] = useSpring(() => ({ 
    height: isExpanded ? "500px" : "200px",
    opacity: 1,
    config: { tension: 300, friction: 20 }
  }));

  const toggleMap = () => {
    setIsExpanded(!isExpanded);
    api.start({ 
      height: !isExpanded ? "500px" : "200px",
      opacity: !isExpanded ? 1 : 0.8,
    });
    
    // Ensure map redraws correctly after resize
    setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 400);
  };

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
        position: 'topleft',
        expand: 'click',
        iconLabel: 'Search location'
      }).addTo(mapInstance.current);

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
    markers.current?.forEach((marker) => map.removeLayer(marker));
    markers.current = []; // Clear the markers array

    // Add new markers based on the current notes
    notes?.forEach((note) => {
      if (!note.location || !note.location.coordinates) return;

      const marker = L.marker([note.location.coordinates[1], note.location.coordinates[0]])
        .addTo(map)
        .bindPopup(
          `<div class="popup-content" data-note-id="${note._id}">
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

  return (
    <div className={`map-section ${isExpanded ? 'expanded' : ''}`}>
      <div className="map-handle" onClick={toggleMap} />
      <animated.div
        style={{
          height,
          opacity,
          overflow: 'hidden'
        }}
      >
        <div ref={mapRef} className="map-container" />
      </animated.div>
      <div className="toggle-bar" onClick={toggleMap}>
        <span className="toggle-icon">▼</span>
        {isExpanded ? 'Collapse map' : 'Expand map'}
      </div>
    </div>
  );
};

export default NotesMap;
