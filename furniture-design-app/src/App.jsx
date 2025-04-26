import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DesignProvider } from './contexts/DesignContext';

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
    const initializeDesigns = () => {
      try {
        // Load the models
        const { initializeDesigns } = require('./models/designData');
        initializeDesigns();
      } catch (error) {
        console.error('Error initializing designs:', error);
      }
    };
    
    initializeDesigns();
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
                  <div className="flex flex-col h-full">
                    <div className="p-4 bg-white shadow-sm">
                      <h1 className="text-xl font-semibold text-gray-800">Customization Tools</h1>
                    </div>
                    <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Color Customization</h2>
                        <p className="text-sm text-gray-600 mb-4">
                          Change colors of furniture items or room elements.
                        </p>
                        <button
                          onClick={() => window.location.href = '/customization/color'}
                          className="mt-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                        >
                          Open Color Picker
                        </button>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Shading Controls</h2>
                        <p className="text-sm text-gray-600 mb-4">
                          Adjust light and shadow effects for realistic appearance.
                        </p>
                        <button
                          onClick={() => window.location.href = '/customization/shading'}
                          className="mt-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                        >
                          Open Shading Controls
                        </button>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-md flex flex-col">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Scaling Controls</h2>
                        <p className="text-sm text-gray-600 mb-4">
                          Resize furniture items to fit perfectly in your room.
                        </p>
                        <button
                          onClick={() => window.location.href = '/customization/scaling'}
                          className="mt-auto bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
                        >
                          Open Scaling Controls
                        </button>
                      </div>
                    </div>
                  </div>
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