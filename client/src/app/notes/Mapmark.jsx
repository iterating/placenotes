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
        const circle = L.circle([latitude, longitude], { radius: radius }).addTo(mapInstance.current);
    
        markerRef.current = marker;
        circleRef.current = circle;
    
        const dragEndHandler = (e) => {
          const newLatLng = e.target.getLatLng();
          setNote((prev) => ({
            ...prev,
            location: {
              type: "Point",
              coordinates: [newLatLng.lng, newLatLng.lat],
            },
          }));
          onMapChange([newLatLng.lng, newLatLng.lat]);
          circleRef.current.setLatLng(newLatLng);
        };
    
        const radiusChangeHandler = () => {
          const newRadius = circleRef.current.getRadius();
          setRadius(newRadius);
        };
    
        markerRef.current.on("dragend", dragEndHandler);
        circleRef.current.on("edit radiuschange", radiusChangeHandler);
        markerRef.current.on("drag", (e) => {
          circleRef.current.setLatLng(e.latlng);
        });
      }
    }, [coordinates, note, setNote, onMapChange, radius]);

  const handleRadiusChange = (e) => {
    setRadius(e.target.valueAsNumber);
    circleRef.current.setRadius(e.target.valueAsNumber);
  };

  return (
    <>
      <div ref={mapRef} className="map-container" />
      <div className="map-controls">
        <input
          type="range"
          min="10"
          max="10000"
          value={radius}
          onChange={handleRadiusChange}
          className="radius-slider"
        />
      </div>
    </>
  );
};

export default Mapmark;
