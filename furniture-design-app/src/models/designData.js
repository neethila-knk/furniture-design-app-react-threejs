// models/designData.js - FIXED VERSION
// Added explicit handling for name updates

// Sample saved designs data
export const sampleDesigns = [
  {
    id: 'design-1',
    name: 'Modern Living Room',
    createdBy: 1, // designer ID
    createdAt: '2025-04-10T14:30:00',
    updatedAt: '2025-04-12T09:15:00',
    room: {
      width: 500, // in cm
      depth: 400, // in cm
      height: 280, // in cm
      shape: 'rectangle',
      wallColor: '#F8F8FF', // ghost white
      floorColor: '#A9A9A9', // dark gray
      accentColor: '#4682B4', // steel blue
    },
    furniture: [
      {
        id: 'sofa-1',
        x: 70, // position in cm from left wall
        y: 250, // position in cm from bottom wall
        rotation: 0, // rotation in degrees
        color: '#808080', // custom color (if changed from default)
        scale: 1, // scale factor (1 = original size)
      },
      {
        id: 'table-2',
        x: 200,
        y: 170,
        rotation: 0,
        color: '#5C4033',
        scale: 1,
      },
      {
        id: 'chair-3',
        x: 320,
        y: 180,
        rotation: 45,
        color: '#D2B48C',
        scale: 1,
      },
      {
        id: 'cabinet-2',
        x: 400,
        y: 250,
        rotation: 0,
        color: '#5C4033',
        scale: 1,
      }
    ],
    shadingEnabled: true,
    globalShading: 0.7, // 0 to 1, where 1 is full shading
    customShading: [
      {
        furnitureId: 'chair-3',
        shadingLevel: 0.9
      }
    ]
  },
  {
    id: 'design-2',
    name: 'Dining Room Setup',
    createdBy: 1,
    createdAt: '2025-04-15T11:20:00',
    updatedAt: '2025-04-15T11:20:00',
    room: {
      width: 400,
      depth: 400,
      height: 280,
      shape: 'square',
      wallColor: '#FFF8DC', // cornsilk
      floorColor: '#8B4513', // saddle brown
      accentColor: '#CD853F', // peru
    },
    furniture: [
      {
        id: 'table-1',
        x: 200,
        y: 200,
        rotation: 0,
        color: '#8B4513',
        scale: 1,
      },
      {
        id: 'chair-1',
        x: 150,
        y: 150,
        rotation: 0,
        color: '#8B4513',
        scale: 1,
      },
      {
        id: 'chair-1',
        x: 250,
        y: 150,
        rotation: 0,
        color: '#8B4513',
        scale: 1,
      },
      {
        id: 'chair-1',
        x: 150,
        y: 250,
        rotation: 180,
        color: '#8B4513',
        scale: 1,
      },
      {
        id: 'chair-1',
        x: 250,
        y: 250,
        rotation: 180,
        color: '#8B4513',
        scale: 1,
      },
      {
        id: 'cabinet-1',
        x: 350,
        y: 80,
        rotation: 0,
        color: '#8B4513',
        scale: 1,
      }
    ],
    shadingEnabled: true,
    globalShading: 0.6,
    customShading: []
  }
];

// Local storage functions to simulate backend operations
const STORAGE_KEY = 'furniture_designs';

// Helper function to log operations for debugging
const logOperation = (operation, data) => {
  console.log(`[DesignData] ${operation}:`, data);
};

// Initialize local storage with sample designs if empty
export function initializeDesigns() {
  const existingDesigns = localStorage.getItem(STORAGE_KEY);
  if (!existingDesigns) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleDesigns));
    logOperation('Initialized designs', sampleDesigns);
  }
}

// Get all designs
export function getAllDesigns() {
  const designs = localStorage.getItem(STORAGE_KEY);
  return designs ? JSON.parse(designs) : [];
}

// Get designs by designer ID
export function getDesignsByDesigner(designerId) {
  const designs = getAllDesigns();
  return designs.filter(design => design.createdBy === designerId);
}

