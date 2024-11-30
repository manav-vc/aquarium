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
    return null;
  }

  return (
    <div className={styles.Dashboard}>
       <div className={styles.fishIdentifier} >
        <FishIdentifier />
      </div>
      <div className={styles.fishBackground}>
        <FishBackground />
      </div>
     
      <div className={styles.fishIndex} >
        <FishIndexPanel />
      </div>
    </div>
  );
};