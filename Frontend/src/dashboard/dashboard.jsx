import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FishIdentifier from './FishIdentifier';
import { UserContext } from '../UserContext'; 
import FishBackground from './FishBackground';
import FishIndexPanel from './FishIndexPanel';

export default function Dashboard(){
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
    <div >
      <div >
        <FishBackground />
      </div>
      <div >
        <FishIdentifier />
      </div>
      <div >
      <FishIndexPanel /> 
      </div>
    </div>
  );
};