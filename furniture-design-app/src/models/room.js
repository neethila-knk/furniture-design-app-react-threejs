// Room shape templates and color palettes
export const roomShapes = [
    {
      id: 'rectangular',
      name: 'Rectangular',
      description: 'A standard rectangular room',
      dimensions: ['width', 'length', 'height']
    },
    {
      id: 'l-shaped',
      name: 'L-Shaped',
      description: 'An L-shaped room with an additional dimension',
      dimensions: ['width', 'length', 'height', 'alcoveWidth', 'alcoveLength']
    },
    {
      id: 'square',
      name: 'Square',
      description: 'A square room with equal width and length',
      dimensions: ['size', 'height']
    },
    {
      id: 'irregular',
      name: 'Irregular',
      description: 'An irregular shaped room, defined by corner coordinates',
      dimensions: ['height', 'corners']
    }
  ];
  
  // Predefined color schemes for rooms
  export const colorSchemes = [
    {
      id: 'neutral',
      name: 'Neutral',
      description: 'Soft, neutral tones that work with any furniture',
      colors: {
        wall: '#F5F5F5',
        floor: '#D2B48C',
        ceiling: '#FFFFFF',
        trim: '#E8E8E8'
      }
    },
    {
      id: 'warm',
      name: 'Warm',
      description: 'Warm, inviting colors that create a cozy atmosphere',
      colors: {
        wall: '#FFF8E1',
        floor: '#8B4513',
        ceiling: '#FFFAF0',
        trim: '#D2B48C'
      }
    },
    {
      id: 'cool',
      name: 'Cool',
      description: 'Cool, calming colors for a serene environment',
      colors: {
        wall: '#E0F7FA',
        floor: '#607D8B',
        ceiling: '#F5F5F5',
        trim: '#B0BEC5'
      }
    },
    {
      id: 'bold',
      name: 'Bold',
      description: 'Bold, dramatic colors for a statement room',
      colors: {
        wall: '#263238',
        floor: '#212121',
        ceiling: '#FFFFFF',
        trim: '#CFD8DC'
      }
    },
    {
      id: 'pastel',
      name: 'Pastel',
      description: 'Soft, pastel colors for a light and airy feel',
      colors: {
        wall: '#E1F5FE',
        floor: '#DCEDC8',
        ceiling: '#F3E5F5',
        trim: '#FFF9C4'
      }
    }
  ];
  
  // Floor materials
  export const floorMaterials = [
    {
      id: 'hardwood',
      name: 'Hardwood',
      description: 'Classic hardwood flooring',
      texture: '/api/placeholder/200/200',
      defaultColor: '#8B4513'
    },
    {
      id: 'carpet',
      name: 'Carpet',
      description: 'Soft carpet flooring',
      texture: '/api/placeholder/200/200',
      defaultColor: '#A9A9A9'
    },
    {
      id: 'tile',
      name: 'Tile',
      description: 'Ceramic tile flooring',
      texture: '/api/placeholder/200/200',
      defaultColor: '#D3D3D3'
    },
    {
      id: 'laminate',
      name: 'Laminate',
      description: 'Durable laminate flooring',
      texture: '/api/placeholder/200/200',
      defaultColor: '#DEB887'
    },
    {
      id: 'concrete',
      name: 'Concrete',
      description: 'Modern concrete flooring',
      texture: '/api/placeholder/200/200',
      defaultColor: '#808080'
    }
  ];
  
  // Wall materials
  export const wallMaterials = [
    {
      id: 'paint',
      name: 'Paint',
      description: 'Standard painted walls',
      texture: '/api/placeholder/200/200',
      defaultColor: '#F5F5F5'
    },
    {
      id: 'wallpaper',
      name: 'Wallpaper',
      description: 'Decorative wallpapered walls',
      texture: '/api/placeholder/200/200',
      defaultColor: '#FFF8DC'
    },
    {
      id: 'wood-paneling',
      name: 'Wood Paneling',
      description: 'Wood panel walls',
      texture: '/api/placeholder/200/200',
      defaultColor: '#CD853F'
    },
    {
      id: 'brick',
      name: 'Brick',
      description: 'Exposed brick walls',
      texture: '/api/placeholder/200/200',
      defaultColor: '#BC8F8F'
    },
    {
      id: 'stone',
      name: 'Stone',
      description: 'Natural stone walls',
      texture: '/api/placeholder/200/200',
      defaultColor: '#696969'
    }
  ];
  
  // Function to get a room shape by ID
  export const getRoomShapeById = (id) => {
    return roomShapes.find(shape => shape.id === id);
  };
  
  // Function to get a color scheme by ID
  export const getColorSchemeById = (id) => {
    return colorSchemes.find(scheme => scheme.id === id);
  };
  
  // Function to get a floor material by ID
  export const getFloorMaterialById = (id) => {
    return floorMaterials.find(material => material.id === id);
  };
  
  // Function to get a wall material by ID
  export const getWallMaterialById = (id) => {
    return wallMaterials.find(material => material.id === id);
  };
  
  // Function to create a room configuration
  export const createRoomConfiguration = (shapeId, dimensions, colorSchemeId, floorMaterialId, wallMaterialId, customColors = {}) => {
    const shape = getRoomShapeById(shapeId);
    const colorScheme = getColorSchemeById(colorSchemeId);
    const floorMaterial = getFloorMaterialById(floorMaterialId);
    const wallMaterial = getWallMaterialById(wallMaterialId);
    
    if (!shape || !colorScheme || !floorMaterial || !wallMaterial) {
      return null;
    }
    
    return {
      shape: shapeId,
      dimensions,
      colorScheme: colorSchemeId,
      floorMaterial: floorMaterialId,
      wallMaterial: wallMaterialId,
      colors: {
        ...colorScheme.colors,
        ...customColors
      }
    };
  };
  
  // Default room configurations
  export const defaultRoomConfigurations = [
    {
      id: 'living-room',
      name: 'Living Room',
      shape: 'rectangular',
      dimensions: {
        width: 5,
        length: 7,
        height: 2.8
      },
      colorScheme: 'neutral',
      floorMaterial: 'hardwood',
      wallMaterial: 'paint'
    },
    {
      id: 'dining-room',
      name: 'Dining Room',
      shape: 'rectangular',
      dimensions: {
        width: 4,
        length: 5,
        height: 2.5
      },
      colorScheme: 'warm',
      floorMaterial: 'hardwood',
      wallMaterial: 'paint'
    },
    {
      id: 'bedroom',
      name: 'Bedroom',
      shape: 'rectangular',
      dimensions: {
        width: 4,
        length: 5,
        height: 2.4
      },
      colorScheme: 'pastel',
      floorMaterial: 'carpet',
      wallMaterial: 'paint'
    },
    {
      id: 'office',
      name: 'Home Office',
      shape: 'square',
      dimensions: {
        size: 3.5,
        height: 2.4
      },
      colorScheme: 'cool',
      floorMaterial: 'hardwood',
      wallMaterial: 'paint'
    }
  ];
  
  // Function to get a default room configuration by ID
  export const getDefaultRoomConfigurationById = (id) => {
    return defaultRoomConfigurations.find(config => config.id === id);
  };
  
  export default {
    roomShapes,
    colorSchemes,
    floorMaterials,
    wallMaterials,
    defaultRoomConfigurations
  };