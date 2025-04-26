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

// Initialize local storage with sample designs if empty
export function initializeDesigns() {
  const existingDesigns = localStorage.getItem(STORAGE_KEY);
  if (!existingDesigns) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleDesigns));
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
  const designs = getAllDesigns();
  const newDesign = {
    ...design,
    id: `design-${Date.now()}`, // Generate a unique ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  designs.push(newDesign);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
  return newDesign;
}

// Update an existing design
export function updateDesign(designId, updatedDesign) {
  const designs = getAllDesigns();
  const index = designs.findIndex(design => design.id === designId);
  
  if (index !== -1) {
    designs[index] = {
      ...designs[index],
      ...updatedDesign,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    return designs[index];
  }
  
  return null;
}

// Delete a design
export function deleteDesign(designId) {
  const designs = getAllDesigns();
  const updatedDesigns = designs.filter(design => design.id !== designId);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
  return true;
}