import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { auth, isConfigured } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('barber_user') || sessionStorage.getItem('barber_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const saveUser = (userData, remember = true) => {
    setUser(userData);
    const userStr = JSON.stringify(userData);
    if (remember) {
      localStorage.setItem('barber_user', userStr);
      sessionStorage.removeItem('barber_user');
    } else {
      sessionStorage.setItem('barber_user', userStr);
      localStorage.removeItem('barber_user');
    }
  };

  const register = async ({ name, email, password, role, phone, remember = true }) => {
    setLoading(true);
    try {
      let idToken;
      if (isConfigured) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateFirebaseProfile(userCredential.user, { displayName: name });
        idToken = await userCredential.user.getIdToken();
      } else {
        idToken = `mock_${email}`;
      }

      const { data } = await api.post('/auth/firebase-login', { idToken, role, phone, name });
      saveUser(data.data, remember);
      toast.success(`Welcome, ${data.data.name}! 🎉`);
      return { success: true, user: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password, remember = true }) => {
    setLoading(true);
    try {
      let idToken;
      if (isConfigured) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        idToken = await userCredential.user.getIdToken();
      } else {
        idToken = `mock_${email}`;
      }

      const { data } = await api.post('/auth/firebase-login', { idToken });
      saveUser(data.data, remember);
      toast.success(`Welcome back, ${data.data.name}!`);
      return { success: true, user: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isConfigured) {
        await signOut(auth);
      }
    } catch (err) {
      console.error('Firebase sign out failed', err);
    }
    setUser(null);
    localStorage.removeItem('barber_user');
    sessionStorage.removeItem('barber_user');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', profileData);
      const isPersistent = localStorage.getItem('barber_user') !== null;
      saveUser(data.data, isPersistent);
      toast.success('Profile updated!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
