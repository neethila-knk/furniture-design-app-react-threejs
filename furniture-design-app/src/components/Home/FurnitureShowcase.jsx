// src/components/Home/FurnitureShowcase.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { furnitureItems, furnitureCategories } from '../../models/furnitureData';
import { useAuth } from '../../contexts/AuthContext';

const FurnitureShowcase = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredFurniture, setFilteredFurniture] = useState([]);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Filter furniture based on selected category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredFurniture(furnitureItems);
    } else {
      setFilteredFurniture(furnitureItems.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Interior Design Studio</h1>
              <button 
                onClick={() => navigate('/home')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium mr-2">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-white mr-2">{currentUser.name}</span>
                <span className="bg-indigo-600 text-xs font-semibold px-2 py-1 rounded-full text-white">
                  {currentUser.role}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800">Our Furniture Collection</h2>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Browse our curated selection of high-quality furniture for every room in your home.
            </p>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All Furniture
              </button>
              
              {furnitureCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Furniture Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFurniture.map(item => (
              <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-slate-200 flex items-center justify-center">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.name} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Furniture+Image';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span className="mt-2">{item.name}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{item.name}</h3>
                      <p className="text-sm text-slate-500 capitalize">{item.category.replace('-', ' ')}</p>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-semibold">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <p className="mt-2 text-slate-600 text-sm line-clamp-2">{item.description}</p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {item.materials.map((material, index) => (
                        <span 
                          key={index} 
                          className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-xs text-slate-500">
                      {item.dimensions.width} × {item.dimensions.depth} × {item.dimensions.height} cm
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* No Results Message */}
          {filteredFurniture.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No furniture items found in this category.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-slate-300">© 2025 Interior Design Studio. All rights reserved.</p>
            </div>
            <div>
              <p className="text-slate-300">Group 85</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FurnitureShowcase;