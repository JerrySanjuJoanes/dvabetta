import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const destination = [10.7867, 76.6548]; // Palakkad, Kerala

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => console.error("Error getting location", error),
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="h-[600px] w-full">
      {userLocation && (
        <MapContainer center={userLocation} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={userLocation}>
            <Popup>You are here!</Popup>
          </Marker>
          <Marker position={destination}>
            <Popup>Destination</Popup>
          </Marker>
          <Routing userLocation={userLocation} destination={destination} />
        </MapContainer>
      )}
    </div>
  );
};

// Routing component to add a route between two points
const Routing = ({ userLocation, destination }) => {
  const map = useMap();

  useEffect(() => {
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(userLocation), L.latLng(destination)],
      routeWhileDragging: false,
      showAlternatives: false,
      createMarker: (i, waypoint) => {
        return L.marker(waypoint.latLng, {
          icon: L.icon({
            iconUrl:
              i === 0
                ? "https://cdn-icons-png.flaticon.com/512/25/25613.png"
                : "https://cdn-icons-png.flaticon.com/512/684/684908.png",
            iconSize: [25, 25],
          }),
        });
      },
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, userLocation, destination]);

  return null;
};

export default Map;
