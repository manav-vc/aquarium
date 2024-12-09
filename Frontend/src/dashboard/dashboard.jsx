import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FishIdentifier from './FishIdentifier';
import { UserContext } from '../UserContext';
import FishBackground from './FishBackground';
import FishIndexPanel from './FishIndexPanel';
import styles from './dashboard.module.css';


export default function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // We could think of implementing a new loading feature in here 
  }

  return (
    <div className={styles.Dashboard}>
      
      {/* This is the 3D aquarium component */}
      <div className={styles.fishBackground}>
        <FishBackground/>
      </div>

      {/* This component handles all the task related to capturing and analyzing a fish  */}
      <div className={styles.fishIdentifier} >
        <FishIdentifier/>
      </div>

      {/* This shows the fish detail present in the aquarium  */}
      <div className={styles.fishIndex} >
        <FishIndexPanel/>
      </div>
    </div>
  );
};