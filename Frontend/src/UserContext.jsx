import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);


  //To check whether we have the previously stored details in the localstorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  //login function to log in the user 
  const login = async (username, password) => {
    try {

      //Request being send to backend server 
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        const userData = { username };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };


  //This is the sign up function for the first time user 
  const signup = async (username, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        const userData = { username };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'An error occurred. Please try again.' };
    }
  };

  //This function will logout the current user and will remove the data from the localstorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (

    //This means whoever uses this UserContext provide them with the values in the "values" attribute 
    <UserContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </UserContext.Provider>
  );
};