import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"; // Use MapContainer and React-Leaflet components
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// Fix for default Leaflet marker icon not displaying
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom component to handle routing
const RoutingMachine = ({ startPoint, endPoint, setDistance }) => {
  const map = useMap();

  useEffect(() => {
    if (!startPoint || !endPoint) return;

    // Remove any existing routing controls
    if (map._routingControl) {
      map.removeControl(map._routingControl);
    }

    // Add a new routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startPoint), // Start Point
        L.latLng(endPoint), // End Point
      ],
      routeWhileDragging: true, // Allow dragging waypoints
      showAlternatives: true, // Enable alternative routes
      altLineOptions: {
        styles: [
          { color: "green", opacity: 0.7, weight: 4 }, // Style for alternative routes
        ],
      },
      lineOptions: {
        styles: [{ color: "blue", opacity: 0.7, weight: 4 }], // Style for the main route
      },
    })
      .on("routesfound", (e) => {
        const route = e.routes[0];
        setDistance((route.summary.totalDistance / 1000).toFixed(2)); // Convert distance to kilometers
      })
      .addTo(map);

    // Store the routing control on the map instance for future reference
    map._routingControl = routingControl;

    return () => {
      if (map._routingControl) {
        map.removeControl(map._routingControl);
      }
    };
  }, [startPoint, endPoint, map, setDistance]);

  return null;
};

const Map = () => {
  const [startPoint, setStartPoint] = useState(null); // Default start point (user's location)
  const [endPoint, setEndPoint] = useState(null); // Destination point
  const [searchInput, setSearchInput] = useState(""); // Search input for the destination
  const [searchResults, setSearchResults] = useState([]); // Search results for the destination
  const [distance, setDistance] = useState(null); // Total distance of the route
  const [fuelStations, setFuelStations] = useState([]); // Fuel stations data

  useEffect(() => {
    // Fetch user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setStartPoint([latitude, longitude]); // Set the starting point to the user's location
      },
      (error) => {
        console.error("Error fetching location:", error);
        alert(
          "Unable to fetch your location. Please enable location services."
        );
      }
    );
  }, []);

  useEffect(() => {
    // Fetch fuel stations in Kerala
    const fetchFuelStations = async () => {
      try {
        const bbox1 = "8.0883,74.5236,12.8185,77.5857"; // Kerala bounding box
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
      }
    };

    fetchFuelStations();
  }, []);

  const handleSearch = async () => {
    if (!searchInput) return;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${searchInput}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleSelectLocation = (lat, lon) => {
    setEndPoint([lat, lon]); // Update the destination point
    setSearchResults([]); // Clear search results
  };

  return (
    <div className="h-[500px] w-screen ">
      {/* Search Bar for Destination */}
      <div className="absolute bottom-4 left-4 z-10 bg-white p-2 rounded shadow-md w-72">
        <input
          type="text"
          placeholder="Search destination"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        />
        <button
          onClick={handleSearch}
          className="mb-2 bg-green-500 text-white px-4 py-2 rounded w-full"
        >
          Search Destination
        </button>
        {searchResults.length > 0 && (
          <ul className="bg-white border rounded shadow-md max-h-40 overflow-auto">
            {searchResults.map((result, index) => (
              <li
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() =>
                  handleSelectLocation(
                    parseFloat(result.lat),
                    parseFloat(result.lon)
                  )
                }
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      {startPoint && (
        <MapContainer
          center={startPoint}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={startPoint}>
            <Popup>You are here!</Popup>
          </Marker>
          {fuelStations.map((station, index) => (
            <Marker
              key={index}
              position={[station.lat, station.lon]}
              icon={L.icon({
                iconUrl:
                  "https://cdn-icons-png.flaticon.com/512/190/190411.png",
                iconSize: [25, 25],
              })}
            >
              <Popup>{station.name}</Popup>
            </Marker>
          ))}
          {endPoint && (
            <RoutingMachine
              startPoint={startPoint}
              endPoint={endPoint}
              setDistance={setDistance}
            />
          )}
        </MapContainer>
      )}

      {/* Display Total Distance */}
      {distance && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow-md">
          <p>Total Distance: {distance} km</p>
        </div>
      )}
    </div>
  );
};

export default Map;
