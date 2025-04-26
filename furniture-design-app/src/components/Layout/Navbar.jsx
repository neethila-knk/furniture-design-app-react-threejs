import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDesign } from '../../contexts/DesignContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { currentDesign, saveCurrentDesign, viewMode, setViewMode } = useDesign();

  const handleSave = () => {
    if (currentUser) {
      saveCurrentDesign(currentUser.id);
      alert('Design saved successfully!');
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === '2D' ? '3D' : '2D');
  };

  return (
    <nav className="bg-white text-dark shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Interior Design Studio</span>
            </Link>
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                Design: {currentDesign.name}
              </span>
              
              <button
                onClick={toggleViewMode}
                className="bg-primary-600 hover:bg-primary-500 px-3 py-1 rounded text-sm font-medium"
              >
                {viewMode === '2D' ? 'Switch to 3D' : 'Switch to 2D'}
              </button>
              
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm font-medium"
              >
                Save Design
              </button>
              
              <div className="relative ml-3">
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium">
                    {currentUser.name}
                  </span>
                  <button
                    onClick={logout}
                    className="bg-primary-800 hover:bg-primary-900 px-3 py-1 rounded text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;