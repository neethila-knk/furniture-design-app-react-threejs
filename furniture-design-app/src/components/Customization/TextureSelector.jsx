import React, { useState, useEffect } from 'react';

// Define available textures - these should match your files in public/textures
export const availableTextures = [
  { id: 'blue', name: 'Blue', path: '/textures/blue.jpg', color: '#1E3A8A' },
  { id: 'green', name: 'Green', path: '/textures/green.jpg', color: '#166534' },
  { id: 'red', name: 'Red', path: '/textures/red.jpg', color: '#B91C1C' },
  { id: 'yellow', name: 'Yellow', path: '/textures/yellow.jpg', color: '#CA8A04' },
  { id: 'white', name: 'White', path: '/textures/white.jpg', color: '#FFFFFF' },
  { id: 'black', name: 'Black', path: '/textures/black.jpg', color: '#171717' },
  { id: 'wood', name: 'Wood', path: '/textures/wood.jpg', color: '#8B4513' },
  { id: 'marble', name: 'Marble', path: '/textures/marble.jpg', color: '#F5F5F5' },
];

// Helper function to get a texture by ID - ensures we always get a complete object
export const getTextureById = (textureId) => {
  return availableTextures.find(texture => texture.id === textureId) || availableTextures.find(texture => texture.id === 'wood');
};

const TextureSelector = ({ onSelect, currentTextureId }) => {
  const [selectedTexture, setSelectedTexture] = useState(currentTextureId || 'wood');

  useEffect(() => {
    // Update selected texture when currentTextureId prop changes
    if (currentTextureId) {
      setSelectedTexture(currentTextureId);
    }
  }, [currentTextureId]);

  
  const handleTextureSelect = (textureId) => {
    setSelectedTexture(textureId);
    const selectedTextureObj = availableTextures.find(texture => texture.id === textureId);
    console.log("TextureSelector - Selected texture:", selectedTextureObj);
    onSelect(selectedTextureObj);
  };
  return (
    <div className="grid grid-cols-4 gap-2">
      {availableTextures.map(texture => (
        <div 
          key={texture.id}
          onClick={() => handleTextureSelect(texture.id)}
          className={`relative p-1 border hover:border-blue-500 cursor-pointer rounded-md ${
            selectedTexture === texture.id ? 'border-2 border-blue-600' : 'border-gray-300'
          }`}
        >
          <div 
            className="w-12 h-12 bg-cover bg-center rounded-sm"
            style={{ backgroundImage: `url(${texture.path})` }}
          />
          <div className="text-xs text-gray-700 text-center mt-1 truncate">{texture.name}</div>
          {selectedTexture === texture.id && (
            <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TextureSelector;