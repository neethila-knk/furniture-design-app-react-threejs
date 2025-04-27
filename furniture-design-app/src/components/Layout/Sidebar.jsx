import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDesign } from '../../contexts/DesignContext';
import { getAllDesigns } from '../../models/designData';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const { createNewDesign, loadDesign, currentDesign } = useDesign();
  const [designs, setDesigns] = useState([]);
  const [showDesigns, setShowDesigns] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNewDesign = () => {
    if (window.confirm('Create a new design? Any unsaved changes will be lost.')) {
      createNewDesign(currentUser.id);
      setSidebarOpen(false); // Close sidebar on mobile after action
    }
  };

  const toggleDesignsList = () => {
    if (!showDesigns) {
      // Only fetch designs when we open the list
      setDesigns(getAllDesigns().filter(design => design.createdBy === currentUser.id));
    }
    setShowDesigns(!showDesigns);
  };

  const handleLoadDesign = (designId) => {
    loadDesign(designId);
    setShowDesigns(false);
    setSidebarOpen(false); // Close sidebar on mobile after action
  };

  // Close sidebar if clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('main-sidebar');
      const toggleButton = document.getElementById('sidebar-toggle');
      
      if (sidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target) && 
          toggleButton && 
          !toggleButton.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button 
        id="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed z-20 top-20 left-4 bg-blue-600 text-white p-2 rounded-md shadow-lg"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        id="main-sidebar"
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 left-0 z-40 bg-gray-900 text-white w-64 h-screen transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4">Design Tools</h2>

          <div className="space-y-4 flex-grow">
            <div>
              <button
                onClick={handleNewDesign}
                className="w-full text-left px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
              >
                Create New Design
              </button>
            </div>

            <div>
              <button
                onClick={toggleDesignsList}
                className="w-full text-left px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded flex justify-between items-center"
              >
                <span>Load Design</span>
                <span>{showDesigns ? '▲' : '▼'}</span>
              </button>

              {showDesigns && (
                <div className="mt-2 ml-2 space-y-1 max-h-40 overflow-y-auto">
                  {designs.length > 0 ? (
                    designs.map(design => (
                      <button
                        key={design.id}
                        onClick={() => handleLoadDesign(design.id)}
                        className={`w-full text-left px-4 py-1 text-sm rounded hover:bg-blue-500 ${
                          currentDesign.id === design.id ? 'bg-blue-500' : ''
                        }`}
                      >
                        {design.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 px-4">No saved designs</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="pt-2 border-t border-gray-700">
              <Link
                to="/dashboard"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Dashboard
              </Link>

            </div>
            <div className="pt-border-gray-700">
              <Link
                to="/room-setup"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Room Setup
              </Link>
            </div>

           

            <div>
              <Link
                to="/furniture-library"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Furniture Library
              </Link>
            </div>

            <div>
              <Link
                to="/customization"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Customization
              </Link>
            </div>

            <div>
              <Link
                to="/saved-designs"
                className="block px-4 py-2 hover:bg-gray-700 rounded"
                onClick={() => setSidebarOpen(false)}
              >
                Saved Designs
              </Link>
            </div>
          </div>

          <div className="mt-auto py-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-lg font-bold">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-gray-400">{currentUser?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;