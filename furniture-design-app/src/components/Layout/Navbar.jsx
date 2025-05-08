// src/components/Layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDesign } from '../../contexts/DesignContext';

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { currentDesign, saveCurrentDesign, viewMode, setViewMode } = useDesign();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSave = () => {
    if (currentUser) {
      saveCurrentDesign(currentUser.id);
      alert('Design saved successfully!');
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === '2D' ? '3D' : '2D');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Interior Design Studio</span>
            </Link>
            <div className="hidden md:flex ml-6 space-x-4">
              {!isAdmin && (
                <Link to="/home" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          {currentUser && (
            <div className="md:hidden flex items-center">
              <button 
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {/* Menu icon */}
                <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* X icon */}
                <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Desktop menu */}
          {currentUser && (
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm font-medium">
                Design: {currentDesign?.name || 'New Design'}
              </span>

              <button
                onClick={toggleViewMode}
                className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded text-sm font-medium"
              >
                {viewMode === '2D' ? 'Switch to 3D' : 'Switch to 2D'}
              </button>

              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Save Design
              </button>

              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium">
                  {currentUser.name}
                </span>
                <span className="bg-blue-600 text-xs font-semibold px-2 py-1 rounded-full mr-2">
                  {currentUser.role === 'admin' ? 'Admin' : 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {currentUser && (
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
            {!isAdmin && (
              <Link to="/home" className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
                Home
              </Link>
            )}
            
            <div className="px-3 py-2 text-sm font-medium">
              Design: {currentDesign?.name || 'New Design'}
            </div>
            
            <button
              onClick={toggleViewMode}
              className="w-full text-left block px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded text-sm font-medium"
            >
              {viewMode === '2D' ? 'Switch to 3D' : 'Switch to 2D'}
            </button>
            
            <button
              onClick={handleSave}
              className="w-full text-left block px-3 py-2 bg-green-500 hover:bg-green-400 text-white rounded text-sm font-medium"
            >
              Save Design
            </button>
            
            <div className="px-3 py-2 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium block">
                  {currentUser.name}
                </span>
                <span className="bg-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                  {currentUser.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;