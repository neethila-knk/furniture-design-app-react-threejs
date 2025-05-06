import * as THREE from 'three';

/**
 * Utility functions for handling materials and shading in the 3D view
 */

/**
 * Create a standard material with shading effects applied
 * @param {string} color - Hex color string
 * @param {number} shadingLevel - Shading level (0-1) where 1 is full shading
 * @param {Object} options - Additional options for the material
 * @returns {THREE.MeshStandardMaterial} - A Three.js material with shading applied
 */
export const createShadedMaterial = (color, shadingLevel = 0.7, options = {}) => {
  // Calculate roughness and metalness based on shading level
  const roughness = Math.min(0.9, 0.5 + (shadingLevel * 0.5));
  const metalness = Math.min(0.8, shadingLevel * 0.3);
  
  // Default side is FrontSide
  const side = options.doubleSided ? THREE.DoubleSide : THREE.FrontSide;
  
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: roughness,
    metalness: metalness,
    side: side,
    ...options
  });
};

/**
 * Create a selection highlight for an object
 * @param {THREE.Object3D} object - The object to highlight
 * @param {string} color - Highlight color in hex format
 * @returns {THREE.Object3D} - The highlight mesh
 */
export const createSelectionHighlight = (object, color = '#2563EB') => {
  // Create a bounding box for the object
  const bbox = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  
  // Create a wireframe box slightly larger than the object
  const highlightGeo = new THREE.BoxGeometry(
    size.x * 1.05, 
    size.y * 1.05, 
    size.z * 1.05
  );
  
  const highlightMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    wireframe: true,
    transparent: true,
    opacity: 0.8,
    depthTest: false  // Always show highlight on top
  });
  
  const highlight = new THREE.Mesh(highlightGeo, highlightMat);
  
  // Position the highlight at the center of the object
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  highlight.position.copy(center.clone().sub(object.position));
  
  return highlight;
};

/**
 * Update material properties for a room object
 * @param {THREE.Object3D} object - The object to update
 * @param {string} color - New color in hex format
 * @param {number} shadingLevel - Shading level to apply (0-1)
 */
export const updateRoomMaterial = (object, color, shadingLevel = 0.7) => {
  if (!object) return;
  
  object.traverse(child => {
    if (child.isMesh && child.material) {
      // Create a new material to avoid affecting other objects that might share the material
      const isFloor = child.rotation.x < -Math.PI / 4; // Simple heuristic to identify floor
      
      child.material = createShadedMaterial(
        color, 
        shadingLevel, 
        { 
          doubleSided: child.material.side === THREE.DoubleSide,
          roughness: isFloor ? 0.9 : 0.7 // Floors are typically rougher
        }
      );
    }
  });
};

/**
 * Apply custom shading to a specific furniture item without changing its original materials
 * @param {THREE.Object3D} object - The furniture object to update
 * @param {number} shadingLevel - Shading level to apply (0-1)
 */
export const applyFurnitureShading = (object, shadingLevel = 0.7) => {
  if (!object) return;
  
  // Only update the shading parameters without replacing materials
  object.traverse(child => {
    if (child.isMesh && child.material) {
      // Preserve original material but adjust roughness and metalness for shading
      if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
        // For standard materials, just adjust roughness and metalness
        child.material.roughness = Math.min(0.9, 0.5 + (shadingLevel * 0.5));
        child.material.metalness = Math.min(0.8, shadingLevel * 0.3);
        child.material.needsUpdate = true;
      } else {
        // For other material types, we need to convert to MeshStandardMaterial
        // but preserve the original color and textures
        const originalColor = child.material.color ? child.material.color.clone() : new THREE.Color(0xCCCCCC);
        const originalMap = child.material.map;
        
        const newMaterial = new THREE.MeshStandardMaterial({
          color: originalColor,
          map: originalMap,
          roughness: Math.min(0.9, 0.5 + (shadingLevel * 0.5)),
          metalness: Math.min(0.8, shadingLevel * 0.3),
          side: child.material.side
        });
        
        // Copy other textures if they exist
        if (child.material.normalMap) newMaterial.normalMap = child.material.normalMap;
        if (child.material.roughnessMap) newMaterial.roughnessMap = child.material.roughnessMap;
        if (child.material.metalnessMap) newMaterial.metalnessMap = child.material.metalnessMap;
        if (child.material.emissiveMap) {
          newMaterial.emissiveMap = child.material.emissiveMap;
          newMaterial.emissive = child.material.emissive || new THREE.Color(0x000000);
        }
        
        child.material = newMaterial;
      }
    }
  });
};

/**
 * Create a simple placeholder model when a real model isn't available
 * @param {Object} dimensions - Width, height, depth in cm
 * @param {string} color - Hex color string
 * @param {number} shadingLevel - Shading level (0-1)
 * @returns {THREE.Mesh} - A simple box mesh
 */
export const createPlaceholderModel = (dimensions, color, shadingLevel = 0.7) => {
  const { width, height, depth } = dimensions;
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = createShadedMaterial(color, shadingLevel);
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  return mesh;
};

/**
 * Apply global shading settings to all objects in a scene
 * @param {THREE.Scene} scene - The scene to update
 * @param {Object} designData - The current design data with shading settings
 */
export const applyGlobalShading = (scene, designData) => {
  if (!scene || !designData) return;
  
  const isEnabled = designData.shadingEnabled;
  const globalLevel = designData.globalShading || 0.7;
  
  // If shading is disabled, use a neutral level that looks good
  const effectiveGlobalLevel = isEnabled ? globalLevel : 0.5;
  
  // Update room components
  scene.traverse(obj => {
    if (obj.userData && obj.userData.type === 'room') {
      // For room objects, we need to identify if it's a wall or floor
      const isFloor = obj.rotation.x < -Math.PI / 4;
      const color = isFloor ? designData.room.floorColor : designData.room.wallColor;
      
      if (obj.material) {
        obj.material = createShadedMaterial(
          color,
          effectiveGlobalLevel,
          { 
            doubleSided: obj.material.side === THREE.DoubleSide,
            roughness: isFloor ? 0.9 : 0.7
          }
        );
      }
    } else if (obj.userData && obj.userData.type === 'furniture') {
      // For furniture, check for custom shading
      let itemShadingLevel = effectiveGlobalLevel;
      
      if (isEnabled && designData.customShading) {
        const customShading = designData.customShading.find(
          s => s.furnitureId === obj.userData.id
        );
        
        if (customShading) {
          itemShadingLevel = customShading.shadingLevel;
        }
      }
      
      applyFurnitureShading(obj, itemShadingLevel);
    }
  });
};

export default {
  createShadedMaterial,
  createSelectionHighlight,
  updateRoomMaterial,
  applyFurnitureShading,
  createPlaceholderModel,
  applyGlobalShading
};