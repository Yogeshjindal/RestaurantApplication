import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/auth/me`, { withCredentials: true });
        setUser(data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      // ignore
    }
  };

  const login = async (email, password, role) => {
    try {
      const endpoint = role ? `${API_BASE}/auth/${role}/login` : `${API_BASE}/auth/login`;
      const payload = { email, password };
      
      const { data } = await axios.post(endpoint, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error?.response?.data?.message || "Login failed" 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post(`${API_BASE}/auth/register`, userData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error?.response?.data?.message || "Registration failed" 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      logout, 
      login, 
      register, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


