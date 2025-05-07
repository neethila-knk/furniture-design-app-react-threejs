/* src/components/RoomSetup.jsx */
import React, { useState, useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { roomTypes, colorSchemes } from '../../models/room';   /* NEW import */
import { getFurnitureById } from '../../models/furnitureData';

import { useNavigate } from 'react-router-dom';


const RoomSetup = () => {
  const { currentDesign, updateRoom, replaceFurniture, setViewMode } = useDesign();
  const navigate = useNavigate();

  /* ────────── local state ────────── */
  const [roomWidth, setRoomWidth] = useState(currentDesign.room.width);
  const [roomDepth, setRoomDepth] = useState(currentDesign.room.depth);
  const [roomHeight, setRoomHeight] = useState(currentDesign.room.height);
  const [roomShape, setRoomShape] = useState(currentDesign.room.shape);
  const [wallColor, setWallColor] = useState(currentDesign.room.wallColor);
  const [floorColor, setFloorColor] = useState(currentDesign.room.floorColor);
  const [accentColor, setAccentColor] = useState(currentDesign.room.accentColor);

  const [selectedScheme, setSelectedScheme] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);  /* NEW */
  const selectedType = roomTypes.find((t) => t.id === selectedTypeId);
  /* sync when design changes */
  useEffect(() => {
    setRoomWidth(currentDesign.room.width);
    setRoomDepth(currentDesign.room.depth);
    setRoomHeight(currentDesign.room.height);
    setRoomShape(currentDesign.room.shape);
    setWallColor(currentDesign.room.wallColor);
    setFloorColor(currentDesign.room.floorColor);
    setAccentColor(currentDesign.room.accentColor);
    setSelectedScheme(null);
    /* reset highlight */
  }, [currentDesign]);

  /* ────────── handlers ────────── */
  const handleApplyChanges = () => {
    updateRoom({
      width: roomWidth,
      depth: roomDepth,
      height: roomHeight,
      shape: roomShape,
      wallColor,
      floorColor,
      accentColor,
    });
    /* switch the global view mode to 2‑D so Canvas2D renders */
    setViewMode('2D');

    /* go to the Design Creator / canvas page.
       Adjust the path if your routing differs. */
    navigate('/design-view');   // e.g. <Route path="/design-view" element={<DesignCreator/>} />
  };

  const handleApplyColorScheme = (scheme) => {
    setWallColor(scheme.colors.wall);
    setFloorColor(scheme.colors.floor);
    setAccentColor(scheme.colors.trim ?? scheme.colors.accent ?? '#FFFFFF');
    setSelectedScheme(scheme.id);
  };

  /* clicking a preset fills all fields */
  const applyRoomType = (t) => {
    if (Array.isArray(t.defaultFurniture) && t.defaultFurniture.length) {
      /* keep only items whose id still exists in furnitureItems */
      const cleanList = t.defaultFurniture
        .filter((f) => getFurnitureById(f.id))
        .map((f) => ({
          ...f,
          rotation: 0,
          color: getFurnitureById(f.id).defaultColor,
          scale: 1,
        }));


      replaceFurniture(cleanList);

      /* 2 . sync the room dimensions / colours inside DesignContext */
      updateRoom({
        width: t.width,
        depth: t.depth,
        height: t.height,
        shape: t.shape,
        wallColor: t.wallColor,
        floorColor: t.floorColor, accentColor: t.accentColor,
      });


    } else {
      /* if the preset has no defaults, empty the room */
      replaceFurniture([]);
    }
    setRoomWidth(t.width);
    setRoomDepth(t.depth);
    setRoomHeight(t.height);
    setRoomShape(t.shape);
    setWallColor(t.wallColor);
    setFloorColor(t.floorColor);
    setAccentColor(t.accentColor);
    setSelectedTypeId(t.id);
    setSelectedScheme(null);          // clear scheme highlight
  };

  /* ────────── render ────────── */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Setup</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN -------------------------------------------------- */}
            <div className="space-y-6">

              {/* Room Type -------------------------------------------------- */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Room Type
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {roomTypes.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => applyRoomType(t)}
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50
                        ${selectedTypeId === t.id ? 'border-2 border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <span className="text-3xl mb-2">{t.icon}</span>
                      <span className="text-sm text-gray-900">{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Default‑furniture preview */}
              {selectedType && selectedType.defaultFurniture?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Default furniture in this room
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-sm text-gray-700">

                    {selectedType.defaultFurniture.map((item, idx) => {
                      const f = getFurnitureById(item.id);

                      return (
                        <li key={`${item.id}-${idx}`}>
                          {f?.name || item.id}
                          <span className="text-gray-500">
                            {' '}
                            – at ({item.x} cm, {item.y} cm)
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}


              {/* Room Dimensions ------------------------------------------- */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Room Dimensions
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (cm)
                    </label>
                    <input
                      type="number"
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(Number(e.target.value))}
                      min="200" max="1000"
                      className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Depth (cm)
                    </label>
                    <input
                      type="number"
                      value={roomDepth}
                      onChange={(e) => setRoomDepth(Number(e.target.value))}
                      min="200" max="1000"
                      className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={roomHeight}
                      onChange={(e) => setRoomHeight(Number(e.target.value))}
                      min="200" max="500"
                      className="w-full border text-gray-500 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN ------------------------------------------------- */}
            <div className="space-y-6">
              {/* Color Schemes --------------------------------------------- */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Color Scheme
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {colorSchemes.map((scheme) => (
                    <div
                      key={scheme.id}
                      onClick={() => handleApplyColorScheme(scheme)}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50
                        ${selectedScheme === scheme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex space-x-2 mr-4">
                        {Object.values(scheme.colors).slice(0, 3).map((c, i) => (
                          <div key={i} className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {scheme.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {scheme.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers -------------------------------------- */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Custom Colors
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'wallColor', label: 'Wall Color', value: wallColor, setter: setWallColor },
                    { id: 'floorColor', label: 'Floor Color', value: floorColor, setter: setFloorColor },
                    { id: 'accentColor', label: 'Accent Color', value: accentColor, setter: setAccentColor },
                  ].map(({ id, label, value, setter }) => (
                    <div key={id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                      </label>
                      <div className="flex">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="h-10 w-10 mr-2"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="w-full text-gray-500 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Room Preview -------------------------------------------------- */}
          <div className="mt-8">
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Room Preview
              </h3>
              <div
                className="w-full h-60 border border-gray-300 rounded-lg overflow-hidden"
                style={{ backgroundColor: floorColor }}
              >
                <div
                  className="w-full h-full p-4 flex items-center justify-center"
                  style={{ backgroundColor: wallColor }}
                >
                  <div
                    className={`relative ${roomShape === 'square' ? 'w-3/4 h-3/4' : 'w-4/5 h-2/3'
                      }`}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: floorColor,
                      }}
                    />
                    <div
                      className="absolute bottom-4 right-4 w-8 h-8 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Apply button */}
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
          {/* END preview --------------------------------------------------- */}
        </div>
      </div>
    </div>
  );
};

export default RoomSetup;
