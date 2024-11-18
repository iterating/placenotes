import { useRef, useEffect } from "react";
import L from "leaflet";

const MapMark = ({ note }) => {
  const mapRef = useRef(null);
  const [radius, setRadius] = React.useState(note.radius);
  const [lat, setLat] = React.useState(note.location.coordinates[1]);
  const [lng, setLng] = React.useState(note.location.coordinates[0]);

  useEffect(() => {
    const map = L.map(mapRef.current).setView([lat, lng], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);

    const marker = L.marker([lat, lng], { draggable: false }).addTo(map);
    const circle = L.circle(marker.getLatLng(), { radius, editable: true }).addTo(map);

    const handleMarkerDragEnd = () => {
      const latlng = marker.getLatLng();
      setLat(latlng.lat);
      setLng(latlng.lng);
    };
    const handleCircleEdit = () => {
      const latlng = circle.getLatLng();
      setLat(latlng.lat);
      setLng(latlng.lng);
      setRadius(circle.getRadius());
    };

    marker.on("dragend", handleMarkerDragEnd);
    circle.on("edit", handleCircleEdit);
    circle.on("radiuschange", handleCircleEdit);

    return () => {
      map.remove();
    };
  }, [note, radius, lat, lng]);

  return (
    <>
      <div ref={mapRef} className="map-container" style={{ height: "400px" }} />
      <input type="hidden" name="location" value={`{"type": "Point", "coordinates": [${lng}, ${lat}]}`} />
      <input type="hidden" name="radius" value={radius} />
      <input type="hidden" name="time" value={note.time} />
      <input type="hidden" name="recipients" value={note.recipients} />
    </>
  );
};



