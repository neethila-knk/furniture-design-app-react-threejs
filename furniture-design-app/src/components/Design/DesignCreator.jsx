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
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center">
          <input
            type="text"
            value={designName}
            onChange={handleDesignNameChange}
            className="border-0 bg-transparent text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
            placeholder="Design Name"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('2D')}
              className={`px-4 py-2 ${
                viewMode === '2D'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              2D View
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`px-4 py-2 ${
                viewMode === '3D'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              3D View
            </button>
          </div>
          
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Save Design
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {viewMode === '2D' ? <Canvas2D /> : <View3D />}
      </div>
      
      <div className="bg-white p-3 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
        <div>
          Room: {currentDesign.room.width}cm × {currentDesign.room.depth}cm
        </div>
        <div>
          {currentDesign.furniture.length} furniture items
        </div>
        <div>
          <button
            onClick={toggleViewMode}
            className="text-primary-600 hover:text-primary-800"
          >
            Switch to {viewMode === '2D' ? '3D' : '2D'} View
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignCreator;