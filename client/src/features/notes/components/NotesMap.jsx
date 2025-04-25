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
import { toggleNotesPanel } from "../store/noteSlice.js"
import MessageList from "../../messages/components/MessageList"
import { selectAllMessages } from "../../messages/store/messageSlice"
import { getCurrentLocationFromStorage, fromGeoJSONPoint } from "../../../lib/GeoUtils"

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
  const currentLocation = getCurrentLocationFromStorage()
  const isExpanded = useSelector((state) => state.notes.isMapExpanded)

  // Messages
  const messageMarkersRef = useRef([])
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false)
  const messages = useSelector(selectAllMessages)
  const [mapCenter, setMapCenter] = useState(null)

  // Function to center map on current location
  const centerOnCurrentLocation = () => {
    if (!mapInstance.current) return;
    
    try {
      if (currentLocation) {
        // Convert GeoJSON Point to Leaflet format [lat, lng]
        let leafletCoords;
        
        if (currentLocation.type === 'Point' && Array.isArray(currentLocation.coordinates)) {
          leafletCoords = [currentLocation.coordinates[1], currentLocation.coordinates[0]];
        } else if (currentLocation.latitude !== undefined && currentLocation.longitude !== undefined) {
          leafletCoords = [currentLocation.latitude, currentLocation.longitude];
        } else {
          console.warn('Invalid location format:', currentLocation);
          return; // Exit if location format is invalid
        }
        
        mapInstance.current.setView(
          leafletCoords,
          mapInstance.current.getZoom()
        );
      } else {
        console.warn('No current location available');
      }
    } catch (error) {
      console.error('Error centering on current location:', error);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return
    
    // Initialize map if it hasn't been initialized yet
    if (!mapInstance.current) {
      // Default center if no location available
      let initialCenter = [51.505, -0.09] 
      
      try {
        if (currentLocation) {
          // Convert GeoJSON Point to Leaflet format [lat, lng]
          if (currentLocation.type === 'Point' && Array.isArray(currentLocation.coordinates)) {
            initialCenter = [currentLocation.coordinates[1], currentLocation.coordinates[0]];
          } else if (currentLocation.latitude !== undefined && currentLocation.longitude !== undefined) {
            initialCenter = [currentLocation.latitude, currentLocation.longitude];
          } else {
            console.warn('Invalid location format, using default center:', currentLocation);
          }
        }
      } catch (error) {
        console.error('Error processing location, using default center:', error);
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
              try {
                // Call the centerOnCurrentLocation function which now has error handling
                centerOnCurrentLocation();
                
                // Also fetch nearby messages when centering on location
                if (currentLocation) {
                  dispatch(fetchMessagesByLocation({
                    location: currentLocation,
                    radius: 5000 // 5km radius
                  }));
                }
              } catch (error) {
                console.error('Error centering on location:', error);
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
    if (!map) return
    
    try {
      // Clear previous markers
      if (markers.current && Array.isArray(markers.current)) {
        markers.current.forEach((marker) => {
          try {
            if (marker) map.removeLayer(marker)
          } catch (err) {
            console.warn('Error removing note marker:', err)
          }
        })
      }
      markers.current = [] // Clear the markers array

      // Add new markers based on the current notes
      if (notes && Array.isArray(notes)) {
        notes.forEach((note) => {
          try {
            // Validate note location
            if (!note || !note.location) return
            
            // Ensure coordinates exist and are valid numbers
            if (!note.location.coordinates || 
                !Array.isArray(note.location.coordinates) || 
                note.location.coordinates.length !== 2 ||
                isNaN(note.location.coordinates[0]) || 
                isNaN(note.location.coordinates[1])) {
              console.warn('Invalid note location coordinates:', note.location)
              return
            }

            const lat = Number(note.location.coordinates[1])
            const lng = Number(note.location.coordinates[0])
            
            // Additional validation to ensure coordinates are within valid range
            if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
              console.warn('Note coordinates out of range:', lat, lng)
              return
            }

            const marker = L.marker([lat, lng])
              .addTo(map)
              .bindPopup(
                `<div class="popup-content" data-note-id="${note._id}">
                  <div class="popup-body">${note.body ? note.body.split("\n")[0] : 'No content'}</div>
                  <a href="/notes/${note._id}/edit" class="popup-link">Edit Note</a>
                </div>`
              )

            marker.on("mouseover", () => {
              try {
                handleMouseOver(note._id)
                marker.openPopup()
              } catch (error) {
                console.warn('Error in mouseover handler:', error)
              }
            })

            marker.on("mouseout", () => {
              try {
                handleMouseOut(note._id)
              } catch (error) {
                console.warn('Error in mouseout handler:', error)
              }
            })

            marker.on("click", () => {
              try {
                const noteCardElement = document.querySelector(
                  `.note-preview[data-note-id="${note._id}"]`
                )
                if (noteCardElement) {
                  noteCardElement.click()
                }
              } catch (error) {
                console.warn('Error in click handler:', error)
              }
            })

            markers.current.push(marker)
          } catch (noteError) {
            console.error('Error adding note marker:', noteError, note)
          }
        })
      }
    } catch (error) {
      console.error('Error handling note markers:', error)
    }

    try {
      map.invalidateSize()
    } catch (error) {
      console.warn('Error invalidating map size:', error)
    }

    return () => {
      try {
        if (markers.current && Array.isArray(markers.current)) {
          markers.current.forEach((marker) => {
            try {
              if (marker && map) map.removeLayer(marker)
            } catch (err) {
              // Silently ignore errors when cleaning up
            }
          })
        }
      } catch (error) {
        console.error('Error cleaning up note markers:', error)
      }
    }
  }, [notes, handleMouseOver, handleMouseOut, markers, currentLocation])

  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    try {
      // Clear old message markers
      messageMarkersRef.current.forEach((marker) => {
        try {
          map.removeLayer(marker)
        } catch (err) {
          console.warn('Error removing marker:', err)
        }
      })
      messageMarkersRef.current = []

      // Add message markers
      messages?.forEach((message) => {
        try {
          // Validate message location
          if (!message || !message.location) return
          
          // Ensure coordinates exist and are valid numbers
          if (!message.location.coordinates || 
              !Array.isArray(message.location.coordinates) || 
              message.location.coordinates.length !== 2 ||
              isNaN(message.location.coordinates[0]) || 
              isNaN(message.location.coordinates[1])) {
            console.warn('Invalid message location coordinates:', message.location)
            return
          }

          const lat = Number(message.location.coordinates[1])
          const lng = Number(message.location.coordinates[0])
          
          // Additional validation to ensure coordinates are within valid range
          if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
            console.warn('Message coordinates out of range:', lat, lng)
            return
          }

          const marker = L.marker([lat, lng], { icon: GreenMessageIcon })
            .addTo(map)
            .bindPopup(
              `<div class="popup-content" data-message-id="${message._id}">
                <div class="popup-body">${message.content || 'No content'}</div>
              </div>`
            )

          // Create circle but don't display it (radius is hidden)
          const radius = typeof message.radius === 'number' && !isNaN(message.radius) ? 
            message.radius : 1000 // Default to 1km if no valid radius
            
          const circle = L.circle([lat, lng], {
            radius: radius,
            color: "green",
            fillColor: "green",
            fillOpacity: 0, // Set to 0 to hide the fill
            opacity: 0, // Set to 0 to hide the border
            interactive: false // Make it non-interactive
          })
          
          // Add circle to map
          circle.addTo(map)

          marker.on("click", () => {
            setIsMessageDrawerOpen(true)
          })

          messageMarkersRef.current.push(marker)
          messageMarkersRef.current.push(circle)
        } catch (messageError) {
          console.error('Error adding message marker:', messageError, message)
        }
      })
    } catch (error) {
      console.error('Error handling message markers:', error)
    }

    return () => {
      try {
        messageMarkersRef.current.forEach((marker) => {
          try {
            map.removeLayer(marker)
          } catch (err) {
            // Silently ignore errors when cleaning up
          }
        })
      } catch (error) {
        console.error('Error cleaning up message markers:', error)
      }
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
