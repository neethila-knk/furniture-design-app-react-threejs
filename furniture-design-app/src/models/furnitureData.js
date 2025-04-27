// Sample furniture data for the application
export const furnitureCategories = [
  { id: 'chairs', name: 'Chairs' },
  { id: 'tables', name: 'Tables' },
  { id: 'sofas', name: 'Sofas' },
  { id: 'cabinets', name: 'Cabinets' },
  { id: 'beds', name: 'Beds' }
];

export const furnitureItems = [
  // Chairs
  {
    id: 'chair-1',
    name: 'Dining Chair',
    category: 'chairs',
    description: 'Classic wooden dining chair with upholstered seat',
    dimensions: { width: 45, depth: 50, height: 90 }, // in cm
    defaultColor: '#8B4513',
    price: 149.99,
    modelUrl: '/models/dining_chair.glb',     // ← added GLB path
    thumbnail: '/chair-1-thumb.jpg',
    materials: ['Wood', 'Fabric']
  },
  {
    id: 'chair-2',
    name: 'Office Chair',
    category: 'chairs',
    description: 'Ergonomic office chair with adjustable height',
    dimensions: { width: 60, depth: 65, height: 110 },
    defaultColor: '#000000',
    price: 249.99,
    modelUrl: '/models/office_chair.glb', // Make sure this matches your actual file name exactly
    thumbnail: '/chair-2-thumb.jpg',
    materials: ['Metal', 'Mesh', 'Plastic']
  },
  {
    id: 'chair-3',
    name: 'Lounge Chair',
    category: 'chairs',
    description: 'Comfortable lounge chair for relaxing',
    dimensions: { width: 70, depth: 80, height: 85 },
    defaultColor: '#D2B48C',
    price: 349.99,
    modelScale: 1.3,  
    modelUrl: '/models/lounge_chair.glb', // ← added GLB
    thumbnail: '/chair-3-thumb.jpg',
    materials: ['Wood', 'Leather']
  },
  
  // Tables
  {
    id: 'table-1',
    name: 'Dining Table Set',
    category: 'tables',
    description: 'Large dining table for family meals',
    dimensions: { width: 180, depth: 90, height: 75 },
    defaultColor: '#8B4513',
    price: 599.99,
    modelUrl: '/models/simple_dining_table.glb', // ← added GLB
    thumbnail: '/table-1-thumb.jpg',
    materials: ['Wood', 'Metal']
  },
  {
    id: 'table-2',
    name: 'Coffee Table',
    category: 'tables',
    description: 'Modern coffee table with storage',
    dimensions: { width: 120, depth: 60, height: 45 },
    defaultColor: '#5C4033',
    price: 299.99,
    modelUrl: '/models/coffee_table.glb',
    thumbnail: '/table-2-thumb.jpg',
    materials: ['Wood', 'Glass']
  },
  
  // Sofas
  {
    id: 'sofa-1',
    name: '3-Seater Sofa',
    category: 'sofas',
    description: 'Comfortable 3-seater sofa for living room',
    dimensions: { width: 220, depth: 95, height: 85 },
    defaultColor: '#808080',
    price: 999.99,
    modelUrl: '/models/3_seater.glb',
    thumbnail: '/sofa-1-thumb.jpg',
    materials: ['Fabric', 'Wood', 'Foam']
  },

  // Cabinets
  {
    id: 'cabinet-1',
    name: 'Bookshelf',
    category: 'cabinets',
    description: 'Tall bookshelf with adjustable shelves',
    dimensions: { width: 80, depth: 40, height: 200 },
    defaultColor: '#8B4513',
    price: 349.99,
    modelUrl: '/models/bookshelf.glb',
    thumbnail: '/cabinet-1-thumb.jpg',
    materials: ['Wood', 'Metal']
  },
  {
    id: 'cabinet-2',
    name: 'TV Stand',
    category: 'cabinets',
    description: 'Modern TV stand with storage',
    dimensions: { width: 160, depth: 45, height: 55 },
    defaultColor: '#5C4033',
    price: 249.99,
    modelUrl: '/models/tv_stand.glb',
    thumbnail: '/cabinet-2-thumb.jpg',
    materials: ['Wood', 'Glass', 'Metal']
  },
  
  // Beds
  {
    id: 'bed-1',
    name: 'Queen Bed',
    category: 'beds',
    description: 'Queen-sized bed with wooden frame',
    dimensions: { width: 160, depth: 210, height: 45 },
    defaultColor: '#8B4513',
    price: 899.99,
    modelUrl: '/models/bed.glb',
    thumbnail: '/bed-1-thumb.jpg',
    materials: ['Wood']
  }
];

// Common room color schemes
export const colorSchemes = [
  {
    id: 'neutral',
    name: 'Neutral',
    description: 'Warm neutral tones',
    wallColor: '#F5F5DC', // beige
    floorColor: '#D2B48C', // tan
    accentColor: '#8B4513', // saddle brown
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary grays and whites',
    wallColor: '#F8F8FF', // ghost white
    floorColor: '#A9A9A9', // dark gray
    accentColor: '#4682B4', // steel blue
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Warm earthy tones',
    wallColor: '#FFF8DC', // cornsilk
    floorColor: '#8B4513', // saddle brown
    accentColor: '#CD853F', // peru
  },
  {
    id: 'cool',
    name: 'Cool',
    description: 'Cool blues and grays',
    wallColor: '#E0FFFF', // light cyan
    floorColor: '#708090', // slate gray
    accentColor: '#4169E1', // royal blue
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Bold and colorful',
    wallColor: '#FFFFFF', // white
    floorColor: '#2F4F4F', // dark slate gray
    accentColor: '#FF4500', // orange red
  }
];

// Common room types and shapes
export const roomShapes = [
  { id: 'rectangle', name: 'Rectangle', icon: '⬛' },
  { id: 'square', name: 'Square', icon: '🔲' },
  { id: 'l-shaped', name: 'L-Shaped', icon: '⬓' }
];

// Function to get furniture by ID
export const getFurnitureById = (id) => {
  return furnitureItems.find(item => item.id === id);
};

// Function to get furniture by category
export const getFurnitureByCategory = (categoryId) => {
  return furnitureItems.filter(item => item.category === categoryId);
};