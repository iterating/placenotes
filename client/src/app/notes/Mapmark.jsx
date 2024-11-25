import { useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";

const Mapmark = ({ note, setNote }) => {
  const { state } = useLocation();
  console.log(JSON.stringify(state));
  console.log(JSON.stringify(note));
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapInstance.current) {
      const latitude = note.location?.coordinates?.[1] || 34.052235;
      const longitude = note.location?.coordinates?.[0] || -118.243683;
      mapInstance.current = L.map(mapRef.current).setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapInstance.current);

      const geocoder = L.Control.Geocoder.nominatim();
      L.Control.geocoder({ geocoder, defaultMarkGeocode: false })
        .on("markgeocode", (e) => {
          const latlng = e.geocode.center;
          setNote((prev) => ({ ...prev, location: { type: "Point", coordinates: [latlng.latitude, latlng.longitude] } }));
          mapInstance.current.setView(latlng, 15);
          marker.setLatLng(latlng);
          circle.setLatLng(latlng);
        })
        .addTo(mapInstance.current);

      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(mapInstance.current);
      const circle = L.circle([latitude, longitude], { radius: note.radius || 100 }).addTo(mapInstance.current);

      marker.on("dragend", () => {
        const newLocation = marker.getLatLng();
        setNote((prev) => ({ ...prev, location: { type: "Point", coordinates: [newLocation.latitude, newLocation.longitude] } }));
        circle.setLatLng(newLocation);
      });

      circle.on("edit radiuschange", () => {
        const newRadius = circle.getRadius();
        setNote((prev) => ({ ...prev, radius: newRadius }));
      });
    }
  }, [note, setNote]);

  const updateLocation = useCallback(
    (latlng) => {
      setNote((prev) => ({ ...prev, location: { type: "Point", coordinates: [latlng.latitude, latlng.longitude] } }));
    },
    [setNote]
  );

  const updateRadius = useCallback(
    (newRadius) => {
      setNote((prev) => ({ ...prev, radius: newRadius }));
    },
    [setNote]
  );

  return (
    <>
      <div ref={mapRef} className="map-container" style={{ height: "400px", width: "60vw" }} />
      <input
        type="range"
        min="10"
        max="10000"
        value={note.radius || 100}
        onChange={(e) => updateRadius(e.target.valueAsNumber)}
      />
    </>
  );
};

export default Mapmark;

