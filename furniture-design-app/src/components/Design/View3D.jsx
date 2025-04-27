import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';

const View3D = () => {
  const containerRef = useRef(null);
  const { currentDesign } = useDesign();
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

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
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(1, 1, 1);
    scene.add(dir);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
    camera.position.set(0, 500, 500);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
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
      container.removeChild(renderer.domElement);
    };
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

    // Remove previous objects
    const toRemove = [];
    scene.traverse(obj => {
      if (obj.userData.type === 'room' || obj.userData.type === 'furniture') {
        toRemove.push(obj);
      }
    });
    toRemove.forEach(obj => scene.remove(obj));

    const { width: roomW, depth: roomD, height: roomH, wallColor, floorColor } = currentDesign.room;

    // Materials
    const wallM = new THREE.MeshStandardMaterial({ color: new THREE.Color(wallColor), side: THREE.DoubleSide, roughness: 0.8, metalness: 0.2 });
    const floorM = new THREE.MeshStandardMaterial({ color: new THREE.Color(floorColor), roughness: 0.9, metalness: 0.1 });

    // Floor
    const floorG = new THREE.PlaneGeometry(roomW, roomD);
    const floor = new THREE.Mesh(floorG, floorM);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData.type = 'room';
    scene.add(floor);

    // Walls
    const backG = new THREE.PlaneGeometry(roomW, roomH);
    const leftG = new THREE.PlaneGeometry(roomD, roomH);
    const rightG = leftG.clone();
    const backWall = new THREE.Mesh(backG, wallM);
    backWall.position.set(0, roomH / 2, -roomD / 2);
    backWall.userData.type = 'room';
    scene.add(backWall);
    const leftWall = new THREE.Mesh(leftG, wallM);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-roomW / 2, roomH / 2, 0);
    leftWall.userData.type = 'room';
    scene.add(leftWall);
    const rightWall = new THREE.Mesh(rightG, wallM);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(roomW / 2, roomH / 2, 0);
    rightWall.userData.type = 'room';
    scene.add(rightWall);

    // Furniture loader & fallback
    const loader = new GLTFLoader();
    currentDesign.furniture.forEach(item => {
      const data = getFurnitureById(item.id);
      if (!data) return;

      const userScale = item.scale;
      let modelOverride = data.modelScale ?? 1;
      // Per-item boost factors
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

      const addFallback = () => {
        const sx = data.dimensions.width * userScale * modelOverride;
        const sy = data.dimensions.height * userScale * modelOverride;
        const sz = data.dimensions.depth * userScale * modelOverride;
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(sx, sy, sz),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(data.defaultColor) })
        );
        mesh.position.set(x, sy / 2, z);
        mesh.rotation.y = ry;
        mesh.castShadow = mesh.receiveShadow = true;
        mesh.userData = { type: 'furniture', id: item.id };
        scene.add(mesh);
      };

      if (data.modelUrl) {
        loader.load(
          data.modelUrl,
          gltf => {
            const model = gltf.scene.clone();
            // scale
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

            // position horizontally
            model.position.x = x;
            model.position.z = z;
            
            // FIX: Better floor alignment with special handling for bed
            const alignedBBox = new THREE.Box3().setFromObject(model);
            
            // Special handling for the bed to ensure it sits on the floor
            if (item.id === 'bed-1') {
              // Force the bed to sit directly on the floor
              model.position.y = 0;
              
              // Apply an additional vertical offset for fine-tuning if needed
              const bedYOffset = 0;
              model.position.y += bedYOffset;
            } else {
              // For other furniture, use the bounding box method but ensure it's on the floor
              model.position.y = -alignedBBox.min.y;
              
              // Add a small buffer to prevent z-fighting with the floor
              model.position.y += 0.1;
            }

            model.rotation.y = ry;
            model.userData = { type: 'furniture', id: item.id };
            
            // Ensure shadows are cast and received
            model.traverse(child => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            
            scene.add(model);
          },
          undefined,
          () => addFallback()
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
  }, [currentDesign]);

  return (
    <div ref={containerRef} className="h-full w-full relative">
      <div className="absolute text-gray-500 top-4 left-4 bg-white bg-opacity-70 p-2 rounded shadow-md text-sm z-10">
        <p>Use mouse to rotate view</p>
        <p>Scroll to zoom in/out</p>
      </div>
    </div>
  );
};

export default View3D;