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

const Mapmark = ({ note, setNote, onMapChange, coordinates }) => {
  const { state } = useLocation();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const mapInstance = useRef(null);
  const [radius, setRadius] = useState(note.radius || 100);

  useEffect(() => {
    if (!mapInstance.current) {
      const [latitude, longitude] = coordinates || [34.052235, -118.243683];
      mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);

      const geocoder = L.Control.Geocoder.nominatim();
      const geocoderControl = L.Control.geocoder({ geocoder })
        .on("markgeocode", (e) => {
          const latlng = e.geocode.center;
          setNote((prev) => ({
            ...prev,
            location: { type: "Point", coordinates: [latlng.lng, latlng.lat] },
          }));
          mapInstance.current.setView(latlng, 15);
          markerRef.current.setLatLng(latlng);
          circleRef.current.setLatLng(markerRef.current.getLatLng());
        })
        .addTo(mapInstance.current);
    
      geocoderControl.getContainer().classList.add("address-list");
      geocoderControl.getContainer().style.maxHeight = "300px";
      geocoderControl.getContainer().style.overflowY = "scroll";

      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(mapInstance.current);
      const circle = L.circle([latitude, longitude], { radius: note.radius }).addTo(mapInstance.current);
    
      markerRef.current = marker;
      circleRef.current = circle;
    
      const dragEndHandler = (e) => {
        const newLatLng = e.target.getLatLng();
        const newCoords = [Number(newLatLng.lng.toFixed(6)), Number(newLatLng.lat.toFixed(6))];
        
        setNote((prev) => ({
          ...prev,
          location: {
            type: "Point",
            coordinates: newCoords
          },
        }));
        
        if (onMapChange) {
          onMapChange(newCoords[0], newCoords[1]);
        }
        
        circleRef.current.setLatLng(newLatLng);
      };
    
      markerRef.current.on("dragend", dragEndHandler);
      markerRef.current.on("drag", (e) => {
        const latlng = e.target.getLatLng();
        circleRef.current.setLatLng(latlng);
      });
    }

    // Update circle radius when note.radius changes
    if (circleRef.current) {
      circleRef.current.setRadius(note.radius);
    }
  }, [coordinates, note, setNote, onMapChange]);

  return (
    <>
      <div ref={mapRef} className="map-container" />
    </>
  );
};

export default Mapmark;