// Get a specific design by ID
export function getDesignById(designId) {
  const designs = getAllDesigns();
  return designs.find(design => design.id === designId);
}

// Save a new design
export function saveDesign(design) {
  logOperation('Saving new design', design);
  
  const designs = getAllDesigns();
  const newDesign = {
    ...design,
    id: `design-${Date.now()}`, // Generate a unique ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Ensure a valid name is set
  if (!newDesign.name || newDesign.name.trim() === '') {
    newDesign.name = 'Untitled Design';
  }
  
  logOperation('New design to save', newDesign);
  
  designs.push(newDesign);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  return newDesign;
}

// Update an existing design
export function updateDesign(designId, updatedDesign) {
  logOperation('Updating design', { designId, updatedDesign });
  
  const designs = getAllDesigns();
  const index = designs.findIndex(design => design.id === designId);
  
  if (index !== -1) {
    // Create a new object for the updated design
    const updatedDesignObject = {
      ...designs[index],
      updatedAt: new Date().toISOString()
    };
    
    // Explicitly handle the name property to ensure it's preserved
    if (updatedDesign.name !== undefined) {
      updatedDesignObject.name = updatedDesign.name;
      logOperation('Updating name to', updatedDesign.name);
    }
    
    // Handle room properties
    if (updatedDesign.room) {
      updatedDesignObject.room = {
        ...updatedDesignObject.room,
        ...updatedDesign.room
      };
    }
    
    // Handle furniture array
    if (updatedDesign.furniture) {
      updatedDesignObject.furniture = updatedDesign.furniture;
    }
    
    // Handle shading properties
    if (updatedDesign.shadingEnabled !== undefined) {
      updatedDesignObject.shadingEnabled = updatedDesign.shadingEnabled;
    }
    
    if (updatedDesign.globalShading !== undefined) {
      updatedDesignObject.globalShading = updatedDesign.globalShading;
    }
    
    if (updatedDesign.customShading) {
      updatedDesignObject.customShading = updatedDesign.customShading;
    }
    
    // Handle global texture properties
    if (updatedDesign.globalTextureId !== undefined) {
      updatedDesignObject.globalTextureId = updatedDesign.globalTextureId;
    }
    
    if (updatedDesign.globalTextureColor !== undefined) {
      updatedDesignObject.globalTextureColor = updatedDesign.globalTextureColor;
    }
    
    if (updatedDesign.globalTexturePath !== undefined) {
      updatedDesignObject.globalTexturePath = updatedDesign.globalTexturePath;
    }
    
    // Handle custom textures array
    if (updatedDesign.customTextures) {
      updatedDesignObject.customTextures = updatedDesign.customTextures;
    }
    
    if (updatedDesign.createdBy) {
      updatedDesignObject.createdBy = updatedDesign.createdBy;
    }
    
    designs[index] = updatedDesignObject;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    
    logOperation('Updated design', updatedDesignObject);
    return updatedDesignObject;
  }
  
  logOperation('Design not found for update', designId);
  return null;
}

// Rename a design (dedicated function for renaming)
export function renameDesign(designId, newName) {
  logOperation('Renaming design', { designId, newName });
  
  if (!newName || newName.trim() === '') {
    logOperation('Invalid name for rename', newName);
    return null;
  }
  
  const designs = getAllDesigns();
  const index = designs.findIndex(design => design.id === designId);
  
  if (index !== -1) {
    const updatedDesign = {
      ...designs[index],
      name: newName.trim(),
      updatedAt: new Date().toISOString()
    };
    
    designs[index] = updatedDesign;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    
    logOperation('Design renamed', updatedDesign);
    return updatedDesign;
  }
  
  logOperation('Design not found for rename', designId);
  return null;
}

// Delete a design
export function deleteDesign(designId) {
  logOperation('Deleting design', designId);
  
  const designs = getAllDesigns();
  const updatedDesigns = designs.filter(design => design.id !== designId);
  
  if (updatedDesigns.length < designs.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
    logOperation('Design deleted', designId);
    return true;
  }
  
  logOperation('Design not found for deletion', designId);
  return false;
}