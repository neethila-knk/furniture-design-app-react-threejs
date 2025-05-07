import React, { useState, useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';
import TextureSelector, {
  availableTextures,
  getTextureById,
} from './TextureSelector';

const CustomizationPanel = ({
  onPreviewShading,
  onApplyShading,
  onApplyShadingToAll,
  onPreviewTexture,
  onApplyTexture,
  onApplyTextureToAll,
}) => {
  const {
    currentDesign,
    selectedFurniture,
    updateRoom,
    updateFurniture,
    updateShading,
    removeFurniture,
    updateGlobalTexture,
    updateFurnitureTexture,
    resetAllTextures,                 /* NEW */
  } = useDesign();

  /* ────────── local state ────────── */
  const [wallColor, setWallColor] = useState(currentDesign.room.wallColor);
  const [floorColor, setFloorColor] = useState(currentDesign.room.floorColor);
  const [customShadingLevel, setCustomShadingLevel] = useState(0.7);
  const [globalShadingLevel, setGlobalShadingLevel] = useState(
    currentDesign.globalShading || 0.3
  );
  const [furnitureScale, setFurnitureScale] = useState(1);
  const [furnitureRotation, setFurnitureRotation] = useState(0);
  const [activeTab, setActiveTab] = useState('colors'); // colors | textures | shading

  const [selectedTextureObj, setSelectedTextureObj] = useState(null);
  const [selectedGlobalTextureObj, setSelectedGlobalTextureObj] = useState(
    null
  );

  /* ────────── helpers ────────── */
  const getCurrentTextureId = () => {
    if (selectedFurniture) {
      const c = currentDesign.customTextures?.find(
        (t) => t.furnitureId === selectedFurniture.id
      );
      return c?.textureId || currentDesign.globalTextureId || 'wood';
    }
    return currentDesign.globalTextureId || 'wood';
  };

  /* sync when design or selection changes */
  useEffect(() => {
    if (selectedFurniture) {
      const c = currentDesign.customTextures?.find(
        (t) => t.furnitureId === selectedFurniture.id
      );
      const texId = c?.textureId || currentDesign.globalTextureId || 'wood';
      setSelectedTextureObj(getTextureById(texId));
    }
    setSelectedGlobalTextureObj(
      getTextureById(currentDesign.globalTextureId || 'wood')
    );
  }, [
    currentDesign,
    selectedFurniture,
    currentDesign.customTextures,
    currentDesign.globalTextureId,
  ]);

  /* ────────── colour & shading handlers (unchanged) ────────── */
  const handleWallColorChange = (e) => {
    const c = e.target.value;
    setWallColor(c);
    updateRoom({ wallColor: c });
  };
  const handleFloorColorChange = (e) => {
    const c = e.target.value;
    setFloorColor(c);
    updateRoom({ floorColor: c });
  };
  const handleGlobalShadingChange = (e) => {
    const v = parseFloat(e.target.value);
    setGlobalShadingLevel(v);
    updateShading({ globalShading: v });
  };
  const handleApplyShadingToAll = () => {
    if (!currentDesign.shadingEnabled) return;
    onApplyShadingToAll?.(globalShadingLevel);
  };
  const handleCustomShadingChange = (e) => {
    if (!selectedFurniture) return;
    const v = parseFloat(e.target.value);
    setCustomShadingLevel(v);
    onPreviewShading?.(selectedFurniture.id, v);
  };
  const handleApplyShading = () => {
    if (!selectedFurniture || !currentDesign.shadingEnabled) return;
    onApplyShading?.(selectedFurniture.id, customShadingLevel);
  };

  /* ────────── geometry handlers (unchanged) ────────── */
  const handleScaleChange = (e) => {
    if (!selectedFurniture) return;
    const v = parseFloat(e.target.value);
    setFurnitureScale(v);
    const i = currentDesign.furniture.findIndex(
      (it) => it.id === selectedFurniture.id
    );
    if (i !== -1) updateFurniture(i, { scale: v });
  };
  const handleRotateChange = (step) => {
    if (!selectedFurniture) return;
    const nr = (furnitureRotation + step) % 360;
    setFurnitureRotation(nr);
    const i = currentDesign.furniture.findIndex(
      (it) => it.id === selectedFurniture.id
    );
    if (i !== -1) updateFurniture(i, { rotation: nr });
  };

  /* ────────── texture handlers ────────── */
  const handleTextureSelect = (tex) => {
    setSelectedTextureObj(tex);
    onPreviewTexture?.(selectedFurniture.id, tex);
  };
  const handleApplyTexture = () => {
    if (!selectedFurniture || !selectedTextureObj) return;
    onApplyTexture?.(selectedFurniture.id, selectedTextureObj);
  };

  const handleGlobalTextureSelect = (tex) => {
    setSelectedGlobalTextureObj(tex);
    onPreviewTexture?.('global', tex);
  };
  const handleApplyTextureToAll = () => {
    const curId = currentDesign.globalTextureId || 'wood';
    const texObj =
      selectedGlobalTextureObj ||
      availableTextures.find((t) => t.id === curId);
    if (texObj) onApplyTextureToAll?.(texObj, true);
  };

  /* NEW: reset buttons */
  const handleResetTexture = () => {
    if (!selectedFurniture) return;
    updateFurnitureTexture(selectedFurniture.id, null);
  };
  const handleResetTextureAll = () => {
    resetAllTextures();
  };

  /* ────────── remove furniture ────────── */
  const handleRemoveFurniture = () => {
    if (!selectedFurniture) return;
    const i = currentDesign.furniture.findIndex(
      (it) => it.id === selectedFurniture.id
    );
    if (i !== -1 && window.confirm('Remove this item?')) removeFurniture(i);
  };

  /* shading toggle */
  const handleShadingToggle = (e) =>
    updateShading({ shadingEnabled: e.target.checked });

  /* ────────── RENDER ────────── */
  return (
    <div className="h-full w-64 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Customization</h3>

      {/* tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {['colors', 'textures', 'shading'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* COLORS TAB */}
      {activeTab === 'colors' && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-600 mb-2">Room Colors</h4>
          <div className="space-y-3">
            {/* wall */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Wall Color
              </label>
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

            {/* floor */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Floor Color
              </label>
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
      )}

      {/* TEXTURES TAB */}
      {activeTab === 'textures' && (
        <div className="mb-6">
          {selectedFurniture ? (
            <>
              <h4 className="font-medium text-gray-600 mb-2">
                Furniture Texture
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Apply texture to{' '}
                {getFurnitureById(selectedFurniture.id)?.name || 'item'}
              </p>
              <TextureSelector
                onSelect={handleTextureSelect}
                currentTextureId={getCurrentTextureId()}
              />
              <button
                onClick={handleApplyTexture}
                className="w-full mt-3 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                Apply to This Item
              </button>
              <button
                onClick={handleResetTexture}
                className="w-full mt-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
              >
                Reset Texture
              </button>
            </>
          ) : (
            <>
              <h4 className="font-medium text-gray-600 mb-2">
                Global Texture
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                Apply texture to all furniture
              </p>
              <TextureSelector
                onSelect={handleGlobalTextureSelect}
                currentTextureId={currentDesign.globalTextureId || 'wood'}
              />
              <button
                onClick={handleApplyTextureToAll}
                className="w-full mt-3 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              >
                Apply to All Furniture
              </button>
              <button
                onClick={handleResetTextureAll}
                className="w-full mt-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
              >
                Reset All Textures
              </button>
            </>
          )}
        </div>
      )}

      {/* SHADING TAB (unchanged UI, now brighter default) */}
      {activeTab === 'shading' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-600">Global Shading</h4>
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
              <div className="mb-2">
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={globalShadingLevel}
                  onChange={handleGlobalShadingChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Matte</span>
                  <span>Glossy</span>
                </div>
              </div>
              <button
                onClick={handleApplyShadingToAll}
                className="w-full px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded mb-2"
              >
                Apply to All Furniture
              </button>
            </>
          )}

          {selectedFurniture && currentDesign.shadingEnabled && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-600 mb-2">
                Item Shading
              </h4>
              <p className="text-sm text-gray-500 mb-2">
                Customize shading for{' '}
                {getFurnitureById(selectedFurniture.id)?.name || 'item'}
              </p>
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
                Apply to This Item
              </button>
            </div>
          )}
        </div>
      )}

      {/* furniture‑specific controls (rotation/scale/remove)  ... unchanged ... */}
      {selectedFurniture && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-600 mb-3">
            Selected:{' '}
            {getFurnitureById(selectedFurniture.id)?.name || 'Furniture'}
          </h4>

          <div className="space-y-4">
            {/* rotation */}
            <div>
              <label className="block text-sm text-gray-500 mb-2">
                Rotation: {furnitureRotation}°
              </label>
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

            {/* scale */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Scale: {furnitureScale.toFixed(1)}x
              </label>
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

            {/* remove */}
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

      {!selectedFurniture && activeTab !== 'textures' && (
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100 text-sm text-blue-700">
          Select a furniture item to customize its scale, rotation, and
          material.
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        <p>
          Tip: Use the camera controls to orbit around your design and see
          texture and shading changes from different angles.
        </p>
      </div>
    </div>
  );
};

export default CustomizationPanel;
