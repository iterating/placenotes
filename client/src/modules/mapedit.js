import React from 'react';
import { Map, TileLayer, Marker, Circle } from 'leaflet-react();

class MapEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: props.note.location.coordinates[1],
      lng: props.note.location.coordinates[0],
      radius: props.note.radius || 100
    };
  }

  handleMarkerDragEnd = (e) => {
    const latlng = e.target.getLatLng();
    this.setState({ lat: latlng.lat, lng: latlng.lng });
  }

  handleCircleEdit = (e) => {
    const latlng = e.target.getLatLng();
    this.setState({ lat: latlng.lat, lng: latlng.lng });
    const radius = e.target.getRadius();
    this.setState({ radius: radius });
  }

  render() {
    const { note } = this.props;
    return (
      <div className="map-container">
        <Map center={[this.state.lat, this.state.lng]} zoom={15}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[this.state.lat, this.state.lng]}
            draggable={false}
            onDragEnd={this.handleMarkerDragEnd}
          />
          <Circle
            center={[this.state.lat, this.state.lng]}
            radius={this.state.radius}
            editable={true}
            onEdit={this.handleCircleEdit}
          />
        </Map>
        <input type="hidden" name="location"
          value={`{"type": "Point", "coordinates": [${this.state.lng}, ${this.state.lat}]}`}
        />
        <input type="hidden" name="radius" value={this.state.radius} />
        <input type="hidden" name="time" value={note.time} />
        <button type="submit">Save Changes</button>
        <a href="/notes" className="button">Cancel</a>
      </div>
    );
  }
}

export default MapEdit;
