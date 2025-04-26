import React, { useState, useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';

const ColorPicker = () => {
  const { currentDesign, selectedFurniture, updateFurniture, updateRoom } = useDesign();
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [applyTo, setApplyTo] = useState('selected'); // 'selected', 'all', 'room'
  const [roomPart, setRoomPart] = useState('wall'); // 'wall', 'floor', 'accent'
  
  // Predefined colors
  const predefinedColors = [
    '#FFFFFF', // White
    '#000000', // Black
    '#D2B48C', // Tan
    '#8B4513', // Saddle Brown
    '#A0522D', // Sienna
    '#CD853F', // Peru
    '#DEB887', // Burlywood
    '#F5F5DC', // Beige
    '#E0FFFF', // Light Cyan
    '#ADD8E6', // Light Blue
    '#87CEFA', // Light Sky Blue
    '#B0C4DE', // Light Steel Blue
    '#4682B4', // Steel Blue
    '#6495ED', // Cornflower Blue
    '#D8BFD8', // Thistle
    '#DDA0DD', // Plum
    '#EE82EE', // Violet
    '#DA70D6', // Orchid
    '#FF69B4', // Hot Pink
    '#FFB6C1', // Light Pink
    '#FFC0CB', // Pink
    '#FFD700', // Gold
    '#FFDAB9', // Peach Puff
    '#FFA07A', // Light Salmon
  ];
  
  // Update selected color when selected furniture changes
  useEffect(() => {
    if (selectedFurniture) {
      setSelectedColor(selectedFurniture.color || getFurnitureById(selectedFurniture.id)?.defaultColor || '#000000');
      setApplyTo('selected');
    } else {
      // Default to wall color if no furniture is selected
      setSelectedColor(currentDesign.room.wallColor);
      setApplyTo('room');
    }
  }, [selectedFurniture, currentDesign]);
  
  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
  };
  
  const handleApplyColor = () => {
    if (applyTo === 'selected' && selectedFurniture) {
      // Find the index of the selected furniture
      const index = currentDesign.furniture.findIndex(item => item.id === selectedFurniture.id);
      if (index !== -1) {
        updateFurniture(index, { ...selectedFurniture, color: selectedColor });
      }
    } 
    else if (applyTo === 'all') {
      // Update all furniture items with the same color
      currentDesign.furniture.forEach((item, index) => {
        updateFurniture(index, { ...item, color: selectedColor });
      });
    } 
    else if (applyTo === 'room') {
      // Update room color based on selected part
      const roomUpdates = {};
      
      if (roomPart === 'wall') {
        roomUpdates.wallColor = selectedColor;
      } else if (roomPart === 'floor') {
        roomUpdates.floorColor = selectedColor;
      } else if (roomPart === 'accent') {
        roomUpdates.accentColor = selectedColor;
      }
      
      updateRoom(roomUpdates);
    }
  };
  
  const handleColorSwatchClick = (color) => {
    setSelectedColor(color);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Color Customization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Color</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {predefinedColors.map((color) => (
                    <div
                      key={color}
                      className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSwatchClick(color)}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={handleColorChange}
                    className="h-10 w-10 mr-2"
                  />
                  <input
                    type="text"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="#RRGGBB"
                  />
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
                      id="applyToRoom"
                      name="applyTo"
                      value="room"
                      checked={applyTo === 'room'}
                      onChange={() => setApplyTo('room')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="applyToRoom" className="ml-2 block text-gray-900">
                      Room Elements
                    </label>
                  </div>
                </div>
              </div>
              
              {applyTo === 'room' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Room Part</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="roomPartWall"
                        name="roomPart"
                        value="wall"
                        checked={roomPart === 'wall'}
                        onChange={() => {
                          setRoomPart('wall');
                          setSelectedColor(currentDesign.room.wallColor);
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="roomPartWall" className="ml-2 block text-gray-900">
                        Walls
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="roomPartFloor"
                        name="roomPart"
                        value="floor"
                        checked={roomPart === 'floor'}
                        onChange={() => {
                          setRoomPart('floor');
                          setSelectedColor(currentDesign.room.floorColor);
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="roomPartFloor" className="ml-2 block text-gray-900">
                        Floor
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="roomPartAccent"
                        name="roomPart"
                        value="accent"
                        checked={roomPart === 'accent'}
                        onChange={() => {
                          setRoomPart('accent');
                          setSelectedColor(currentDesign.room.accentColor);
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="roomPartAccent" className="ml-2 block text-gray-900">
                        Accent
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Color Preview</h3>
                <div
                  className="w-full h-40 rounded-lg border border-gray-300 flex items-center justify-center"
                  style={{ backgroundColor: selectedColor }}
                >
                  <span
                    className="px-3 py-1 rounded text-sm font-medium"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      color: '#000000',
                    }}
                  >
                    {selectedColor}
                  </span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Colors</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: currentDesign.room.wallColor }}
                    ></div>
                    <span className="text-sm">Wall: {currentDesign.room.wallColor}</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: currentDesign.room.floorColor }}
                    ></div>
                    <span className="text-sm">Floor: {currentDesign.room.floorColor}</span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded-full mr-2"
                      style={{ backgroundColor: currentDesign.room.accentColor }}
                    ></div>
                    <span className="text-sm">Accent: {currentDesign.room.accentColor}</span>
                  </div>
                  
                  {selectedFurniture && (
                    <div className="mt-4">
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 rounded-full mr-2"
                          style={{ backgroundColor: selectedFurniture.color || getFurnitureById(selectedFurniture.id)?.defaultColor }}
                        ></div>
                        <span className="text-sm">
                          Selected Furniture: {selectedFurniture.color || getFurnitureById(selectedFurniture.id)?.defaultColor}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleApplyColor}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Apply Color
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;