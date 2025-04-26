import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeDesigns, saveDesign, updateDesign, deleteDesign, getDesignById } from '../models/designData';
import { getFurnitureById } from '../models/furnitureData';

// Create the Design Context
const DesignContext = createContext();

export const useDesign = () => useContext(DesignContext);

export const DesignProvider = ({ children }) => {
  // Initialize designs in local storage if not already done
  useEffect(() => {
    initializeDesigns();
  }, []);

  // Current active design
  const [currentDesign, setCurrentDesign] = useState({
    name: 'Untitled Design',
    room: {
      width: 500, // in cm
      depth: 400, // in cm
      height: 280, // in cm
      shape: 'rectangle',
      wallColor: '#F8F8FF', // ghost white
      floorColor: '#A9A9A9', // dark gray
      accentColor: '#4682B4', // steel blue
    },
    furniture: [],
    shadingEnabled: true,
    globalShading: 0.7,
    customShading: []
  });

  // Currently selected furniture item (if any)
  const [selectedFurniture, setSelectedFurniture] = useState(null);

  // Current view mode (2D or 3D)
  const [viewMode, setViewMode] = useState('2D');

  // Load a design
  const loadDesign = (designId) => {
    const design = getDesignById(designId);
    if (design) {
      setCurrentDesign(design);
      setSelectedFurniture(null);
      return true;
    }
    return false;
  };

  // Create a new design
  const createNewDesign = (designerId) => {
    const newDesign = {
      name: 'Untitled Design',
      createdBy: designerId,
      room: {
        width: 500,
        depth: 400,
        height: 280,
        shape: 'rectangle',
        wallColor: '#F8F8FF',
        floorColor: '#A9A9A9',
        accentColor: '#4682B4',
      },
      furniture: [],
      shadingEnabled: true,
      globalShading: 0.7,
      customShading: []
    };

    setCurrentDesign(newDesign);
    setSelectedFurniture(null);
    return newDesign;
  };

  // Update room properties
  const updateRoom = (roomProperties) => {
    setCurrentDesign(prev => ({
      ...prev,
      room: {
        ...prev.room,
        ...roomProperties
      }
    }));
  };

  // Add furniture to the design
  const addFurniture = (furnitureId, position = { x: 100, y: 100 }) => {
    const furniture = getFurnitureById(furnitureId);
    if (!furniture) return false;

    const newFurnitureItem = {
      id: furniture.id,
      x: position.x,
      y: position.y,
      rotation: 0,
      color: furniture.defaultColor,
      scale: 1
    };

    setCurrentDesign(prev => ({
      ...prev,
      furniture: [...prev.furniture, newFurnitureItem]
    }));

    setSelectedFurniture(newFurnitureItem);
    return true;
  };

  // Update furniture properties
  const updateFurniture = (furnitureIndex, properties) => {
    setCurrentDesign(prev => {
      const updatedFurniture = [...prev.furniture];
      updatedFurniture[furnitureIndex] = {
        ...updatedFurniture[furnitureIndex],
        ...properties
      };

      // Update selected furniture if it's the one being updated
      if (selectedFurniture && updatedFurniture[furnitureIndex].id === selectedFurniture.id) {
        setSelectedFurniture(updatedFurniture[furnitureIndex]);
      }

      return {
        ...prev,
        furniture: updatedFurniture
      };
    });
  };

  // Remove furniture from the design
  const removeFurniture = (furnitureIndex) => {
    setCurrentDesign(prev => {
      const updatedFurniture = [...prev.furniture];
      updatedFurniture.splice(furnitureIndex, 1);
      return {
        ...prev,
        furniture: updatedFurniture
      };
    });

    setSelectedFurniture(null);
  };

  // Update shading properties
  const updateShading = (shadingProperties) => {
    setCurrentDesign(prev => ({
      ...prev,
      ...shadingProperties
    }));
  };

  // Update custom shading for a specific furniture item
  const updateCustomShading = (furnitureId, shadingLevel) => {
    setCurrentDesign(prev => {
      const existingIndex = prev.customShading.findIndex(item => item.furnitureId === furnitureId);
      let updatedCustomShading = [...prev.customShading];

      if (existingIndex !== -1) {
        updatedCustomShading[existingIndex] = {
          ...updatedCustomShading[existingIndex],
          shadingLevel
        };
      } else {
        updatedCustomShading.push({
          furnitureId,
          shadingLevel
        });
      }

      return {
        ...prev,
        customShading: updatedCustomShading
      };
    });
  };

  // Save the current design
  const saveCurrentDesign = (designerId) => {
    const designToSave = {
      ...currentDesign,
      createdBy: designerId
    };

    if (designToSave.id) {
      // Update existing design
      const updated = updateDesign(designToSave.id, designToSave);
      if (updated) {
        setCurrentDesign(updated);
        return updated;
      }
    } else {
      // Save as new design
      const saved = saveDesign(designToSave);
      if (saved) {
        setCurrentDesign(saved);
        return saved;
      }
    }

    return null;
  };

  // Delete the current design
  const deleteCurrentDesign = () => {
    if (currentDesign.id) {
      const deleted = deleteDesign(currentDesign.id);
      if (deleted) {
        createNewDesign(currentDesign.createdBy);
        return true;
      }
    }
    return false;
  };

  const value = {
    currentDesign,
    selectedFurniture,
    viewMode,
    setSelectedFurniture,
    setViewMode,
    loadDesign,
    createNewDesign,
    updateRoom,
    addFurniture,
    updateFurniture,
    removeFurniture,
    updateShading,
    updateCustomShading,
    saveCurrentDesign,
    deleteCurrentDesign
  };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

export default DesignContext;