import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { BsFillFuelPumpFill } from "react-icons/bs";
import fuel from "../assets/fuel.png";

// Custom Icons
const userIcon = L.icon({ iconUrl: "/user-icon.png", iconSize: [30, 30] });
const destinationIcon = L.icon({
  iconUrl: "/destination-icon.png",
  iconSize: [30, 30],
});
const fuelPumpIcon = L.icon({
  iconUrl: fuel,
  iconSize: [15, 15],
});

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState([10.7867, 76.6548]);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [bbox, setBbox] = useState(null);
  const [distance, setDistance] = useState(null);
  const [fuelStations, setFuelStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch fuel stations in Kerala
  useEffect(() => {
    const fetchFuelStations = async () => {
      try {
        const bbox1 = "8.0883,74.5236,12.8185,77.5857"; // Kerala
        const apiUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="fuel"](${bbox1});out body;`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch fuel stations");

        const data = await response.json();
        const stations = data.elements.map((station) => ({
          lat: station.lat,
          lon: station.lon,
          name: station.tags?.name || "Unknown Fuel Station",
        }));
        setFuelStations(stations);
      } catch (error) {
        console.error("Error fetching fuel station data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFuelStations();
  }, []);

  // Get User Location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setUserLocation([lat, lon]);
        setBbox([lon - 0.5, lat - 0.5, lon + 0.5, lat + 0.5]);
      },
      (error) => console.error("Error getting location", error),
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query) return setSuggestions([]);
    setLoading(true);
    let url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`;
    if (bbox) url += `&viewbox=${bbox.join(",")}&bounded=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching suggestions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (lat, lon, display_name) => {
    setDestination([parseFloat(lat), parseFloat(lon)]);
    setSearchInput(display_name);
    setSuggestions([]);
  };

  return (
    <div className="h-[200px] w-full">
      <div className="absolute bottom-0 right-4 z-50 w-80">
        <input
          type="text"
          placeholder="Search for a destination..."
          value={searchInput}
          onChange={(e) => fetchSuggestions(e.target.value)}
          className="w-full p-3 border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {loading && (
          <div className="text-gray-500 text-sm mt-2">Loading...</div>
        )}
        {suggestions.length > 0 && (
          <ul className="mt-2 border rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() =>
                  handleSelectLocation(item.lat, item.lon, item.display_name)
                }
                className="p-3 cursor-pointer hover:bg-blue-50"
              >
                {item.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={13}
          className="h-full w-full rounded-lg"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
          <Marker position={destination} icon={destinationIcon}>
            <Popup>Destination</Popup>
          </Marker>
          <Routing
            userLocation={userLocation}
            destination={destination}
            setDistance={setDistance}
          />
          {fuelStations.map((station, index) => (
            <Marker
              key={index}
              position={[station.lat, station.lon]}
              icon={fuelPumpIcon}
            >
              <BsFillFuelPumpFill className="" />
              <Popup>{station.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {distance && (
        <div className="absolute bottom-4 left-4 z-10 bg-white p-4 rounded-lg shadow-lg">
          <p className="text-xl font-semibold">
            Total Distance: {distance.toFixed(2)} km
          </p>
        </div>
      )}
    </div>
  );
};

const Routing = ({ userLocation, destination, setDistance }) => {
  const map = useMap();

  useEffect(() => {
    const routingControl = L.Routing.control({
      waypoints: [L.latLng(userLocation), L.latLng(destination)],
      routeWhileDragging: true,
    })
      .on("routesfound", (e) => {
        const summary = e.routes[0].summary;
        setDistance(summary.totalDistance / 1000);
      })
      .addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, userLocation, destination, setDistance]);

  return null;
};

export default Map;
