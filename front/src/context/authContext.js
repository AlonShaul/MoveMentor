import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useApi } from './ApiContext';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const apiUrl = useApi();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setCurrentUser(storedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = async (inputs) => {
    try {
      const res = await axios.post(`${apiUrl}/api/auth/login`, inputs);
      setCurrentUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    } catch (err) {
      console.log(apiUrl)
      console.error('Login failed:', err.response ? err.response.data : err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${apiUrl}/api/auth/logout`);
      setCurrentUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } catch (err) {
      console.error('Logout failed:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
