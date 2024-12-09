import React, { useState, useEffect } from 'react'; 
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Fish, Weight, Ruler, Search } from 'lucide-react'; // Icons that visually communicate actions and data
import styles from './RecentCatchesPanel.module.css'; 

export default function RecentCatchesPanel({ onCatchSelect }) {
  // Tracks the list of recent catches, loading state, whether the panel is expanded or not, user search input, and any errors
  const [recentCatches, setRecentCatches] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  // On first load, fetch the recent catches without any filter
  useEffect(() => {
    fetchRecentCatches();
  }, []);

  // Fetches recent catches from the server, can use a query to filter results by name or rarity
  const fetchRecentCatches = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/recent-fish-catches?query=${query}`);
      if (!response.ok) throw new Error('Failed to fetch recent catches');
      const data = await response.json();
      setRecentCatches(data);
    } catch (error) {
      console.error('Error fetching recent catches:', error); // Helps debug any server issues
      setError('Failed to fetch recent catches. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handles user typing in the search input. Immediately fetches filtered results.
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchRecentCatches(e.target.value);
  };

  // Toggles the panel between expanded and minimized states
  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    // Panel changes its height based on the isExpanded state, showing more or less info
    <div className={`${styles.panel} ${isExpanded ? styles.expanded : styles.minimized}`}>
      <div className={styles.header} onClick={togglePanel}>
        <h2>Recent Catches</h2>
        {isExpanded ? <ChevronUp /> : <ChevronDown />} {/* Icon changes direction based on panel state */}
      </div>

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        {/* Search input allows filtering fish by name or rarity in real-time */}
        <input
          type="text"
          placeholder="Search by fish name or rarity..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.content}>
        {loading ? (
          // Shows a loader when data is on the way
          <div className={styles.loader}></div>
        ) : error ? (
          // In case something went wrong, display an error message
          <div className={styles.error}>{error}</div>
        ) : recentCatches.length === 0 ? (
          // If no results match the query or if there are no recent catches at all, show a friendly message
          <div className={styles.noResults}>No fish catches found.</div>
        ) : (
          // If data is available, render a list of each catch
          <ul className={styles.catchList}>
            {recentCatches.map((fishCatch) => (
              // Each catch item is clickable to zoom in on that catch in the map
              <li key={fishCatch._id} className={styles.catchItem} onClick={() => onCatchSelect(fishCatch)}>
                <div className={styles.catchHeader}>
                  {/* Fish icon colored by rarity, giving a visual clue about the fish's rarity */}
                  <Fish className={styles.fishIcon} style={{ color: getFishColor(fishCatch.rarityScore) }} />
                  <h3>{fishCatch.fishName}</h3>
                </div>
                <div className={styles.catchInfo}>
                  {/* Showing when the fish was caught in a nicer date format */}
                  <p className={styles.catchDate}>{format(new Date(fishCatch.dateCaught), 'MMM dd, yyyy HH:mm')}</p>
                  {/* A rarity bar visually represents how rare the catch is */}
                  <div className={styles.rarityBar}>
                    <div 
                      className={styles.rarityFill} 
                      style={{ width: `${fishCatch.rarityScore * 10}%` }}
                    ></div>
                  </div>
                  {/* Additional details: weight, length, and explicit rarity score */}
                  <div className={styles.catchDetails}>
                    <span><Weight size={16} /> {fishCatch.weight}g</span>
                    <span><Ruler size={16} /> {fishCatch.length}cm</span>
                    <span>Rarity: {fishCatch.rarityScore}/10</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// This function converts the rarity score (0 to 10) into a color hue, shifting from blue to red
// Higher rarity: closer to red, lower rarity: closer to blue
const getFishColor = (rarityScore) => {
  const hue = 200 - (rarityScore * 20);
  return `hsl(${hue}, 100%, 50%)`;
};