import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Interfaces (ensure these match your needs)
interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  socials?: {
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await fetch(`${apiUrl}/api/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (!response.ok) {
            throw new Error("Invalid token");
          }
          const userData = await response.json();
          setToken(storedToken);
          setUser(userData);
        } catch (error) {
          console.error("Initial auth failed:", error);
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
      const response = await fetch(`${apiUrl}3001/api/profile`, {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch profile after login");
      const userData = await response.json();
      setUser(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const refetchUser = useCallback(async () => {
    if (token) {
      try {
        const response = await fetch(`${apiUrl}:3001/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Token invalid, logging out");
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error(error);
        logout(); 
      }
    }
  }, [token, logout]);

  const contextValue = { token, user, isLoading, login, logout, refetchUser };

  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};