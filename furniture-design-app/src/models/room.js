/* src/models/room.js
 * Central place for room‑related constants and helpers.
 * Includes six pre‑configured room types, colour schemes, materials, etc.
 */

/* ───────────────────────── 1. PRE‑MADE ROOM TYPES ───────────────────────── */
/* Coordinates x / y for furniture are in centimetres measured from
   the left and bottom walls (same convention Canvas2D and View3D use). */

   export const roomTypes = [
    {
      id: 'kitchen',
      name: 'Kitchen',
      icon: '🍳',
      /* geometric defaults */
      shape: 'rectangular',
      width: 350,
      depth: 300,
      height: 260,
      /* colours */
      wallColor: '#FFF8E1',
      floorColor: '#D2B48C',
      accentColor: '#FFB300',
      /* starting furniture */
      defaultFurniture: [
        { id: 'table-1',  x: 175, y: 150 },
        { id: 'chair-1',  x: 110, y:  90 },
        { id: 'chair-1',  x: 240, y:  90 },
        { id: 'cabinet-2', x: 300, y: 260 },   // counter
      ],
    },
  
    {
      id: 'bedroom',
      name: 'Bedroom',
      icon: '🛏️',
      shape: 'rectangular',
      width: 420,
      depth: 350,
      height: 250,
      wallColor: '#E1F5FE',
      floorColor: '#DCEDC8',
      accentColor: '#F06292',
      defaultFurniture: [
        { id: 'bed-1',    x: 210, y: 140 },
        { id: 'cabinet-1',x:  60, y: 290 },
      ],
    },
  
    {
      id: 'living-room',
      name: 'Living Room',
      icon: '🛋️',
      shape: 'rectangular',
      width: 500,
      depth: 400,
      height: 280,
      wallColor: '#F5F5F5',
      floorColor: '#D2B48C',
      accentColor: '#FF7043',
      defaultFurniture: [
        { id: 'sofa-1',   x: 110, y: 100 },
        { id: 'table-2',  x: 250, y: 120 },
        { id: 'cabinet-2',x: 400, y: 350 },
      ],
    },
  
    {
      id: 'office',
      name: 'Office',
      icon: '💻',
      shape: 'square',
      width: 350,
      depth: 350,
      height: 250,
      wallColor: '#E0F7FA',
      floorColor: '#607D8B',
      accentColor: '#29B6F6',
      defaultFurniture: [
        { id: 'table-1',  x: 175, y: 175 },
        { id: 'chair-2',  x: 175, y: 115 },
        { id: 'cabinet-1',x:  60, y: 300 },
      ],
    },
  
    {
      id: 'dining-room',
      name: 'Dining Room',
      icon: '🍽️',
      shape: 'rectangular',
      width: 450,
      depth: 350,
      height: 260,
      wallColor: '#FFF8E1',
      floorColor: '#8B4513',
      accentColor: '#D84315',
      defaultFurniture: [
        { id: 'table-1',  x: 225, y: 175 },
        { id: 'chair-1',  x: 160, y: 115 },
        { id: 'chair-1',  x: 290, y: 115 },
        { id: 'chair-1',  x: 160, y: 235 },
        { id: 'chair-1',  x: 290, y: 235 },
      ],
    },
  
    {
      id: 'guest-room',
      name: 'Guest Room',
      icon: '🛌',
      shape: 'rectangular',
      width: 400,
      depth: 320,
      height: 250,
      wallColor: '#E1F5FE',
      floorColor: '#CFD8DC',
      accentColor: '#81C784',
      defaultFurniture: [
        { id: 'bed-1',    x: 200, y: 140 },
        { id: 'cabinet-1',x: 330, y: 270 },
      ],
    },
  ];
  
  /* ───────────────────────── 2. COLOUR SCHEMES ───────────────────────── */
  export const colorSchemes = [
    {
      id: 'neutral',
      name: 'Neutral',
      description: 'Soft, neutral tones',
      colors: {
        wall:   '#F5F5F5',
        floor:  '#D2B48C',
        ceiling:'#FFFFFF',
        trim:   '#E8E8E8',
      },
    },
    {
      id: 'warm',
      name: 'Warm',
      description: 'Warm, inviting colours',
      colors: {
        wall:   '#FFF8E1',
        floor:  '#8B4513',
        ceiling:'#FFFAF0',
        trim:   '#D2B48C',
      },
    },
    {
      id: 'cool',
      name: 'Cool',
      description: 'Cool, calming palette',
      colors: {
        wall:   '#E0F7FA',
        floor:  '#607D8B',
        ceiling:'#F5F5F5',
        trim:   '#B0BEC5',
      },
    },
    {
      id: 'bold',
      name: 'Bold',
      description: 'Dramatic dark palette',
      colors: {
        wall:   '#263238',
        floor:  '#212121',
        ceiling:'#FFFFFF',
        trim:   '#CFD8DC',
      },
    },
    {
      id: 'pastel',
      name: 'Pastel',
      description: 'Light airy pastels',
      colors: {
        wall:   '#E1F5FE',
        floor:  '#DCEDC8',
        ceiling:'#F3E5F5',
        trim:   '#FFF9C4',
      },
    },
  ];
  
  /* ───────────────────────── 3. FLOOR & WALL MATERIALS ───────────────────────── */
  export const floorMaterials = [
    { id:'hardwood', name:'Hardwood',  texture:'/api/placeholder/200/200', defaultColor:'#8B4513' },
    { id:'carpet',   name:'Carpet',    texture:'/api/placeholder/200/200', defaultColor:'#A9A9A9' },
    { id:'tile',     name:'Tile',      texture:'/api/placeholder/200/200', defaultColor:'#D3D3D3' },
    { id:'laminate', name:'Laminate',  texture:'/api/placeholder/200/200', defaultColor:'#DEB887' },
    { id:'concrete', name:'Concrete',  texture:'/api/placeholder/200/200', defaultColor:'#808080' },
  ];
  
  export const wallMaterials = [
    { id:'paint',        name:'Paint',         texture:'/api/placeholder/200/200', defaultColor:'#F5F5F5' },
    { id:'wallpaper',    name:'Wallpaper',     texture:'/api/placeholder/200/200', defaultColor:'#FFF8DC' },
    { id:'wood-panel',   name:'Wood Panel',    texture:'/api/placeholder/200/200', defaultColor:'#CD853F' },
    { id:'brick',        name:'Brick',         texture:'/api/placeholder/200/200', defaultColor:'#BC8F8F' },
    { id:'stone',        name:'Stone',         texture:'/api/placeholder/200/200', defaultColor:'#696969' },
  ];
  
  /* ───────────────────────── 4. SIMPLE HELPERS ───────────────────────── */
  export const getRoomTypeById       = (id) => roomTypes.find(r => r.id === id);
  export const getColorSchemeById    = (id) => colorSchemes.find(c => c.id === id);
  export const getFloorMaterialById  = (id) => floorMaterials.find(m => m.id === id);
  export const getWallMaterialById   = (id) => wallMaterials.find(m => m.id === id);
  
  /* Create a room configuration quickly from IDs */
  export const createRoomConfiguration = (
    typeId,
    colourSchemeId     = 'neutral',
    floorMaterialId    = 'hardwood',
    wallMaterialId     = 'paint',
    customColors       = {}
  ) => {
    const t   = getRoomTypeById(typeId);
    const col = getColorSchemeById(colourSchemeId);
    const fl  = getFloorMaterialById(floorMaterialId);
    const wl  = getWallMaterialById(wallMaterialId);
  
    if (!t || !col || !fl || !wl) return null;
  
    return {
      ...t,
      colorScheme: colourSchemeId,
      floorMaterial: floorMaterialId,
      wallMaterial: wallMaterialId,
      colors: { ...col.colors, ...customColors },
    };
  };
  
  /* ───────────────────────── default export (optional) ───────────────────────── */
  export default {
    roomTypes,
    colorSchemes,
    floorMaterials,
    wallMaterials,
  };
  