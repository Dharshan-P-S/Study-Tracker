import React, { createContext, useContext, useState, useEffect } from 'react';
import { register as registerApi, login as loginApi, logout as logoutApi } from '../api/userApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 Add loading state, default to true

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // Handle potential JSON parsing errors
      setUser(null);
    } finally {
      setLoading(false); // 👈 Set loading to false after checking
    }
  }, []);

  const login = async (email, password) => {
    const userData = await loginApi({ email, password });
    setUser(userData);
  };

  const register = async (name, email, password) => {
    const userData = await registerApi({ name, email, password });
    setUser(userData);
  };
  
  const logout = () => {
    logoutApi();
    setUser(null);
  };

  // 👇 Expose the loading state
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};