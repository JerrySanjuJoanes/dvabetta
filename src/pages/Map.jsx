import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState([10.7867, 76.6548]); // Default: Palakkad, Kerala
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [bbox, setBbox] = useState(null); // Viewbox for location bias

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserLocation([lat, lon]);

        // Set a bounding box (200km radius) for nearby search
        setBbox([lon - 2, lat - 2, lon + 2, lat + 2]);
      },
      (error) => console.error("Error getting location", error),
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`;

    // If userLocation is available, add the viewbox parameter
    if (bbox) {
      url += `&viewbox=${bbox.join(",")}&bounded=1`;
    }

    try {
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions", error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    fetchSuggestions(value);
  };

  const handleSelectLocation = (lat, lon, display_name) => {
    setDestination([parseFloat(lat), parseFloat(lon)]);
    setSearchInput(display_name);
    setSuggestions([]); // Clear suggestions
  };

  return (
    <div className="h-[600px] w-full relative">
      {/* Search bar with real-time suggestions */}
      <div className="absolute -bottom-20 left-4 z-10 bg-white p-2 rounded shadow-md w-72">
        <input
          type="text"
          placeholder="Enter destination"
          value={searchInput}
          onChange={handleSearchChange}
          className="border p-1 w-full rounded"
        />
        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute w-full bg-white border mt-1 max-h-40 overflow-auto shadow-md rounded">
            {suggestions.map((item, index) => (
              <li
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() =>
                  handleSelectLocation(item.lat, item.lon, item.display_name)
                }
              >
                {item.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

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

const Routing = ({ userLocation, destination }) => {
  const map = useMap();

  useEffect(() => {
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(userLocation), L.latLng(destination)],
      routeWhileDragging: false,
      addWaypoints: false,
      showAlternatives: true,
      altLineOptions: {
        styles: [
          { color: "blue", opacity: 1, weight: 2 },
          { color: "red", opacity: 1, weight: 2 },
        ],
      },
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
