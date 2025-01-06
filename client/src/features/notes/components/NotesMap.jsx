import L from "leaflet";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useSelector, useDispatch } from "react-redux";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import './NotesMap.css';
import './ToggleBar.css';
import { toggleMapExpanded } from "../../../store/noteSlice.jsx";

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
  const dispatch = useDispatch();
  const currentLocation = JSON.parse(sessionStorage.getItem("currentLocation")) || null;
  const isExpanded = useSelector(state => state.notes.isMapExpanded);
  
  const [{ height, opacity }, api] = useSpring(() => ({ 
    height: isExpanded ? 'var(--map-height-expanded)' : 'var(--map-height-collapsed)',
    opacity: 1,
    config: { tension: 300, friction: 20 }
  }));

  const toggleMap = () => {
    dispatch(toggleMapExpanded());
    api.start({ 
      height: !isExpanded ? 'var(--map-height-expanded)' : 'var(--map-height-collapsed)',
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
    if (!mapInstance.current && mapRef.current) {
      const initialView = currentLocation
        ? [currentLocation.latitude, currentLocation.longitude]
        : [34.052235, -118.243683]; // Default to LA if no location is found   
        mapInstance.current = L.map(mapRef.current, {
        center: initialView,
        zoom: currentLocation ? 15 : 13,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false // Remove attribution for cleaner look
      });

      // Force a resize after initialization
      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
        }
      }, 100);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: ''
      }).addTo(mapInstance.current);

      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: false,
        collapsed: true,
        placeholder: 'Search location...',
        geocoder: L.Control.Geocoder.nominatim(),
      }).on('markgeocode', function(e) {
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
      }).addTo(mapInstance.current);

      // Add click handler to toggle collapsed state
      const geocoderContainer = geocoder.getContainer();
      const searchIcon = geocoderContainer.querySelector('.leaflet-control-geocoder-icon');
      const input = geocoderContainer.querySelector('input');

      if (searchIcon && input) {
        searchIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          geocoderContainer.classList.toggle('collapsed');
          if (!geocoderContainer.classList.contains('collapsed')) {
            input.focus();
          }
        });

        input.addEventListener('blur', () => {
          if (input.value === '') {
            geocoderContainer.classList.add('collapsed');
          }
        });

        // Start in collapsed state
        geocoderContainer.classList.add('collapsed');
      }
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
