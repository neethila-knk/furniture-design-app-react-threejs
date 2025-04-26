import React, { useState, useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';

const ShadingControls = () => {
  const { currentDesign, selectedFurniture, updateShading, updateCustomShading } = useDesign();
  
  const [shadingEnabled, setShadingEnabled] = useState(currentDesign.shadingEnabled);
  const [globalShadingLevel, setGlobalShadingLevel] = useState(currentDesign.globalShading);
  const [customShadingLevel, setCustomShadingLevel] = useState(0.7);
  const [applyCustomTo, setApplyCustomTo] = useState('selected');
  
  // Update state when design changes
  useEffect(() => {
    setShadingEnabled(currentDesign.shadingEnabled);
    setGlobalShadingLevel(currentDesign.globalShading);
    
    // Update custom shading level if selected furniture has custom shading
    if (selectedFurniture) {
      const customShading = currentDesign.customShading.find(
        item => item.furnitureId === selectedFurniture.id
      );
      
      if (customShading) {
        setCustomShadingLevel(customShading.shadingLevel);
      } else {
        // Default to global shading level if no custom shading
        setCustomShadingLevel(currentDesign.globalShading);
      }
    }
  }, [currentDesign, selectedFurniture]);
  
  const handleToggleShading = () => {
    const newShadingEnabled = !shadingEnabled;
    setShadingEnabled(newShadingEnabled);
    updateShading({ shadingEnabled: newShadingEnabled });
  };
  
  const handleGlobalShadingChange = (e) => {
    const newLevel = parseFloat(e.target.value);
    setGlobalShadingLevel(newLevel);
    updateShading({ globalShading: newLevel });
  };
  
  const handleCustomShadingChange = (e) => {
    setCustomShadingLevel(parseFloat(e.target.value));
  };
  
  const handleApplyCustomShading = () => {
    if (applyCustomTo === 'selected' && selectedFurniture) {
      // Apply to selected furniture only
      updateCustomShading(selectedFurniture.id, customShadingLevel);
    } else if (applyCustomTo === 'all') {
      // Apply to all furniture items
      currentDesign.furniture.forEach(item => {
        updateCustomShading(item.id, customShadingLevel);
      });
    }
  };
  
  const handleResetCustomShading = () => {
    if (applyCustomTo === 'selected' && selectedFurniture) {
      // Remove custom shading for selected furniture
      const updatedCustomShading = currentDesign.customShading.filter(
        item => item.furnitureId !== selectedFurniture.id
      );
      
      updateShading({ customShading: updatedCustomShading });
      setCustomShadingLevel(globalShadingLevel);
    } else if (applyCustomTo === 'all') {
      // Remove all custom shading
      updateShading({ customShading: [] });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Shading Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Global Shading</h3>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm text-gray-500">
                      {shadingEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      onClick={handleToggleShading}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        shadingEnabled ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform ${
                          shadingEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <div className={shadingEnabled ? '' : 'opacity-50 pointer-events-none'}>
                  <label
                    htmlFor="globalShadingSlider"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Global Shading Level: {Math.round(globalShadingLevel * 100)}%
                  </label>
                  <input
                    type="range"
                    id="globalShadingSlider"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={globalShadingLevel}
                    onChange={handleGlobalShadingChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Dark</span>
                    <span>Light</span>
                  </div>
                </div>
              </div>
              
              <div className={shadingEnabled ? '' : 'opacity-50 pointer-events-none'}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Shading</h3>
                
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="customShadingSlider"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Custom Shading Level: {Math.round(customShadingLevel * 100)}%
                    </label>
                    <input
                      type="range"
                      id="customShadingSlider"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={customShadingLevel}
                      onChange={handleCustomShadingChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!shadingEnabled}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Dark</span>
                      <span>Light</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Apply Custom Shading To:</div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="applyToSelected"
                          name="applyCustomTo"
                          value="selected"
                          checked={applyCustomTo === 'selected'}
                          onChange={() => setApplyCustomTo('selected')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          disabled={!selectedFurniture || !shadingEnabled}
                        />
                        <label htmlFor="applyToSelected" className="ml-2 block text-gray-900">
                          Selected Furniture
                          {!selectedFurniture && (
                            <span className="text-gray-400 text-sm ml-2">(No furniture selected)</span>
                          )}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="applyToAll"
                          name="applyCustomTo"
                          value="all"
                          checked={applyCustomTo === 'all'}
                          onChange={() => setApplyCustomTo('all')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          disabled={currentDesign.furniture.length === 0 || !shadingEnabled}
                        />
                        <label htmlFor="applyToAll" className="ml-2 block text-gray-900">
                          All Furniture
                          {currentDesign.furniture.length === 0 && (
                            <span className="text-gray-400 text-sm ml-2">(No furniture in design)</span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApplyCustomShading}
                      disabled={!shadingEnabled || (applyCustomTo === 'selected' && !selectedFurniture)}
                      className={`px-4 py-2 rounded-md text-sm ${
                        !shadingEnabled || (applyCustomTo === 'selected' && !selectedFurniture)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      Apply Custom Shading
                    </button>
                    <button
                      onClick={handleResetCustomShading}
                      disabled={!shadingEnabled || (applyCustomTo === 'selected' && !selectedFurniture)}
                      className={`px-4 py-2 rounded-md text-sm ${
                        !shadingEnabled || (applyCustomTo === 'selected' && !selectedFurniture)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Reset to Global
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shading Preview</h3>
                <div className="flex flex-col space-y-4 items-center">
                  <div className="w-full h-32 flex items-center justify-center bg-white rounded-lg">
                    <div
                      className="w-24 h-24 rounded-lg"
                      style={{
                        backgroundColor: selectedFurniture
                          ? selectedFurniture.color || getFurnitureById(selectedFurniture.id)?.defaultColor
                          : '#8B4513',
                        opacity: shadingEnabled ? globalShadingLevel : 1,
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Global Shading: {Math.round(globalShadingLevel * 100)}%
                  </div>
                  
                  {shadingEnabled && (
                    <div className="w-full h-32 flex items-center justify-center bg-white rounded-lg mt-2">
                      <div
                        className="w-24 h-24 rounded-lg"
                        style={{
                          backgroundColor: selectedFurniture
                            ? selectedFurniture.color || getFurnitureById(selectedFurniture.id)?.defaultColor
                            : '#8B4513',
                          opacity: customShadingLevel,
                        }}
                      ></div>
                    </div>
                  )}
                  {shadingEnabled && (
                    <div className="text-sm text-gray-600">
                      Custom Shading: {Math.round(customShadingLevel * 100)}%
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-blue-900 mb-2">About Shading</h3>
                <p className="text-sm text-blue-800">
                  Shading affects how light or dark furniture and elements appear in your design. 
                  Global shading applies to all items, while custom shading lets you highlight 
                  specific furniture pieces by making them lighter or darker than the rest.
                </p>
                <div className="mt-3 text-sm text-blue-800">
                  <span className="font-medium">Tips:</span>
                  <ul className="list-disc list-inside mt-1">
                    <li>Use darker shading for objects in shadows or corners</li>
                    <li>Use lighter shading for items you want to highlight</li>
                    <li>For realistic designs, vary shading levels across furniture</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadingControls;