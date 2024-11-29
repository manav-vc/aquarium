import React, { useState, useContext, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Fish, Weight, Ruler, Search } from 'lucide-react';
import { UserContext } from '../UserContext';

export default function FishIndexPanel ({ onCatchSelect })  {
  const { user } = useContext(UserContext);
  const [catches, setCatches] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllCatches();
  }, []);

  const fetchAllCatches = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/get-all-fish-catches?query=${query}&username=${user.username}`);
      if (!response.ok) throw new Error('Failed to fetch fish index');
      const data = await response.json();
      setCatches(data);
      console.log("There are", data.length, "fish in the index.");
    } catch (error) {
      console.error('Error fetching fish indexes:', error);
      setError('Failed to fetch recent catches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /*
  useEffect(() => {
    fetchRecentCatches();
  }, []);

  const fetchRecentCatches = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/recent-fish-catches?query=${query}`);
      if (!response.ok) throw new Error('Failed to fetch recent catches');
      const data = await response.json();
      setRecentCatches(data);
    } catch (error) {
      console.error('Error fetching recent catches:', error);
      setError('Failed to fetch recent catches. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  */
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchAllCatches(e.target.value);
  };

  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div >
      <div onClick={togglePanel}>
        <h2>Fish Index</h2>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>

      <div>
        <Search size={20} />
        <input
          type="text"
          placeholder="Search by fish name or rarity..."
          value={searchQuery}
          onChange={handleSearch}
          
        />
      </div>

      <div>
        {loading ? (
          <div></div>
        ) : error ? (
          <div>{error}</div>
        ) : catches.length === 0 ? (
          <div >No fish catches found.</div>
        ) : (
          <ul >
            {catches.map((fishCatch) => (
              <li key={fishCatch._id}  onClick={() => onCatchSelect(fishCatch)}>
                <div >
                  <Fish  style={{ color: getFishColor(fishCatch.rarityScore) }} />
                  <h3>{fishCatch.fishName}</h3>
                </div>
                <div >
                  <p >{format(new Date(fishCatch.dateCaught), 'MMM dd, yyyy HH:mm')}</p>
                  <div >
                    <div 
                      
                      style={{ width: `${fishCatch.rarityScore * 10}%` }}
                    ></div>
                  </div>
                  <div >
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

const getFishColor = (rarityScore) => {
  const hue = 200 - (rarityScore * 20); // Blue (200) to Red (0)
  return `hsl(${hue}, 100%, 50%)`;
};
