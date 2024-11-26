import { useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";

const Mapmark = ({ note, setNote, onMapChange, coordinates }) => {
  const { state } = useLocation();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapInstance.current) {
      const [latitude, longitude] = coordinates || [34.052235, -118.243683];
      mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);

      const geocoder = L.Control.Geocoder.nominatim();
      L.Control.geocoder({ geocoder })
        .on("markgeocode", (e) => {
          const latlng = e.geocode.center;
          setNote((prev) => ({
            ...prev,
            location: { type: "Point", coordinates: [latlng.lng, latlng.lat] },
          }));
          mapInstance.current.setView(latlng, 15);
          markerRef.current.setLatLng(latlng);
          circleRef.current.setLatLng(latlng);
        })
        .addTo(mapInstance.current);

        const marker = L.marker([latitude, longitude], { draggable: true }).addTo(mapInstance.current);
        const circle = L.circle([latitude, longitude], { radius: note.radius || 100 }).addTo(mapInstance.current);
    
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
        };
    
        const radiusChangeHandler = () => {
          const newRadius = circleRef.current.getRadius();
          setNote((prev) => ({ ...prev, radius: newRadius }));
        };
    
        markerRef.current.on("dragend", dragEndHandler);
        circleRef.current.on("edit radiuschange", radiusChangeHandler);
      }
    }, [coordinates, note, setNote, onMapChange]);

  return (
    <>
      <div ref={mapRef} className="map-container" style={{ height: "400px", width: "60vw" }} />
      <input
        type="range"
        min="10"
        max="10000"
        value={note.radius || 100}
        onChange={(e) => setNote((prev) => ({ ...prev, radius: e.target.valueAsNumber }))}
      />
    </>
  );
};

export default Mapmark;

