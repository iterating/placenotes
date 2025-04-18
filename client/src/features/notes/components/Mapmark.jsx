import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import L from "leaflet";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { fromGeoJSONPoint, toGeoJSONPoint } from '../../../lib/GeoUtils';

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

const Mapmark = ({ location, onLocationChange, onRadiusChange, radius = 100 }) => {
  const { state } = useLocation();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const mapInstance = useRef(null);

  // Get coordinates from location prop, ensuring GeoJSON format
  const geoJSONLocation = location?.type === 'Point' && location?.coordinates
    ? location
    : location?.coordinates
      ? { type: 'Point', coordinates: location.coordinates }
      : { type: 'Point', coordinates: [-118.243683, 34.052235] };
      
  // Convert to Leaflet format [lat, lng] for internal use
  const leafletCoords = geoJSONLocation.coordinates
    ? [geoJSONLocation.coordinates[1], geoJSONLocation.coordinates[0]]
    : [34.052235, -118.243683];

  const updateLocation = (lat, lng) => {
    // Create proper GeoJSON Point object
    const geoJSONPoint = {
      type: 'Point',
      coordinates: [lng, lat] // GeoJSON uses [longitude, latitude] order
    };
    
    onLocationChange(geoJSONPoint);
    
    if (markerRef.current && circleRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(leafletCoords, 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      const geocoder = L.Control.Geocoder.nominatim();
      const geocoderControl = L.Control.geocoder({ 
        geocoder,
        position: 'topright',
        placeholder: 'Search location...'
      })
        .on("markgeocode", (e) => {
          const latlng = e.geocode.center;
          updateLocation(latlng.lat, latlng.lng);
          mapInstance.current.setView(latlng, 15);
        })
        .addTo(mapInstance.current);

      // Add marker and circle using Leaflet format
      markerRef.current = L.marker(leafletCoords, {
        draggable: true // Make marker draggable
      }).addTo(mapInstance.current);

      // Handle marker drag events
      markerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        updateLocation(position.lat, position.lng);
      });

      circleRef.current = L.circle(leafletCoords, {
        radius: radius,
        color: 'blue',
        fillColor: '#3388ff',
        fillOpacity: 0.2
      }).addTo(mapInstance.current);

      // Handle map clicks
      mapInstance.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateLocation(lat, lng);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update circle radius when radius prop changes
  useEffect(() => {
    if (circleRef.current && radius) {
      circleRef.current.setRadius(radius);
    }
  }, [radius]);

  // Update marker and circle position when location changes
  useEffect(() => {
    if (markerRef.current && circleRef.current && mapInstance.current) {
      // Always use leafletCoords which is already in [lat, lng] format for Leaflet
      markerRef.current.setLatLng(leafletCoords);
      circleRef.current.setLatLng(leafletCoords);
      mapInstance.current.setView(leafletCoords);
    }
  }, [geoJSONLocation]);

  return (
    <div className="mapmark-wrapper">
      <div ref={mapRef} style={{ height: "100%", minHeight: "300px" }} className="mapmark-container" />
    </div>
  );
};

export default Mapmark;
