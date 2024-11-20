import { useRef, useEffect, useState } from "react"
import L from "leaflet"
import "./Notes.css"
import "leaflet/dist/leaflet.css"

const Mapmark = ({ note = {}, onLocationChange, onRadiusChange }) => {
  const mapRef = useRef(null)
  const [radius, setRadius] = useState(note.radius || 100)
  const [lat, setLat] = useState(note.location?.coordinates?.[1] || 34.052235)
  const [lng, setLng] = useState(note.location?.coordinates?.[0] || -118.243683)

  useEffect(() => {
    const map = L.map(mapRef.current).setView([lat, lng], 15)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map)

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
    const circle = L.circle([lat, lng], { radius, editable: true }).addTo(map)

    const handleMarkerDragEnd = () => {
      const latlng = marker.getLatLng()
      setLat(latlng.lat)
      setLng(latlng.lng)
      onLocationChange && onLocationChange([latlng.lng, latlng.lat])
    }

    const handleCircleEdit = () => {
      const latlng = circle.getLatLng()
      setLat(latlng.lat)
      setLng(latlng.lng)
      const newRadius = circle.getRadius()
      setRadius(newRadius)
      onRadiusChange && onRadiusChange(newRadius)
    }

    marker.on("dragend", handleMarkerDragEnd)
    circle.on("edit", handleCircleEdit)
    circle.on("radiuschange", handleCircleEdit)

    return () => {
      map.remove()
    }
  }, [note, onLocationChange, onRadiusChange])

  const handleRadiusChange = (e) => {
    const newRadius = e.target.value
    setRadius(newRadius)
    onRadiusChange && onRadiusChange(newRadius)
  }

  return (
    <>
      <div ref={mapRef} className="map-container" style={{ height: "400px" }} />
      <input
        type="range"
        value={radius}
        min={10}
        max={10000}
        step={10}
        onChange={handleRadiusChange}
      />
    </>
  )
}

export default Mapmark

