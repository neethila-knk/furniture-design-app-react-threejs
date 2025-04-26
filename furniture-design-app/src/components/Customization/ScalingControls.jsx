import React, { useState, useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';

const ScalingControls = () => {
  const { currentDesign, selectedFurniture, updateFurniture } = useDesign();
  
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [applyTo, setApplyTo] = useState('selected'); // 'selected', 'all', 'category'
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Update scale factor when selected furniture changes
  useEffect(() => {
    if (selectedFurniture) {
      setScaleFactor(selectedFurniture.scale);
      setApplyTo('selected');
      
      // Set category based on selected furniture
      const furniture = getFurnitureById(selectedFurniture.id);
      if (furniture) {
        setSelectedCategory(furniture.category);
      }
    } else {
      setScaleFactor(1.0);
    }
  }, [selectedFurniture]);
  
  const handleScaleChange = (e) => {
    setScaleFactor(parseFloat(e.target.value));
  };
  
  const handleApplyScale = () => {
    if (applyTo === 'selected' && selectedFurniture) {
      // Find the index of the selected furniture
      const index = currentDesign.furniture.findIndex(item => item.id === selectedFurniture.id);
      if (index !== -1) {
        updateFurniture(index, { ...selectedFurniture, scale: scaleFactor });
      }
    } 
    else if (applyTo === 'all') {
      // Apply scale to all furniture
      currentDesign.furniture.forEach((item, index) => {
        updateFurniture(index, { ...item, scale: scaleFactor });
      });
    } 
    else if (applyTo === 'category' && selectedCategory) {
      // Apply scale to all furniture of the selected category
      currentDesign.furniture.forEach((item, index) => {
        const furniture = getFurnitureById(item.id);
        if (furniture && furniture.category === selectedCategory) {
          updateFurniture(index, { ...item, scale: scaleFactor });
        }
      });
    }
  };
  
  const handleReset = () => {
    if (applyTo === 'selected' && selectedFurniture) {
      // Reset scale of selected furniture to 1.0
      const index = currentDesign.furniture.findIndex(item => item.id === selectedFurniture.id);
      if (index !== -1) {
        updateFurniture(index, { ...selectedFurniture, scale: 1.0 });
      }
      setScaleFactor(1.0);
    } 
    else if (applyTo === 'all') {
      // Reset scale of all furniture to 1.0
      currentDesign.furniture.forEach((item, index) => {
        updateFurniture(index, { ...item, scale: 1.0 });
      });
      setScaleFactor(1.0);
    } 
    else if (applyTo === 'category' && selectedCategory) {
      // Reset scale of all furniture of the selected category to 1.0
      currentDesign.furniture.forEach((item, index) => {
        const furniture = getFurnitureById(item.id);
        if (furniture && furniture.category === selectedCategory) {
          updateFurniture(index, { ...item, scale: 1.0 });
        }
      });
      setScaleFactor(1.0);
    }
  };
  
  // Get unique categories from current design
  const getUniqueCategories = () => {
    const categories = new Set();
    
    currentDesign.furniture.forEach(item => {
      const furniture = getFurnitureById(item.id);
      if (furniture) {
        categories.add(furniture.category);
      }
    });
    
    return Array.from(categories);
  };
  
  const uniqueCategories = getUniqueCategories();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Scaling Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Scale Factor</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Current Scale: {scaleFactor.toFixed(2)}x
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setScaleFactor(Math.max(0.5, scaleFactor - 0.1))}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                      >
                        -
                      </button>
                      <button
                        onClick={() => setScaleFactor(Math.min(2.0, scaleFactor + 0.1))}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={scaleFactor}
                    onChange={handleScaleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>50%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Apply To</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="applyToSelected"
                      name="applyTo"
                      value="selected"
                      checked={applyTo === 'selected'}
                      onChange={() => setApplyTo('selected')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      disabled={!selectedFurniture}
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
                      name="applyTo"
                      value="all"
                      checked={applyTo === 'all'}
                      onChange={() => setApplyTo('all')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      disabled={currentDesign.furniture.length === 0}
                    />
                    <label htmlFor="applyToAll" className="ml-2 block text-gray-900">
                      All Furniture
                      {currentDesign.furniture.length === 0 && (
                        <span className="text-gray-400 text-sm ml-2">(No furniture in design)</span>
                      )}
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="applyToCategory"
                      name="applyTo"
                      value="category"
                      checked={applyTo === 'category'}
                      onChange={() => setApplyTo('category')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      disabled={uniqueCategories.length === 0}
                    />
                    <label htmlFor="applyToCategory" className="ml-2 block text-gray-900">
                      Furniture Category
                      {uniqueCategories.length === 0 && (
                        <span className="text-gray-400 text-sm ml-2">(No furniture in design)</span>
                      )}
                    </label>
                  </div>
                </div>
                
                {applyTo === 'category' && uniqueCategories.length > 0 && (
                  <div className="mt-4 ml-6">
                    <label htmlFor="categorySelect" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Category
                    </label>
                    <select
                      id="categorySelect"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {uniqueCategories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Scale Preview</h3>
                <div className="flex justify-around items-center h-40">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 border border-gray-300 rounded flex items-center justify-center">
                      <div
                        className="w-16 h-16 bg-primary-600 rounded"
                        style={{ transform: 'scale(1)' }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 mt-2">Original Size (1.0x)</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 border border-gray-300 rounded flex items-center justify-center">
                      <div
                        className="w-16 h-16 bg-primary-600 rounded"
                        style={{ transform: `scale(${scaleFactor})` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 mt-2">Scaled Size ({scaleFactor.toFixed(2)}x)</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>
                    <span className="font-medium">Note:</span> Scaling affects the size of furniture in your design.
                    Values range from 0.5x (half size) to 2.0x (double size).
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-yellow-900 mb-2">Scaling Tips</h3>
                <div className="text-sm text-yellow-800">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Scale furniture to match the proportions of your room</li>
                    <li>Larger rooms often benefit from larger furniture</li>
                    <li>Be mindful of walkways when scaling furniture</li>
                    <li>Consistent scaling within furniture groups creates harmony</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleApplyScale}
                  disabled={
                    (applyTo === 'selected' && !selectedFurniture) ||
                    (applyTo === 'all' && currentDesign.furniture.length === 0) ||
                    (applyTo === 'category' && (!selectedCategory || uniqueCategories.length === 0))
                  }
                  className={`px-4 py-2 rounded-md text-sm ${
                    (applyTo === 'selected' && !selectedFurniture) ||
                    (applyTo === 'all' && currentDesign.furniture.length === 0) ||
                    (applyTo === 'category' && (!selectedCategory || uniqueCategories.length === 0))
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  Apply Scale
                </button>
                <button
                  onClick={handleReset}
                  disabled={
                    (applyTo === 'selected' && !selectedFurniture) ||
                    (applyTo === 'all' && currentDesign.furniture.length === 0) ||
                    (applyTo === 'category' && (!selectedCategory || uniqueCategories.length === 0))
                  }
                  className={`px-4 py-2 rounded-md text-sm ${
                    (applyTo === 'selected' && !selectedFurniture) ||
                    (applyTo === 'all' && currentDesign.furniture.length === 0) ||
                    (applyTo === 'category' && (!selectedCategory || uniqueCategories.length === 0))
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Reset to Original Size
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScalingControls;