import React, { useEffect, useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation 
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import Hi from './components/hi';

import { setCredentials, clearCredentials } from './features/auth/authSlice';
import ProtectedRoute from './ProtectedRoute';
import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/Dashboard';

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/verify`,
          {},
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (response.status === 200 && response.data.user) {
          dispatch(setCredentials({
            username: response.data.user.username,
            token: 'VALID_SESSION'
          }));
        }
      } catch (error) {
        dispatch(clearCredentials());
        console.error('Session verification failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dash" /> : <Navigate to="/login" />} 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/dash" 
        element={<ProtectedRoute element={<Dashboard />} />} 
      />
      <Route path='/hi'  element={<Hi/>}/>
    </Routes>
  );
}

export default App;