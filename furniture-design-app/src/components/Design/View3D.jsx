import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';
import CustomizationPanel from '../Customization/CustomizationPanel';
import { availableTextures } from '../Customization/TextureSelector';


const View3D = () => {
  const containerRef = useRef(null);
  const {
    currentDesign,
    selectedFurniture,
    setSelectedFurniture,
    updateCustomShading,
    updateFurnitureTexture,
    updateGlobalTexture
  } = useDesign();

  // Local state for previews
  const [previewShadingValue, setPreviewShadingValue] = useState(null);
  const [previewTextureValue, setPreviewTextureValue] = useState(null);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const furnitureObjectsRef = useRef({});
  const selectionHelperRef = useRef(null);
  const textureLoadersRef = useRef({});
  const forceGlobalTextureRef = useRef(false);

  // Keep track of applied materials for easy restoration
  const originalMaterialsRef = useRef({});

  // ─────────────────────────────────────────────────────────────────────────────
  // INITIAL SETUP  – create scene, renderer, lights, controls, HDR, listeners
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* current room size (fallbacks so the first mount never crashes) */
    const { width: roomW = 800, depth: roomD = 800, height: roomH = 300 } =
      currentDesign?.room ?? {};

    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    /* ‑‑‑ Scene -------------------------------------------------------------- */
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    /* ‑‑‑ Ambient / hemi light ---------------------------------------------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.3));

    /* ‑‑‑ Key directional light (casts shadows) ----------------------------- */
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);        // softer
    dirLight.position.set(roomW * 0.3, roomH * 1.6, roomD * 0.3);
    dirLight.castShadow = true;

    /* high‑quality shadow map */
    dirLight.shadow.mapSize.set(2048, 2048);

    /* tighter orthographic frustum around the room */
    const s = Math.max(roomW, roomD) * 0.6;
    Object.assign(dirLight.shadow.camera, {
      left: -s,
      right: s,
      top: s,
      bottom: -s,
      near: 1,
      far: roomH * 4
    });
    dirLight.shadow.bias = -0.0008;          // lower acne without Peter‑panning

    /* light must “look at” something */
    dirLight.target.position.set(0, 0, 0);
    scene.add(dirLight.target);
    scene.add(dirLight);

    /* fill & bounce lights (no shadows) */
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-1, 0.5, -1);
    scene.add(fillLight);

    const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2);
    bottomLight.position.set(0, -1, 0);
    scene.add(bottomLight);

    /* ‑‑‑ Camera ------------------------------------------------------------- */
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 500, 500);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    /* ‑‑‑ Renderer (shadow + quality tweaks) --------------------------------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;   // soft PCF filter
    renderer.logarithmicDepthBuffer = true;                // helps z‑fighting
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    /* ‑‑‑ Orbit controls ----------------------------------------------------- */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 100;
    controls.maxDistance = 1000;
    controlsRef.current = controls;

    /* ‑‑‑ Helper grid (pushed below the floor) ------------------------------ */
    const grid = new THREE.GridHelper(2000, 20, 0x888888, 0x444444);
    grid.position.y = -0.5;          // avoid z‑fight with new 1‑unit floor box
    grid.material.opacity = 0.4;
    grid.material.transparent = true;
    scene.add(grid);

    /* ‑‑‑ HDRI environment map (try /hdr/empty_warehouse_01.hdr) ------------- */
    (() => {
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();

      new RGBELoader()
        .setPath('/hdr/')
        .load(
          'empty_warehouse_01.hdr',
          (hdr) => {
            scene.environment = pmrem.fromEquirectangular(hdr).texture;
            hdr.dispose();
            pmrem.dispose();
          },
          undefined,
          (err) => console.warn('[View3D] HDR load failed:', err.message)
        );
    })();

    /* ‑‑‑ Mouse‑picking handler -------------------------------------------- */
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onCanvasClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const pickables = [];
      scene.traverse((o) => o.userData?.type === 'furniture' && pickables.push(o));
      const hit = raycaster.intersectObjects(pickables, true)[0];

      if (hit) {
        let root = hit.object;
        while (root.parent && !root.userData?.id) root = root.parent;
        const sel = currentDesign.furniture.find(f => f.id === root.userData.id);
        setSelectedFurniture(sel ?? null);
        updateSelectionHelper(root);
      } else {
        setSelectedFurniture(null);
        if (selectionHelperRef.current) {
          scene.remove(selectionHelperRef.current);
          selectionHelperRef.current = null;
        }
      }
    };
    renderer.domElement.addEventListener('click', onCanvasClick);

    /* ‑‑‑ Resize listener & animation loop ---------------------------------- */
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    /* ‑‑‑ Cleanup ----------------------------------------------------------- */
    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('click', onCanvasClick);
      container.removeChild(renderer.domElement);
    };
  }, [currentDesign, setSelectedFurniture]);


  // Update selection helper function
  const updateSelectionHelper = useCallback((targetObject) => {
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
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -1
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
  }, []);

  // Function to apply shading to an object
  const applyShading = useCallback((object, shadingLevel) => {
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
  }, []);

  // Function to load a texture
  const loadTexture = useCallback((texturePath) => {
    if (!texturePath) return null;

    // Check if we already have this texture loaded
    if (textureLoadersRef.current[texturePath]) {
      return textureLoadersRef.current[texturePath];
    }

    // Load new texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(texturePath);

    // Configure texture
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    // Add improved texture filtering
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    if (rendererRef.current) {
      texture.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
    }

    // Store for reuse
    textureLoadersRef.current[texturePath] = texture;

    return texture;
  }, []);

  // Function to apply texture to an object
  const applyTexture = useCallback((object, textureObj) => {
    if (!object || !textureObj) return;

    const texture = loadTexture(textureObj.path);
    if (!texture) return;

    // Store original materials if not already stored
    if (!originalMaterialsRef.current[object.uuid]) {
      const originals = {};
      object.traverse(child => {
        if (child.isMesh && child.material) {
          // Store original material for restoration
          originals[child.uuid] = child.material.clone();
        }
      });
      originalMaterialsRef.current[object.uuid] = originals;
    }

    // Apply texture to all meshes in the object
    object.traverse(child => {
      if (child.isMesh && child.material) {
        // Skip selection helpers
        if (child.userData && (child.userData.type === 'selection-helper' ||
          child.userData.isSelectionHelper)) {
          return;
        }

        // Create new material with the texture
        let newMaterial;

        // Get the texture color (if available) or use white as default
        const materialColor = textureObj.color ? new THREE.Color(textureObj.color) : new THREE.Color(0xFFFFFF);

        if (child.material.isMeshStandardMaterial ||
          child.material.isMeshPhysicalMaterial) {
          newMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            color: materialColor, // Use the texture's color
            roughness: child.material.roughness,
            metalness: child.material.metalness
          });
        } else {
          // Fallback for other material types
          newMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            color: materialColor, // Use the texture's color
            roughness: 0.7,
            metalness: 0.3
          });
        }

        // Apply the new material
        child.material = newMaterial;
        child.material.needsUpdate = true;
      }
    });
  }, [loadTexture]);

  // Function to restore original materials
  const restoreOriginalMaterials = useCallback((object) => {
    if (!object || !originalMaterialsRef.current[object.uuid]) return;

    const originals = originalMaterialsRef.current[object.uuid];

    object.traverse(child => {
      if (child.isMesh && originals[child.uuid]) {
        child.material = originals[child.uuid].clone();
        child.material.needsUpdate = true;
      }
    });
  }, []);

  // UPDATE SCENE ON DESIGN CHANGE
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;
    const container = containerRef.current;
    if (!scene || !camera || !controls || !renderer || !container) return;
    if (!currentDesign || !currentDesign.room) return;

    const forceGlobalTexture = forceGlobalTextureRef.current;
    forceGlobalTextureRef.current = false;

    // Clear previous furniture references
    furnitureObjectsRef.current = {};

    // Reset texture loaders
    textureLoadersRef.current = {};

    // Reset original materials
    originalMaterialsRef.current = {};

    // Remove previous objects
    const toRemove = [];
    scene.traverse(obj => {
      if (obj.userData && (obj.userData.type === 'room' || obj.userData.type === 'furniture' || obj.userData.type === 'selection-helper')) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach(obj => scene.remove(obj));

    const { width: roomW, depth: roomD, height: roomH, wallColor, floorColor } = currentDesign.room;

    // Texture loading for PBR materials
    const texLoader = new THREE.TextureLoader();

    // Wall textures (you'll need to add these texture files to your project)
    const wallColorTex = texLoader.load('/textures/wall/plaster_albedo.jpg');

    const wallNormal = texLoader.load('/textures/wall/plaster_normal.jpg');
    const wallRoughness = texLoader.load('/textures/wall/plaster_roughness.jpg');

    // Floor textures
    const floorColorTex = texLoader.load('/textures/floor/wood_albedo.jpg');
    const floorNormal = texLoader.load('/textures/floor/wood_normal.jpg');
    const floorRoughness = texLoader.load('/textures/floor/wood_roughness.jpg');

    // Correct colour-space & filtering for ALL textures
    floorColorTex.encoding = THREE.sRGBEncoding;

    // Apply high-quality texture filtering to ALL textures to fix flickering
    [wallColorTex, wallNormal, wallRoughness, floorColorTex, floorNormal, floorRoughness].forEach(t => {
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      t.needsUpdate = true;
    });

    // Set texture repeats to scale properly
    [wallColorTex, wallNormal, wallRoughness].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(roomW / 100, roomH / 100); // 1 repeat per meter
    });

    [floorColorTex, floorNormal, floorRoughness].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(roomW / 50, roomD / 50); // 1 repeat per 0.5 m
    });

    // Create room materials with PBR textures
    const wallM = new THREE.MeshStandardMaterial({
      map: wallColorTex,
      normalMap: wallNormal,
      roughnessMap: wallRoughness,
      color: new THREE.Color(wallColor),
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.1
    });

    const floorM = new THREE.MeshStandardMaterial({
      map: floorColorTex,
      normalMap: floorNormal,
      roughnessMap: floorRoughness,
      color: new THREE.Color(floorColor),
      roughness: 0.9,
      metalness: 0.1
    });

    // Wall thickness parameter
    const wallThickness = 10; // cm → 0.1 m in world units

    // Floor - use BoxGeometry for more stability
    const floorG = new THREE.BoxGeometry(roomW, 1, roomD); // 1 unit thickness
    const floor = new THREE.Mesh(floorG, floorM);
    floor.position.y = -0.5; // Half the thickness
    floor.receiveShadow = true;
    floor.userData = { type: 'room', part: 'floor' };
    scene.add(floor);

    // Back wall (now using BoxGeometry for thickness)
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(roomW, roomH, wallThickness),
      wallM
    );
    backWall.position.set(0, roomH / 2, -roomD / 2 - wallThickness / 2);
    backWall.receiveShadow = true;
    backWall.userData = { type: 'room', part: 'wall' };
    scene.add(backWall);

    // Left wall (now using BoxGeometry for thickness)
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, roomH, roomD),
      wallM
    );
    leftWall.position.set(-roomW / 2 - wallThickness / 2, roomH / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.userData = { type: 'room', part: 'wall' };
    scene.add(leftWall);

    // Right wall (now using BoxGeometry for thickness)
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, roomH, roomD),
      wallM
    );
    rightWall.position.set(roomW / 2 + wallThickness / 2, roomH / 2, 0);
    rightWall.receiveShadow = true;
    rightWall.userData = { type: 'room', part: 'wall' };
    scene.add(rightWall);

    // Add ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(roomW, roomD),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0,
      })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = roomH;
    ceiling.receiveShadow = true;
    ceiling.userData = { type: 'room', part: 'ceiling' };
    scene.add(ceiling);

    // Create custom contact shadow plane with improved settings
    const shadowPlaneGeometry = new THREE.PlaneGeometry(roomW, roomD);
    const shadowPlaneMaterial = new THREE.ShadowMaterial({ opacity: 0.35 });

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(roomW, roomD),
      shadowPlaneMaterial
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.05;
    shadowPlane.receiveShadow = true;     // <‑‑ HERE
    shadowPlane.userData = { type: 'room', part: 'shadow' };
    scene.add(shadowPlane);

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
      let shadingLevel = currentDesign.globalShading || 0.3; // Default

      // Apply saved custom shading if this furniture has it
      if (currentDesign.shadingEnabled && currentDesign.customShading) {
        const customShading = currentDesign.customShading.find(
          s => s.furnitureId === item.id
        );
        if (customShading) {
          shadingLevel = customShading.shadingLevel;
        }
      }

      // Get furniture texture (custom or global)
      let textureObj = null;

      // Only consider custom textures if we're not forcing global textures
      if (!forceGlobalTexture && currentDesign.customTextures) {
        const customTexture = currentDesign.customTextures.find(
          t => t.furnitureId === item.id
        );

        if (customTexture && customTexture.textureId) {
          const foundTexture = availableTextures.find(t => t.id === customTexture.textureId);
          if (foundTexture) {
            textureObj = {
              id: foundTexture.id,
              path: foundTexture.path,
              color: foundTexture.color
            };
          }
        }
      }

      // When Apply-to-All is active, use the chosen global texture
      if (!textureObj && forceGlobalTexture && currentDesign.globalTextureId) {
        const globalTexture =
          availableTextures.find(t => t.id === currentDesign.globalTextureId);

        textureObj = globalTexture
          ? { id: globalTexture.id, path: globalTexture.path, color: globalTexture.color }
          : {
            id: currentDesign.globalTextureId,
            path: currentDesign.globalTexturePath,
            color: currentDesign.globalTextureColor
          };
      }

      // Use the furniture's default color for fallback models if no texture
      const itemColor = textureObj?.color || item.color || data.defaultColor;

      const addFallback = () => {
        const sx = data.dimensions.width * userScale * modelOverride;
        const sy = data.dimensions.height * userScale * modelOverride;
        const sz = data.dimensions.depth * userScale * modelOverride;

        // Create material based on texture or color
        let material;

        // When applying custom texture
        if (textureObj && textureObj.path) {
          const texture = loadTexture(textureObj.path);
          material = new THREE.MeshStandardMaterial({
            map: texture,
            color: new THREE.Color(textureObj.color || 0xFFFFFF), // Use texture color
            roughness: 1 - shadingLevel,
            metalness: shadingLevel * 0.5
          });
        } else {
          material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(itemColor),
            roughness: 1 - shadingLevel,
            metalness: shadingLevel * 0.5
          });
        }

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

            // Apply texture if available
            if (textureObj && textureObj.path) {
              applyTexture(model, textureObj);
            }

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
  }, [currentDesign, selectedFurniture, updateSelectionHelper, loadTexture, applyTexture]);

  // Handle real-time shading preview
  useEffect(() => {
    if (!previewShadingValue || !currentDesign.shadingEnabled) return;

    const { id, level } = previewShadingValue;
    const furnitureObj = furnitureObjectsRef.current[id];

    if (furnitureObj) {
      // Apply temporary shading preview
      applyShading(furnitureObj, level);
    }
  }, [previewShadingValue, currentDesign.shadingEnabled, applyShading]);

  // Handle real-time texture preview
  useEffect(() => {
    if (!previewTextureValue) return;

    const { id, texture } = previewTextureValue;

    // Global texture preview
    if (id === 'global') {
      console.log("View3D - Previewing global texture:", texture);

      // Apply texture to all furniture objects
      Object.values(furnitureObjectsRef.current).forEach(obj => {
        // First restore original materials if necessary
        restoreOriginalMaterials(obj);
        // Then apply the new texture
        applyTexture(obj, texture);
      });
    }
    // Individual furniture texture preview
    else {
      const furnitureObj = furnitureObjectsRef.current[id];
      if (furnitureObj) {
        // First restore original materials if necessary
        restoreOriginalMaterials(furnitureObj);
        // Then apply the new texture
        applyTexture(furnitureObj, texture);
      }
    }
  }, [previewTextureValue, applyTexture, restoreOriginalMaterials]);

  // Function to handle preview shading
  const handlePreviewShading = (furnitureId, level) => {
    setPreviewShadingValue({ id: furnitureId, level });
  };

  // Function to apply and save shading
  const handleApplyShading = (furnitureId, level) => {
    // Save the shading to the context
    updateCustomShading(furnitureId, level);

    // Clear preview
    setPreviewShadingValue(null);
  };

  // Function to apply shading to all furniture
  const handleApplyShadingToAll = (level) => {
    // Apply shading to all furniture objects visually
    Object.entries(furnitureObjectsRef.current).forEach(([id, obj]) => {
      applyShading(obj, level);
    });

    // Save custom shading for each furniture item
    currentDesign.furniture.forEach(item => {
      updateCustomShading(item.id, level);
    });

    // Clear preview
    setPreviewShadingValue(null);
  };

  // Function to handle preview texture
  const handlePreviewTexture = (furnitureId, texture) => {
    setPreviewTextureValue({ id: furnitureId, texture });
  };

  // Function to apply and save texture
  const handleApplyTexture = (furnitureId, texture) => {
    console.log("View3D - Applying texture:", texture);
    console.log("View3D - To furniture with ID:", furnitureId);

    // Save the texture to the context
    updateFurnitureTexture(furnitureId, texture);

    // Clear preview
    setPreviewTextureValue(null);
  };

  const handleApplyTextureToAll = (texture, forceApply = false) => {
    console.log("View3D - Applying global texture to all:", texture, "Force apply:", forceApply);

    // Set the force apply flag
    forceGlobalTextureRef.current = true;

    // Update the global texture in the context
    updateGlobalTexture(texture);

    // Force apply visually
    if (forceApply) {
      Object.keys(furnitureObjectsRef.current).forEach(id => {
        const obj = furnitureObjectsRef.current[id];
        if (obj) {
          restoreOriginalMaterials(obj);
          applyTexture(obj, texture);
        }
      });
    }

    // Clear preview
    setPreviewTextureValue(null);
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
        onApplyShadingToAll={handleApplyShadingToAll}
        onPreviewTexture={handlePreviewTexture}
        onApplyTexture={handleApplyTexture}
        onApplyTextureToAll={handleApplyTextureToAll}
      />
    </div>
  );
};

export default View3D;