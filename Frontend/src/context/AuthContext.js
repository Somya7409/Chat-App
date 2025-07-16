import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Load from localStorage on app reload
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
     try {
      const parsedUser = JSON.parse(storedUser);
      console.log("🔍 AuthContext user:", parsedUser); // ✅ Add this line
      setUser(parsedUser);
    } catch (e) {
      console.error('❌ Invalid user data in localStorage', e);
      localStorage.removeItem('user');
    }
    }
  }, []);
  const login = (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
