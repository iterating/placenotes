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

  // Get coordinates from location prop
  const coordinates = location?.coordinates 
    ? [location.coordinates[1], location.coordinates[0]] 
    : [34.052235, -118.243683];

  const updateLocation = (lat, lng) => {
    onLocationChange(lng, lat);
    if (markerRef.current && circleRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
    }
  };

  useEffect(() => {
    if (!mapInstance.current) {
      const [latitude, longitude] = coordinates;
      mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);

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

      // Add marker and circle
      markerRef.current = L.marker(coordinates, {
        draggable: true // Make marker draggable
      }).addTo(mapInstance.current);

      // Handle marker drag events
      markerRef.current.on('dragend', (e) => {
        const marker = e.target;
        const position = marker.getLatLng();
        updateLocation(position.lat, position.lng);
      });

      circleRef.current = L.circle(coordinates, {
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

  // Update marker and circle position when coordinates change
  useEffect(() => {
    if (markerRef.current && circleRef.current) {
      const [lat, lng] = coordinates;
      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
      mapInstance.current?.setView([lat, lng]);
    }
  }, [coordinates]);

  return (
    <div className="mapmark-wrapper">
      <div ref={mapRef} style={{ height: "100%", minHeight: "300px" }} className="mapmark-container" />
    </div>
  );
};

export default Mapmark;
