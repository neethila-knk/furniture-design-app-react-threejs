// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DesignProvider } from './contexts/DesignContext';
import { initializeDesigns } from './models/designData';

// Components
import Login from './components/Auth/Login';
import Home from './components/Home/Home';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import RoomSetup from './components/Room/RoomSetup';
import FurnitureLibrary from './components/Furniture/FurnitureLibrary';
import DesignCreator from './components/Design/DesignCreator';
import SavedDesigns from './components/Management/SavedDesigns';

// Utility component for protected routes for all authenticated users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Route check for initial path
const InitialRoute = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (isAdmin) {
    return <Navigate to="/dashboard" />;
  } else {
    return <Navigate to="/home" />;
  }
};

function App() {
  // Initialize the design data in localStorage
  React.useEffect(() => {
    try {
      initializeDesigns();
    } catch (error) {
      console.error('Error initializing designs:', error);
    }
  }, []);
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <DesignProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/home"
              element={<Home />}
            />
            
            <Route
              path="/"
              element={<InitialRoute />}
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/room-setup"
              element={
                <ProtectedRoute>
                  <RoomSetup />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/furniture-library"
              element={
                <ProtectedRoute>
                  <FurnitureLibrary />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/design-view"
              element={
                <ProtectedRoute>
                  <DesignCreator />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/saved-designs"
              element={
                <ProtectedRoute>
                  <SavedDesigns />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </DesignProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;