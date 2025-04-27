import React, { useState, useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { useAuth } from '../../contexts/AuthContext';
import Canvas2D from './Canvas2D';
import View3D from './View3D';

const DesignCreator = () => {
  const { currentDesign, viewMode, setViewMode, saveCurrentDesign } = useDesign();
  const { currentUser } = useAuth();
  const [designName, setDesignName] = useState(currentDesign.name);
  
  // Update design name when current design changes
  useEffect(() => {
    setDesignName(currentDesign.name);
  }, [currentDesign]);
  
  const handleSave = () => {
    // Update name before saving
    const designToSave = {
      ...currentDesign,
      name: designName
    };
    
    saveCurrentDesign(currentUser.id, designToSave);
    alert('Design saved successfully!');
  };
  
  const handleDesignNameChange = (e) => {
    setDesignName(e.target.value);
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === '2D' ? '3D' : '2D');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top bar with name and controls - responsive layout */}
      <div className="bg-white shadow-sm p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div className="flex items-center w-full sm:w-auto">
          <input
            type="text"
            value={designName}
            onChange={handleDesignNameChange}
            className="border-0 bg-transparent text-gray-600 text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full sm:w-auto"
            placeholder="Design Name"
          />
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('2D')}
              className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base ${
                viewMode === '2D'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base ${
                viewMode === '3D'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              3D
            </button>
          </div>
          
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base"
          >
            Save
          </button>
        </div>
      </div>
      
      {/* Main content area - Canvas */}
      <div className="flex-1 overflow-hidden">
        {viewMode === '2D' ? <Canvas2D /> : <View3D />}
      </div>
      
      {/* Footer with stats and toggle */}
      <div className="bg-white p-2 sm:p-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-600">
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0 w-full sm:w-auto">
          <div>
            Room: {currentDesign.room.width}cm × {currentDesign.room.depth}cm
          </div>
          <div className="hidden sm:block">•</div>
          <div>
            {currentDesign.furniture.length} furniture items
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-end">
          <button
            onClick={toggleViewMode}
            className="text-blue-600 hover:text-blue-800"
          >
            Switch to {viewMode === '2D' ? '3D' : '2D'} View
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignCreator;