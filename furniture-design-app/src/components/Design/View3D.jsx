import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';
import CustomizationPanel from '../Customization/CustomizationPanel';

const View3D = () => {
  const containerRef = useRef(null);
  const { 
    currentDesign, 
    selectedFurniture, 
    setSelectedFurniture,
    updateCustomShading 
  } = useDesign();
  
  // Local state for preview shading
  const [previewShadingLevel, setPreviewShadingLevel] = useState(null);
  
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const furnitureObjectsRef = useRef({});
  const selectionHelperRef = useRef(null);

  // INITIAL SETUP
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    
    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(1, 1, 1);
    dirLight.castShadow = true;
    
    // Improve shadow quality
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 2000;
    dirLight.shadow.bias = -0.001;
    
    // Expand shadow camera frustum
    const shadowSize = 1000;
    dirLight.shadow.camera.left = -shadowSize;
    dirLight.shadow.camera.right = shadowSize;
    dirLight.shadow.camera.top = shadowSize;
    dirLight.shadow.camera.bottom = -shadowSize;
    
    scene.add(dirLight);
    
    // Add fill light for better details
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-1, 0.5, -1);
    scene.add(fillLight);
    
    // Add bottom light to illuminate undersides
    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2);
    bottomLight.position.set(0, -1, 0);
    scene.add(bottomLight);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 500, 500);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 100;
    controls.maxDistance = 1000;
    controlsRef.current = controls;

    // Grid
    const grid = new THREE.GridHelper(2000, 20, 0x888888, 0x444444);
    scene.add(grid);

    // Click handler for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onCanvasClick = (event) => {
      // Get mouse position relative to canvas
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      // Get objects that can be intersected (furniture)
      const furnitureObjects = [];
      scene.traverse((obj) => {
        if (obj.userData && obj.userData.type === 'furniture') {
          furnitureObjects.push(obj);
        }
      });
      
      const intersects = raycaster.intersectObjects(furnitureObjects, true);
      
      if (intersects.length > 0) {
        // Find the root furniture object by traversing up the hierarchy
        let targetObj = intersects[0].object;
        while (targetObj.parent && (!targetObj.userData || !targetObj.userData.id)) {
          targetObj = targetObj.parent;
        }
        
        if (targetObj && targetObj.userData && targetObj.userData.id) {
          const furnitureId = targetObj.userData.id;
          const selectedItem = currentDesign.furniture.find(item => item.id === furnitureId);
          setSelectedFurniture(selectedItem || null);
          
          // Update selection helper
          updateSelectionHelper(targetObj);
        }
      } else {
        // Clicked on empty space - deselect
        setSelectedFurniture(null);
        
        // Remove selection helper
        if (selectionHelperRef.current) {
          scene.remove(selectionHelperRef.current);
          selectionHelperRef.current = null;
        }
      }
    };

    renderer.domElement.addEventListener('click', onCanvasClick);

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentDesign, setSelectedFurniture]);

  // Update selection helper function
  const updateSelectionHelper = (targetObject) => {
    const scene = sceneRef.current;
    if (!scene || !targetObject) return;
    
    // Remove existing helper
    if (selectionHelperRef.current) {
      scene.remove(selectionHelperRef.current);
      selectionHelperRef.current = null;
    }
    
    // Create a bounding box for the target object
    const bbox = new THREE.Box3().setFromObject(targetObject);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    
    // Create a subtle highlight plane under the object
    const planeGeometry = new THREE.PlaneGeometry(size.x + 20, size.z + 20);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x2196f3, // Blue
      transparent: true,
      opacity: 0.15,
      depthWrite: false
    });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    
    // Position the plane slightly above the floor
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    plane.position.set(center.x, 0.5, center.z);
    
    // Add to scene
    plane.userData = { type: 'selection-helper', isSelectionHelper: true };
    scene.add(plane);
    selectionHelperRef.current = plane;
  };

  // Function to apply shading to an object
  const applyShading = (object, shadingLevel) => {
    if (!object) return;
    
    object.traverse(child => {
      if (child.isMesh && child.material) {
        // Skip if this is a selection helper
        if (child.userData && (child.userData.type === 'selection-helper' || 
                               child.userData.isSelectionHelper)) {
          return;
        }
        
        // Apply shading by adjusting material properties
        if (child.material.isMeshStandardMaterial || 
            child.material.isMeshPhysicalMaterial) {
          // The shading level works inversely with roughness
          child.material.roughness = 1 - shadingLevel;
          
          // Higher shading = more metallic look
          child.material.metalness = shadingLevel * 0.5;
          
          // Important to tell Three.js that the material needs updating
          child.material.needsUpdate = true;
        }
      }
    });
  };

  // UPDATE SCENE ON DESIGN CHANGE
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;
    const container = containerRef.current;
    if (!scene || !camera || !controls || !renderer || !container) return;
    if (!currentDesign || !currentDesign.room) return;

    // Clear previous furniture references
    furnitureObjectsRef.current = {};
    
    // Remove previous objects
    const toRemove = [];
    scene.traverse(obj => {
      if (obj.userData && (obj.userData.type === 'room' || obj.userData.type === 'furniture' || obj.userData.type === 'selection-helper')) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach(obj => scene.remove(obj));

    const { width: roomW, depth: roomD, height: roomH, wallColor, floorColor } = currentDesign.room;

    // Create room materials
    const wallM = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(wallColor),
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const floorM = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(floorColor),
      roughness: 0.9,
      metalness: 0.1
    });

    // Floor
    const floorG = new THREE.PlaneGeometry(roomW, roomD);
    const floor = new THREE.Mesh(floorG, floorM);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData = { type: 'room', part: 'floor' };
    scene.add(floor);

    // Walls
    const backG = new THREE.PlaneGeometry(roomW, roomH);
    const leftG = new THREE.PlaneGeometry(roomD, roomH);
    const rightG = leftG.clone();
    const backWall = new THREE.Mesh(backG, wallM);
    backWall.position.set(0, roomH / 2, -roomD / 2);
    backWall.receiveShadow = true;
    backWall.userData = { type: 'room', part: 'wall' };
    scene.add(backWall);
    const leftWall = new THREE.Mesh(leftG, wallM);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-roomW / 2, roomH / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.userData = { type: 'room', part: 'wall' };
    scene.add(leftWall);
    const rightWall = new THREE.Mesh(rightG, wallM);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(roomW / 2, roomH / 2, 0);
    rightWall.receiveShadow = true;
    rightWall.userData = { type: 'room', part: 'wall' };
    scene.add(rightWall);

    // Furniture loader & fallback
    const loader = new GLTFLoader();
    currentDesign.furniture.forEach((item, index) => {
      const data = getFurnitureById(item.id);
      if (!data) return;

      const userScale = item.scale || 1;
      let modelOverride = data.modelScale ?? 1;
      // Per-item boost factors for proper sizing
      const boosts = {
        'chair-3': 2.0,
        'table-1': 2.0,
        'sofa-1': 2.0,
        'cabinet-1': 2.0,
        'cabinet-2': 2.0,
        'bed-1': 4.0
      };
      modelOverride *= boosts[item.id] || 1;

      const x = item.x - roomW / 2;
      const z = item.y - roomD / 2;
      const ry = (item.rotation * Math.PI) / 180;

      // Get furniture-specific shading level
      let shadingLevel = currentDesign.globalShading || 0.7; // Default
      
      // Apply saved custom shading if this furniture has it
      if (currentDesign.shadingEnabled && currentDesign.customShading) {
        const customShading = currentDesign.customShading.find(
          s => s.furnitureId === item.id
        );
        if (customShading) {
          shadingLevel = customShading.shadingLevel;
        }
      }

      // Use the furniture's default color for fallback models
      const itemColor = data.defaultColor;

      const addFallback = () => {
        const sx = data.dimensions.width * userScale * modelOverride;
        const sy = data.dimensions.height * userScale * modelOverride;
        const sz = data.dimensions.depth * userScale * modelOverride;
        
        // Create fallback box with material
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(itemColor),
          roughness: 1 - shadingLevel, // Invert for intuitive control
          metalness: shadingLevel * 0.5
        });
        
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(sx, sy, sz),
          material
        );
        mesh.position.set(x, sy / 2, z);
        mesh.rotation.y = ry;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { type: 'furniture', id: item.id };
        scene.add(mesh);
        
        // Store reference for future updates
        furnitureObjectsRef.current[item.id] = mesh;
        
        // If this is the selected furniture, update selection helper
        if (selectedFurniture && selectedFurniture.id === item.id) {
          updateSelectionHelper(mesh);
        }
      };

      if (data.modelUrl) {
        loader.load(
          data.modelUrl,
          gltf => {
            // Clone the scene to avoid modifying the cached model
            const model = gltf.scene.clone();
            
            // Scale the model
            const bbox = new THREE.Box3().setFromObject(model);
            const size = new THREE.Vector3();
            bbox.getSize(size);
            const target = new THREE.Vector3(
              data.dimensions.width * userScale,
              data.dimensions.height * userScale,
              data.dimensions.depth * userScale
            );
            const factor = Math.min(target.x / size.x, target.y / size.y, target.z / size.z);
            model.scale.setScalar(factor * modelOverride);

            // Position horizontally
            model.position.x = x;
            model.position.z = z;
            
            // Align with floor
            const alignedBBox = new THREE.Box3().setFromObject(model);
            
            // Special handling for specific models if needed
            if (item.id === 'bed-1') {
              // Force the bed to sit directly on the floor
              model.position.y = 0;
            } else {
              // For other furniture, ensure bottom is on the floor
              model.position.y = -alignedBBox.min.y;
              
              // Add a small buffer to prevent z-fighting with the floor
              model.position.y += 0.1;
            }

            // Set rotation
            model.rotation.y = ry;
            model.userData = { type: 'furniture', id: item.id };
            
            // Apply shadows and shading to all meshes
            model.traverse(child => {
              if (child.isMesh) {
                // Enable shadows
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Make sure materials respond to lighting
                if (child.material && child.material.isMeshBasicMaterial) {
                  // Convert to MeshStandardMaterial but keep original color
                  const originalColor = child.material.color ? child.material.color.clone() : new THREE.Color(0xCCCCCC);
                  const originalMap = child.material.map;
                  
                  child.material = new THREE.MeshStandardMaterial({
                    color: originalColor,
                    map: originalMap,
                    roughness: 1 - shadingLevel, // Invert for intuitive control
                    metalness: shadingLevel * 0.5
                  });
                } else if (child.material && 
                          (child.material.isMeshStandardMaterial || 
                           child.material.isMeshPhysicalMaterial)) {
                  // For existing standard materials, just adjust properties
                  child.material.roughness = 1 - shadingLevel; // Invert for intuitive control
                  child.material.metalness = shadingLevel * 0.5;
                  child.material.needsUpdate = true;
                }
              }
            });
            
            scene.add(model);
            
            // Store reference for future updates
            furnitureObjectsRef.current[item.id] = model;
            
            // If this is the selected furniture, update selection helper
            if (selectedFurniture && selectedFurniture.id === item.id) {
              updateSelectionHelper(model);
            }
          },
          undefined,
          error => {
            console.error(`Error loading model for ${item.id}:`, error);
            addFallback();
          }
        );
      } else {
        addFallback();
      }
    });

    // Camera reposition
    const maxSize = Math.max(roomW, roomD);
    camera.position.set(0, maxSize * 0.7, maxSize * 1.2);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [currentDesign, selectedFurniture]);

  // Function to handle preview shading
  const handlePreviewShading = (furnitureId, level) => {
    setPreviewShadingLevel({ id: furnitureId, level });
    
    // Apply preview immediately
    const furnitureObj = furnitureObjectsRef.current[furnitureId];
    if (furnitureObj) {
      applyShading(furnitureObj, level);
    }
  };

  // Function to apply and save shading
  const handleApplyShading = (furnitureId, level) => {
    // Save the shading to the context
    updateCustomShading(furnitureId, level);
    
    // Clear preview
    setPreviewShadingLevel(null);
  };

  return (
    <div className="h-full flex">
      <div ref={containerRef} className="flex-1 relative">
        <div className="absolute text-gray-500 top-4 left-4 bg-white bg-opacity-70 p-2 rounded shadow-md text-sm z-10">
          <p>Use mouse to rotate view</p>
          <p>Scroll to zoom in/out</p>
          <p>Click on furniture to select</p>
        </div>
      </div>
      <CustomizationPanel 
        onPreviewShading={handlePreviewShading}
        onApplyShading={handleApplyShading}
      />
    </div>
  );
};

export default View3D;