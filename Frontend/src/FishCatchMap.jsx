import React, { useState, useEffect, useContext } from 'react'; 
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // Provides map components that plug into React's lifecycle
import 'leaflet/dist/leaflet.css'; // This CSS ensures the map tiles and icons display correctly
import L from 'leaflet'; // The main mapping library that React-Leaflet builds upon
import moment from 'moment-timezone'; // Helps format the date and time data for display
import { useNavigate } from 'react-router-dom'; 
import { UserContext } from './UserContext'; 
import RecentCatchesPanel from './RecentCatchesPanel'; 
import styles from './FishCatchMap.module.css';

// Assign a color to each fish based on its name, so each fish type always has a consistent color
const getColorByFishName = (fishName) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
    '#F67280', '#C06C84', '#6C5B7B', '#355C7D', '#F8B195'
  ];
  // Summing character codes of the fish name creates a predictable "hash" to pick the color
  const hash = fishName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Create a special map icon shaped like a fish, colored to match the fish type
const createFishIcon = (color) => {
  console.log('Creating fish icon with color:', color); // Debugging line to ensure icons are generated correctly
  return L.divIcon({
    className: styles.fishIcon,
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
        <path d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 16 8 16s8-10.5 
        8-16c0-4.42-3.58-8-8-8zm0 12c-2.21 
        0-4-1.79-4-4s1.79-4 4-4 4 
        1.79 4 4-1.79 4-4 4z" fill="${color}"/>
        <path d="M12 8.5c1 
        0 2-.5 2-1s-1-2-2-2-2 
        1.5-2 2 1 1 2 1z" fill="white"/>
      </svg>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

// Keeps the map view in sync with updated center/zoom state, rather than just initial values
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Main component that shows the map, the markers for each fish catch, and a side panel
const FishCatchMap = () => {
  const { user } = useContext(UserContext); // Check if there's a logged-in user
  const navigate = useNavigate(); // If no user, we'll navigate to the login page
  
  // State for storing fetched catches, loading status, map positioning, and selected catch
  const [fishCatches, setFishCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([43.6532, -79.3832]); // Starting with a default location
  const [mapZoom, setMapZoom] = useState(10);

  // On load, if there's a user, fetch data; if not, go to login
  useEffect(() => {
    if (user) {
      fetchFishCatches();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetches all fish catches from our server
  const fetchFishCatches = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/get-all-fish-catches`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch fish catches');
      }
      const data = await response.json();
      console.log('Fetched fish catches:', data); // Check what data looks like after fetching
      setFishCatches(data);

      // If we have any catches, center the map on the first one to give context immediately
      if (data.length > 0) {
        setMapCenter([data[0].latitude, data[0].longitude]);
      }
    } catch (error) {
      console.error('Error fetching fish catches:', error);
    } finally {
      setLoading(false);
    }
  };


  // Used by the side panel to focus on a particular catch
  const handleCatchSelect = (selectedCatch) => {
    setMapCenter([selectedCatch.latitude, selectedCatch.longitude]);
    setMapZoom(15);
    setSelectedCatch(selectedCatch);
  };

  // While data is being fetched, display a loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }

  // Once we have data, display the map and all catches on it
  return (
    <div className={styles.mapWrapper}>
      <MapContainer center={mapCenter} zoom={mapZoom} className={styles.mapContainer}>
        <MapController center={mapCenter} zoom={mapZoom} />
        <TileLayer
          url={"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        {fishCatches.map((fishCatch, index) => {
          const lat = fishCatch.latitude;
          const lng = fishCatch.longitude;

          // Skip any data that doesn't have valid coordinates
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            console.error(`Invalid lat/lng for catch ${index}:`, lat, lng);
            return null;
          }

          const fishName = fishCatch.fishName || 'Unknown Fish';
          const color = getColorByFishName(fishName);
          const icon = createFishIcon(color);

          return (
            <Marker key={index} position={[lat, lng]} icon={icon}>
              <Popup>
                <div className={styles.popupContent}>
                  <p><strong>Fish:</strong> {fishCatch.fishName}</p>
                  <p><strong>Rarity Score:</strong> {fishCatch.rarityScore}/10</p>
                  <p><strong>Weight:</strong> {fishCatch.weight} grams</p>
                  <p><strong>Length:</strong> {fishCatch.length} cm</p>
                  <p><strong>Date Caught:</strong> {moment(fishCatch.dateCaught).format('YYYY-MM-DD HH:mm:ss')}</p>
                  <p><strong>Description:</strong> {fishCatch.description}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <RecentCatchesPanel onCatchSelect={handleCatchSelect} />
    </div>
  );
};

export default FishCatchMap;