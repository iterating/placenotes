import leaflet from 'leaflet';

const MapMark = (props) => {
  const [radius, setRadius] = React.useState(props.note.radius);
  const [lat, setLat] = React.useState(props.note.location.coordinates[1]);
  const [lng, setLng] = React.useState(props.note.location.coordinates[0]);
  const [location, setLocation] = React.useState(`{"type": "Point", "coordinates": [${lng}, ${lat}]}`);

  const handleMarkerDragEnd = (e) => {
    const latlng = e.target.getLatLng();
    setLat(latlng.lat);
    setLng(latlng.lng);
    setLocation(`{"type": "Point", "coordinates": [${latlng.lng}, ${latlng.lat}]}`);
  };
  const handleCircleEdit = (e) => {
    const latlng = e.target.getLatLng();
    setLat(latlng.lat);
    setLng(latlng.lng);
    setLocation(`{"type": "Point", "coordinates": [${latlng.lng}, ${latlng.lat}]}`);
    setRadius(e.target.getRadius());
  };

  return (
    <>
      <div className="map-container" id="map-container">
        <div id="map" className="map" style={{ height: '400px' }}></div>
      </div>

      <script>
        const map = L.map('map').setView([${lat}, ${lng}], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        }).addTo(map);

        const marker = L.marker(
          [${lat}, ${lng}],
          {
            draggable: false
          }
        ).addTo(map);
        const circle = L.circle(marker.getLatLng(), {
          radius: ${radius},
          editable: true
        }).addTo(map);

        marker.on('dragend', handleMarkerDragEnd);
        circle.on('edit', handleCircleEdit);
        circle.on('radiuschange', () => {
          setRadius(circle.getRadius());
        });
      </script>

      <input
        type="hidden"
        name="location"
        value={location}
      />
      <input type="hidden" name="radius" value={radius} />
      <input type="hidden" name="time" value={props.note.time} />
      <input type="hidden" name="recipients" value={props.note.recipients} />
    </>
  );
};

