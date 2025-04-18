import L from "leaflet"
import "leaflet-control-geocoder"
import "leaflet/dist/leaflet.css"
import "leaflet-control-geocoder/dist/Control.Geocoder.css"
import React, { useMemo, useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux"
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"
import "./NotesMap.css"
import "./ToggleBar.css"
import { toggleNotesPanel } from "../../../store/noteSlice.js"
import { fetchMessagesByLocation } from "../../messages/store/messageStoreAction.js"
import MessageList from "../../messages/components/MessageList"
import { selectAllMessages } from "../../messages/store/messageSlice"

// Set up default icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Set up green icon for messages
let GreenMessageIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'green-icon' // We'll define this class in CSS
})

L.Marker.prototype.options.icon = DefaultIcon

const NotesMap = ({ notes, handleMouseOver, handleMouseOut, markers }) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const dispatch = useDispatch()
  const currentLocation =
    JSON.parse(sessionStorage.getItem("currentLocation")) || null
  const isExpanded = useSelector((state) => state.notes.isMapExpanded)

  // Messages
  const messageMarkersRef = useRef([])
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false)
  const messages = useSelector(selectAllMessages)
  const [mapCenter, setMapCenter] = useState(null)

  // Function to center map on current location
  const centerOnCurrentLocation = () => {
    if (mapInstance.current && currentLocation) {
      // Handle GeoJSON Point format with [longitude, latitude] coordinates
      if (currentLocation.type === 'Point' && Array.isArray(currentLocation.coordinates)) {
        mapInstance.current.setView(
          [currentLocation.coordinates[1], currentLocation.coordinates[0]],
          mapInstance.current.getZoom()
        );
      } else if (currentLocation.latitude && currentLocation.longitude) {
        // Fallback for legacy format
        mapInstance.current.setView(
          [currentLocation.latitude, currentLocation.longitude],
          mapInstance.current.getZoom()
        );
      }
    }
  };

  useEffect(() => {
    if (!mapRef.current) return
    
    // Initialize map if it hasn't been initialized yet
    if (!mapInstance.current) {
      let initialCenter = [51.505, -0.09] // Default center
      
      if (currentLocation) {
        // Handle GeoJSON Point format with [longitude, latitude] coordinates
        if (currentLocation.type === 'Point' && Array.isArray(currentLocation.coordinates)) {
          initialCenter = [currentLocation.coordinates[1], currentLocation.coordinates[0]]
        } else if (currentLocation.latitude && currentLocation.longitude) {
          // Fallback for legacy format
          initialCenter = [currentLocation.latitude, currentLocation.longitude]
        }
      }
      
      mapInstance.current = L.map(mapRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
      })
      
      // Move zoom control to the right
      L.control.zoom({ position: "topright" }).addTo(mapInstance.current)
      
      // Add custom control for centering on current location
      const locationControl = L.Control.extend({
        options: {
          position: 'topright'
        },
        
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control location-center-control');
          const button = L.DomUtil.create('a', 'location-center-button', container);
          button.innerHTML = '<i class="fas fa-location-arrow"></i>';
          button.title = 'Center on my location';
          button.href = '#';
          
          L.DomEvent.on(button, 'click', L.DomEvent.stop)
            .on(button, 'click', function() {
              if (currentLocation) {
                // Handle GeoJSON Point format with [longitude, latitude] coordinates
                if (currentLocation.type === 'Point' && Array.isArray(currentLocation.coordinates)) {
                  mapInstance.current.setView(
                    [currentLocation.coordinates[1], currentLocation.coordinates[0]],
                    mapInstance.current.getZoom()
                  );
                } else if (currentLocation.latitude && currentLocation.longitude) {
                  // Fallback for legacy format
                  mapInstance.current.setView(
                    [currentLocation.latitude, currentLocation.longitude],
                    mapInstance.current.getZoom()
                  );
                }
              }
            });
            
          return container;
        }
      });
      
      new locationControl().addTo(mapInstance.current)
      
      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current)
      
      // Add geocoder control
      L.Control.geocoder({
        defaultMarkGeocode: false,
        position: "topright",
        placeholder: "Search for places...",
      })
        .on("markgeocode", function (e) {
          const { center } = e.geocode
          mapInstance.current.setView(center, 13)
        })
        .addTo(mapInstance.current)
    }

    const map = mapInstance.current

    // Clear previous markers
    markers.current?.forEach((marker) => map.removeLayer(marker))
    markers.current = [] // Clear the markers array

    // Add new markers based on the current notes
    notes?.forEach((note) => {
      if (!note.location || !note.location.coordinates) return

      const marker = L.marker([
        note.location.coordinates[1],
        note.location.coordinates[0],
      ])
        .addTo(map)
        .bindPopup(
          `<div class="popup-content" data-note-id="${note._id}">
            <div class="popup-body">${note.body?.split("\n")[0]}</div>
            <a href="/notes/${note._id}/edit" class="popup-link">Edit Note</a>
          </div>`
        )

      marker.on("mouseover", () => {
        handleMouseOver(note._id)
        marker.openPopup()
      })

      marker.on("mouseout", () => {
        handleMouseOut(note._id)
      })

      marker.on("click", () => {
        const noteCardElement = document.querySelector(
          `.note-preview[data-note-id="${note._id}"]`
        )
        if (noteCardElement) {
          noteCardElement.click()
        }
      })

      markers.current.push(marker)
    })

    map.invalidateSize()

    return () => {
      markers.current.forEach((marker) => map.removeLayer(marker))
    }
  }, [notes, handleMouseOver, handleMouseOut, markers, currentLocation])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Clear old message markers
    messageMarkersRef.current.forEach((marker) => map.removeLayer(marker))
    messageMarkersRef.current = []

    // Add message markers
    messages?.forEach((message) => {
      if (!message.location || !message.location.coordinates) return

      const marker = L.marker([
        message.location.coordinates[1],
        message.location.coordinates[0],
      ], { icon: GreenMessageIcon })
        .addTo(map)
        .bindPopup(
          `<div class="popup-content" data-message-id="${message._id}">
        <div class="popup-body">${message.content}</div>
      </div>`
        )

      // Create circle but don't display it (radius is hidden)
      const circle = L.circle(
        [message.location.coordinates[1], message.location.coordinates[0]],
        {
          radius: message.radius,
          color: "green",
          fillColor: "green",
          fillOpacity: 0, // Set to 0 to hide the fill
          opacity: 0, // Set to 0 to hide the border
          interactive: false // Make it non-interactive
        }
      )

      marker.on("click", () => {
        setIsMessageDrawerOpen(true)
      })

      messageMarkersRef.current.push(marker)
      messageMarkersRef.current.push(circle)
    })

    return () => {
      messageMarkersRef.current.forEach((marker) => map.removeLayer(marker))
    }
  }, [messages])

  return (
    <div className="map-section">
      <div ref={mapRef} className="map-container" />
      {isMessageDrawerOpen && (
        <div className={`message-drawer ${isMessageDrawerOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <h3>Messages</h3>
            <button 
              onClick={() => setIsMessageDrawerOpen(false)}
              className="close-button"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <MessageList messages={messages} />
        </div>
      )}
    </div>
  )
}

export default NotesMap
