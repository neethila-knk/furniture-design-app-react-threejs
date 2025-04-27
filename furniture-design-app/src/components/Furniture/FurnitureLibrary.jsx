import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../../contexts/DesignContext';
import { furnitureCategories, furnitureItems } from '../../models/furnitureData';

const FurnitureLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { addFurniture, currentDesign } = useDesign();
  const navigate = useNavigate();

  const handleAddFurniture = (furnitureId) => {
    const success = addFurniture(furnitureId);
    if (success) {
      navigate('/design-view');
    }
  };

  const filteredFurniture = furnitureItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Furniture Library</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search furniture..."
                  className="w-64 border text-gray-500 border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-md ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                All
              </button>
              {furnitureCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-md ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {filteredFurniture.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFurniture.map((furniture) => (
                <div key={furniture.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <div
                      className="w-32 h-32"
                      style={{
                        backgroundColor: furniture.defaultColor,
                        borderRadius: furniture.category === 'chairs' ? '10px 10px 0 0' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="text-4xl">
                        {furniture.category === 'chairs' ? '🪑' :
                         furniture.category === 'tables' ? '🪟' :
                         furniture.category === 'sofas' ? '🛋️' :
                         furniture.category === 'cabinets' ? '🗄️' :
                         furniture.category === 'beds' ? '🛏️' : '📦'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{furniture.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{furniture.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">${furniture.price.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => handleAddFurniture(furniture.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add to Design
                      </button>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {furniture.dimensions.width} × {furniture.dimensions.depth} × {furniture.dimensions.height} cm
                      </span>
                      <span>
                        {furniture.materials.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg text-gray-600 mb-4">No furniture items found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FurnitureLibrary;
