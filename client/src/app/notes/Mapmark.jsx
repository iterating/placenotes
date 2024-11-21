import { useSelector, useDispatch } from "react-redux";
import noteSlice from '../../store/noteSlice';
import { useCallback, useRef } from "react";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-draw";


const updateNote = noteSlice.actions.updateNote;

const Mapmark = () => {
  const mapRef = useRef(null);
  const note = useSelector((state) => state.notes.currentNote);
  const dispatch = useDispatch();

  const updateLocation = useCallback(
    (latlng) => {
      dispatch(updateNote({ location: { type: "Point", coordinates: [latlng.lat, latlng.lng] } }));
    },
    [dispatch]
  );

  const updateRadius = useCallback(
    (newRadius) => {
      dispatch(updateNote({ radius: newRadius }));
    },
    [dispatch]
  );

  useEffect(() => {
    const map = L.map(mapRef.current).setView(note.location.coordinates, 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const geocoder = L.Control.Geocoder.nominatim();
    L.Control.geocoder({ geocoder, defaultMarkGeocode: false })
      .on("markgeocode", (e) => {
        const latlng = e.geocode.center;
        updateLocation(latlng);
        map.setView(latlng, 15);
        marker.setLatLng(latlng);
        circle.setLatLng(latlng);
      })
      .addTo(map);

    const marker = L.marker(note.location.coordinates, { draggable: true }).addTo(map);
    const circle = L.circle(note.location.coordinates, { radius: note.radius }).addTo(map);

    marker.on("dragend", () => {
      const newLocation = marker.getLatLng();
      updateLocation(newLocation);
      circle.setLatLng(newLocation);
    });

    circle.on("edit radiuschange", () => {
      updateRadius(circle.getRadius());
    });

    return () => map.remove();
  }, [note]);

  return (
    <>
      <div ref={mapRef} className="map-container" style={{ height: "400px", width: "60vw" }} />
      <input
        type="range"
        min="10"
        max="10000"
        value={note.radius}
        onChange={(e) => updateRadius(e.target.valueAsNumber)}
      />
    </>
  );
};

export default Mapmark;