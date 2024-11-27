import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './auth/login';
import Signup from './auth/Signup';
import Dashboard from './dashboard/dashboard';
import FishCatchMap from './FishCatchMap';
import Navbar from './Navbar';
import { UserProvider, UserContext } from './UserContext';
import './App.css';

function App() {


  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
      {/* Have to work on the logic on how to print all components  */}
      {/*<Navbar/>Jainam Patel*/}
      {/* <Login /> */}
      {/*<Signup /> RishiGoyal */}
      {/*<Dashboard/>*/}
      {/*<FishCatchMap/>*/}
    </>
  )
}

export default App;
