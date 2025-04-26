import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDesign } from '../../contexts/DesignContext';
import { getAllDesigns } from '../../models/designData';

const Sidebar = () => {
  const { currentUser } = useAuth();
  const { createNewDesign, loadDesign, currentDesign } = useDesign();
  const [designs, setDesigns] = useState([]);
  const [showDesigns, setShowDesigns] = useState(false);

  const handleNewDesign = () => {
    if (window.confirm('Create a new design? Any unsaved changes will be lost.')) {
      createNewDesign(currentUser.id);
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
  };

  return (
    <div className="bg-white text-dark w-64 flex-shrink-0 h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Design Tools</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={handleNewDesign}
              className="w-full text-left px-4 py-2 bg-secondary-700 hover:bg-secondary-600 rounded"
            >
              Create New Design
            </button>
          </div>
          
          <div>
            <button
              onClick={toggleDesignsList}
              className="w-full text-left px-4 py-2 bg-secondary-700 hover:bg-secondary-600 rounded flex justify-between items-center"
            >
              <span>Load Design</span>
              <span>{showDesigns ? '▲' : '▼'}</span>
            </button>
            
            {showDesigns && (
              <div className="mt-2 ml-2 space-y-1">
                {designs.length > 0 ? (
                  designs.map(design => (
                    <button
                      key={design.id}
                      onClick={() => handleLoadDesign(design.id)}
                      className={`w-full text-left px-4 py-1 text-sm rounded hover:bg-secondary-600 ${
                        currentDesign.id === design.id ? 'bg-secondary-600' : ''
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
          
          <div className="pt-2 border-t border-secondary-600">
            <Link
              to="/room-setup"
              className="block px-4 py-2 hover:bg-secondary-700 rounded"
            >
              Room Setup
            </Link>
          </div>
          
          <div>
            <Link
              to="/furniture-library"
              className="block px-4 py-2 hover:bg-secondary-700 rounded"
            >
              Furniture Library
            </Link>
          </div>
          
          <div>
            <Link
              to="/customization"
              className="block px-4 py-2 hover:bg-secondary-700 rounded"
            >
              Customization
            </Link>
          </div>
          
          <div>
            <Link
              to="/saved-designs"
              className="block px-4 py-2 hover:bg-secondary-700 rounded"
            >
              Saved Designs
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 w-64 p-4 bg-secondary-900">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-secondary-600 flex items-center justify-center text-lg font-bold">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">{currentUser?.name}</p>
            <p className="text-xs text-gray-400">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;