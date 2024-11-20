import React, { useRef, useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"   
import "./Notes.css"


const NotesMap = ({ notes, handleMouseOver, handleMouseOut }) => {
    const mapRef = useRef(null)
    const mapInstance = useRef(null)
    const markers = useRef([])
  
    useEffect(() => {
      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView(
          [34.052235, -118.243683],
          13
        )
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
          mapInstance.current
        )
      }
  
      const map = mapInstance.current
  
      markers.current.forEach((marker) => map.removeLayer(marker))
      markers.current = notes?.flatMap((note) => {
        if (!note.location) return []
        const marker = L.marker([
          note.location.coordinates[1],
          note.location.coordinates[0],
        ]).addTo(map)
        marker.bindPopup(
          `<div>${note.body.split('\n')[0]}</div><a href="/notes/${note._id}/edit">Edit Note</a>`
        )
        marker.on("mouseover", () => {
          handleMouseOver(note._id)
          marker.openPopup()
        })
        marker.on("mouseout", () => {
          handleMouseOut(note._id)
          marker.closePopup()
        })
        marker.on("popupopen", () => handleMouseOver(note._id))
        marker.on("popupclose", () => handleMouseOut(note._id))
  
        return [marker]
      })
  
      map.invalidateSize()
    }, [notes, handleMouseOver, handleMouseOut])
  
    return <div id="map" ref={mapRef} style={{ height: "400px" }}></div>
  }

  export default NotesMap
