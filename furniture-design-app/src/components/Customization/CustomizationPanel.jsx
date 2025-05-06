import React, { useState, useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';

const CustomizationPanel = ({ onPreviewShading, onApplyShading }) => {
  const { 
    currentDesign, 
    selectedFurniture, 
    updateRoom, 
    updateFurniture,
    updateShading,
    removeFurniture
  } = useDesign();

  // Local state for color pickers and controls
  const [wallColor, setWallColor] = useState(currentDesign.room.wallColor);
  const [floorColor, setFloorColor] = useState(currentDesign.room.floorColor);
  const [customShadingLevel, setCustomShadingLevel] = useState(0.7);
  const [furnitureScale, setFurnitureScale] = useState(1);
  const [furnitureRotation, setFurnitureRotation] = useState(0);

  // Update local state when design or selection changes
  useEffect(() => {
    setWallColor(currentDesign.room.wallColor);
    setFloorColor(currentDesign.room.floorColor);
    
    if (selectedFurniture) {
      setFurnitureScale(selectedFurniture.scale || 1);
      setFurnitureRotation(selectedFurniture.rotation || 0);
      
      // Check for custom shading
      const customShading = currentDesign.customShading?.find(
        item => item.furnitureId === selectedFurniture.id
      );
      setCustomShadingLevel(customShading?.shadingLevel || 0.7);
    }
  }, [currentDesign, selectedFurniture]);

  // Handle wall color change
  const handleWallColorChange = (e) => {
    const newColor = e.target.value;
    setWallColor(newColor);
    updateRoom({ wallColor: newColor });
  };

  // Handle floor color change
  const handleFloorColorChange = (e) => {
    const newColor = e.target.value;
    setFloorColor(newColor);
    updateRoom({ floorColor: newColor });
  };

  // Handle custom shading change - show preview immediately
  const handleCustomShadingChange = (e) => {
    if (!selectedFurniture) return;
    const value = parseFloat(e.target.value);
    setCustomShadingLevel(value);
    
    // Update preview
    if (typeof onPreviewShading === 'function') {
      onPreviewShading(selectedFurniture.id, value);
    }
  };

  // Apply custom shading permanently
  const handleApplyShading = () => {
    if (!selectedFurniture || !currentDesign.shadingEnabled) return;
    
    if (typeof onApplyShading === 'function') {
      onApplyShading(selectedFurniture.id, customShadingLevel);
    }
  };

  // Handle furniture scale change
  const handleScaleChange = (e) => {
    if (!selectedFurniture) return;
    
    const value = parseFloat(e.target.value);
    setFurnitureScale(value);
    
    const index = currentDesign.furniture.findIndex(
      item => item.id === selectedFurniture.id
    );
    
    if (index !== -1) {
      updateFurniture(index, { scale: value });
    }
  };

  // Handle furniture rotation
  const handleRotateChange = (value) => {
    if (!selectedFurniture) return;
    
    const newRotation = (furnitureRotation + value) % 360;
    setFurnitureRotation(newRotation);
    
    const index = currentDesign.furniture.findIndex(
      item => item.id === selectedFurniture.id
    );
    
    if (index !== -1) {
      updateFurniture(index, { rotation: newRotation });
    }
  };

  // Handle furniture removal
  const handleRemoveFurniture = () => {
    if (!selectedFurniture) return;
    
    const index = currentDesign.furniture.findIndex(
      item => item.id === selectedFurniture.id
    );
    
    if (index !== -1 && window.confirm('Are you sure you want to remove this item?')) {
      removeFurniture(index);
    }
  };

  // Handle shading toggle
  const handleShadingToggle = (e) => {
    const checked = e.target.checked;
    updateShading({ shadingEnabled: checked });
  };

  return (
    <div className="h-full w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Customization</h3>
      
      {/* Room Colors Section */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-600 mb-2">Room Colors</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Wall Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={wallColor}
                onChange={handleWallColorChange}
                className="h-8 w-8 border border-gray-300 rounded mr-2"
              />
              <span className="text-xs text-gray-500">{wallColor}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-500 mb-1">Floor Color</label>
            <div className="flex items-center">
              <input
                type="color"
                value={floorColor}
                onChange={handleFloorColorChange}
                className="h-8 w-8 border border-gray-300 rounded mr-2"
              />
              <span className="text-xs text-gray-500">{floorColor}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Furniture Customization Section - Only visible when furniture is selected */}
      {selectedFurniture && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-600 mb-3">
            Selected: {getFurnitureById(selectedFurniture.id)?.name || 'Furniture'}
          </h4>
          
          <div className="space-y-4">
            {/* Furniture Rotation */}
            <div>
              <label className="block text-sm text-gray-500 mb-2">Rotation: {furnitureRotation}°</label>
              <div className="flex justify-between space-x-2">
                <button
                  onClick={() => handleRotateChange(-15)}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 flex-1"
                >
                  ↺ -15°
                </button>
                <button
                  onClick={() => handleRotateChange(15)}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 flex-1"
                >
                  ↻ +15°
                </button>
              </div>
            </div>
            
            {/* Furniture Scale */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Scale: {furnitureScale.toFixed(1)}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={furnitureScale}
                onChange={handleScaleChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5x</span>
                <span>2x</span>
              </div>
            </div>
            
            {/* Custom Shading */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm text-gray-500">Shading</label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={currentDesign.shadingEnabled}
                    onChange={handleShadingToggle}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-1 text-xs text-gray-500">Enabled</span>
                </label>
              </div>
              
              {currentDesign.shadingEnabled && (
                <>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={customShadingLevel}
                    onChange={handleCustomShadingChange}
                    className="w-full"
                  />
                  <div className="flex justify-between mb-2 text-xs text-gray-500">
                    <span>Matte</span>
                    <span>Glossy</span>
                  </div>
                  <button
                    onClick={handleApplyShading}
                    className="w-full px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                  >
                    Apply Shading
                  </button>
                </>
              )}
            </div>
            
            {/* Remove Furniture */}
            <div className="mt-4">
              <button
                onClick={handleRemoveFurniture}
                className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center justify-center"
              >
                <span className="mr-1">🗑️</span> Remove Item
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!selectedFurniture && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-700">
          Select a furniture item to customize its scale, rotation, and shading.
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Tip: Use the camera controls to orbit around your design and see shading changes from different angles.</p>
      </div>
    </div>
  );
};

export default CustomizationPanel;