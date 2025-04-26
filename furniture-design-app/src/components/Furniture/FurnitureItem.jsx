import React from 'react';
import { formatPrice } from '../../utils/helpers';

const FurnitureItem = ({ item, onSelect }) => {
  // Calculate the display dimensions
  const dimensions = `${item.dimensions.width}m × ${item.dimensions.depth}m × ${item.dimensions.height}m`;
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {formatPrice(item.price)}
          </span>
        </div>
        
        <p className="mt-1 text-xs text-gray-500">{item.description}</p>
        
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="text-gray-500">
            <span className="font-medium">Type:</span> {item.type}
          </div>
          <div className="text-gray-500">
            <span className="font-medium">Category:</span> {item.category}
          </div>
          <div className="text-gray-500">
            <span className="font-medium">Materials:</span> {item.materials.join(', ')}
          </div>
          <div className="text-gray-500">
            <span className="font-medium">Dimensions:</span> {dimensions}
          </div>
        </div>
        
        <div className="mt-4 h-32 bg-gray-100 rounded-md relative overflow-hidden">
          {/* Simple SVG representation of the furniture based on its type */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 100 100" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Render different SVG shapes based on furniture type */}
            {item.type === 'chair' && (
              <>
                {/* Chair seat */}
                <rect 
                  x="25" 
                  y="50" 
                  width="50" 
                  height="10" 
                  fill={item.defaultColor} 
                  stroke="#000" 
                  strokeWidth="1"
                />
                {/* Chair back */}
                <rect 
                  x="25" 
                  y="20" 
                  width="50" 
                  height="30" 
                  fill={item.defaultColor} 
                  stroke="#000" 
                  strokeWidth="1"
                />
                {/* Chair legs */}
                <rect x="25" y="60" width="5" height="25" fill={item.defaultColor} stroke="#000" strokeWidth="1" />
                <rect x="70" y="60" width="5" height="25" fill={item.defaultColor} stroke="#000" strokeWidth="1" />
              </>
            )}
            
            {item.type === 'table' && (
              <>
                {/* Table top */}
                <rect 
                  x="10" 
                  y="40" 
                  width="80" 
                  height="10" 
                  fill={item.defaultColor} 
                  stroke="#000" 
                  strokeWidth="1"
                />
                {/* Table legs */}
                <rect x="15" y="50" width="5" height="30" fill={item.defaultColor} stroke="#000" strokeWidth="1" />
                <rect x="80" y="50" width="5" height="30" fill={item.defaultColor} stroke="#000" strokeWidth="1" />
                <rect x="15" y="50" width="70" height="5" fill={item.defaultColor} stroke="#000" strokeWidth="1" />
              </>
            )}
            
            {/* Add more furniture type representations as needed */}
          </svg>
        </div>
        
        <div className="mt-3">
          <button
            onClick={() => onSelect(item)}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default FurnitureItem;