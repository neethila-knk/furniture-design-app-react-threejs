import React, { useState, useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { roomShapes, colorSchemes } from '../../models/furnitureData';

const RoomSetup = () => {
  const { currentDesign, updateRoom } = useDesign();
  
  const [roomWidth, setRoomWidth] = useState(currentDesign.room.width);
  const [roomDepth, setRoomDepth] = useState(currentDesign.room.depth);
  const [roomHeight, setRoomHeight] = useState(currentDesign.room.height);
  const [roomShape, setRoomShape] = useState(currentDesign.room.shape);
  const [wallColor, setWallColor] = useState(currentDesign.room.wallColor);
  const [floorColor, setFloorColor] = useState(currentDesign.room.floorColor);
  const [accentColor, setAccentColor] = useState(currentDesign.room.accentColor);
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    setRoomWidth(currentDesign.room.width);
    setRoomDepth(currentDesign.room.depth);
    setRoomHeight(currentDesign.room.height);
    setRoomShape(currentDesign.room.shape);
    setWallColor(currentDesign.room.wallColor);
    setFloorColor(currentDesign.room.floorColor);
    setAccentColor(currentDesign.room.accentColor);
    setSelectedScheme(null);
  }, [currentDesign]);

  const handleApplyChanges = () => {
    updateRoom({
      width: roomWidth,
      depth: roomDepth,
      height: roomHeight,
      shape: roomShape,
      wallColor,
      floorColor,
      accentColor
    });
    alert('Room settings updated successfully!');
  };

  const handleApplyColorScheme = (scheme) => {
    setWallColor(scheme.wallColor);
    setFloorColor(scheme.floorColor);
    setAccentColor(scheme.accentColor);
    setSelectedScheme(scheme.id);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Room Dimensions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Room Dimensions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="roomWidth" className="block text-sm font-medium text-gray-700 mb-1">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      id="roomWidth"
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(Number(e.target.value))}
                      min="200"
                      max="1000"
                      className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="roomDepth" className="block text-sm font-medium text-gray-700 mb-1">
                      Depth (cm)
                    </label>
                    <input
                      type="number"
                      id="roomDepth"
                      value={roomDepth}
                      onChange={(e) => setRoomDepth(Number(e.target.value))}
                      min="200"
                      max="1000"
                      className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="roomHeight" className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      id="roomHeight"
                      value={roomHeight}
                      onChange={(e) => setRoomHeight(Number(e.target.value))}
                      min="200"
                      max="500"
                      className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Room Shape */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Room Shape</h3>
                <div className="grid grid-cols-3 gap-4">
                  {roomShapes.map((shape) => (
                    <div
                      key={shape.id}
                      onClick={() => setRoomShape(shape.id)}
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        roomShape === shape.id ? 'border-2 border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="text-3xl mb-2 text-gray-500">{shape.icon}</span>
                      <span className="text-sm text-gray-900">{shape.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Color Schemes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Color Scheme</h3>
                <div className="grid grid-cols-1 gap-4">
                  {colorSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      onClick={() => handleApplyColorScheme(scheme)}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedScheme === scheme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex space-x-2 mr-4">
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: scheme.wallColor }}></div>
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: scheme.floorColor }}></div>
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: scheme.accentColor }}></div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{scheme.name}</h4>
                        <p className="text-xs text-gray-500">{scheme.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Colors</h3>
                <div className="space-y-3">
                  {/* Wall Color */}
                  <div>
                    <label htmlFor="wallColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Wall Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        id="wallColor"
                        value={wallColor}
                        onChange={(e) => setWallColor(e.target.value)}
                        className="h-10 w-10 mr-2"
                      />
                      <input
                        type="text"
                        value={wallColor}
                        onChange={(e) => setWallColor(e.target.value)}
                        className="w-full text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Floor Color */}
                  <div>
                    <label htmlFor="floorColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        id="floorColor"
                        value={floorColor}
                        onChange={(e) => setFloorColor(e.target.value)}
                        className="h-10 w-10 mr-2"
                      />
                      <input
                        type="text"
                        value={floorColor}
                        onChange={(e) => setFloorColor(e.target.value)}
                        className="w-full text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-1">
                      Accent Color
                    </label>
                    <div className="flex">
                      <input
                        type="color"
                        id="accentColor"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="h-10 w-10 mr-2"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-full text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Room Preview */}
          <div className="mt-8">
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Room Preview</h3>
              <div
                className="w-full h-60 border border-gray-300 rounded-lg overflow-hidden"
                style={{ backgroundColor: floorColor }}
              >
                <div
                  className="w-full h-full p-4 flex items-center justify-center"
                  style={{ backgroundColor: wallColor }}
                >
                  <div className={`relative ${roomShape === 'square' ? 'w-3/4 h-3/4' : 'w-4/5 h-2/3'}`}>
                    {roomShape === 'l-shaped' && (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundColor: floorColor,
                        clipPath: 'polygon(0 0, 100% 0, 100% 60%, 40% 60%, 40% 100%, 0 100%)'
                      }}></div>
                    )}
                    {(roomShape === 'rectangle' || roomShape === 'square') && (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundColor: floorColor
                      }}></div>
                    )}
                    <div 
                      className="absolute bottom-4 right-4 w-8 h-8 rounded-full" 
                      style={{ backgroundColor: accentColor }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Changes Button */}
            <div className="flex justify-end">
              <button
                onClick={handleApplyChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Apply Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoomSetup;