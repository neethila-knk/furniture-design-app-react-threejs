import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DesignProvider } from './contexts/DesignContext';
import { initializeDesigns } from './models/designData';

// Components
import Login from './components/Auth/Login';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import RoomSetup from './components/Room/RoomSetup';
import FurnitureLibrary from './components/Furniture/FurnitureLibrary';
import DesignCreator from './components/Design/DesignCreator';
import ColorPicker from './components/Customization/ColorPicker';
import ShadingControls from './components/Customization/ShadingControls';
import ScalingControls from './components/Customization/ScalingControls';
import SavedDesigns from './components/Management/SavedDesigns';
import CustomizationTools from './components/Customization/CustomizationTools';

// Utility component for protected routes
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

function App() {
  // Initialize the design data in localStorage
  React.useEffect(() => {
    try {
      initializeDesigns();  // ✅ directly call
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
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
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
              path="/customization"
              element={
                <ProtectedRoute>
                  <CustomizationTools/>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customization/color"
              element={
                <ProtectedRoute>
                  <ColorPicker />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customization/shading"
              element={
                <ProtectedRoute>
                  <ShadingControls />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/customization/scaling"
              element={
                <ProtectedRoute>
                  <ScalingControls />
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
            
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </DesignProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;