import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';

const View3D = () => {
  const containerRef = useRef(null);
  const { currentDesign } = useDesign();
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Setup and render the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Get container dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Create scene if it doesn't exist
    if (!sceneRef.current) {
      sceneRef.current = new THREE.Scene();
      sceneRef.current.background = new THREE.Color(0xf0f0f0);

      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      sceneRef.current.add(ambientLight);

      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      sceneRef.current.add(directionalLight);

      // Create camera
      cameraRef.current = new THREE.PerspectiveCamera(
        75, // FOV
        width / height, // Aspect ratio
        0.1, // Near clipping plane
        2000 // Far clipping plane
      );
      cameraRef.current.position.set(0, 500, 500);
      cameraRef.current.lookAt(0, 0, 0);

      // Create renderer
      rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current.setSize(width, height);
      rendererRef.current.shadowMap.enabled = true;
      containerRef.current.appendChild(rendererRef.current.domElement);

      // Add orbit controls
      controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.1;
      controlsRef.current.rotateSpeed = 0.5;
      controlsRef.current.minDistance = 100;
      controlsRef.current.maxDistance = 1000;
      
      // Add a grid helper for reference
      const gridHelper = new THREE.GridHelper(2000, 20, 0x888888, 0x444444);
      sceneRef.current.add(gridHelper);
    }

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(newWidth, newHeight);
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    // Start animation
    animate();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update the scene when design changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear previous objects (except lights and helpers)
    const objectsToRemove = [];
    sceneRef.current.traverse(obj => {
      if (obj.userData.type === 'room' || obj.userData.type === 'furniture') {
        objectsToRemove.push(obj);
      }
    });
    
    objectsToRemove.forEach(obj => {
      sceneRef.current.remove(obj);
    });

    // Create room
    const roomWidth = currentDesign.room.width;
    const roomDepth = currentDesign.room.depth;
    const roomHeight = currentDesign.room.height;
    
    // Get room colors
    const wallColor = new THREE.Color(currentDesign.room.wallColor);
    const floorColor = new THREE.Color(currentDesign.room.floorColor);
    const accentColor = new THREE.Color(currentDesign.room.accentColor);
    
    // Materials
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.8,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.9,
      metalness: 0.1,
    });
    
    // Create room based on shape
    if (currentDesign.room.shape === 'rectangle' || currentDesign.room.shape === 'square') {
      // Create floor
      const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = 0;
      floor.userData.type = 'room';
      floor.receiveShadow = true;
      sceneRef.current.add(floor);
      
      // Create walls
      // Back wall
      const backWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.z = -roomDepth/2;
      backWall.position.y = roomHeight/2;
      backWall.userData.type = 'room';
      sceneRef.current.add(backWall);
      
      // Left wall
      const leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.x = -roomWidth/2;
      leftWall.position.y = roomHeight/2;
      leftWall.userData.type = 'room';
      sceneRef.current.add(leftWall);
      
      // Right wall
      const rightWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
      const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.position.x = roomWidth/2;
      rightWall.position.y = roomHeight/2;
      rightWall.userData.type = 'room';
      sceneRef.current.add(rightWall);
      
      // Front wall (transparent or removed)
      // Not adding front wall to allow viewing inside
    } 
    else if (currentDesign.room.shape === 'l-shaped') {
      // Create L-shaped floor
      const shape = new THREE.Shape();
      
      // Draw L shape
      shape.moveTo(-roomWidth/2, -roomDepth/2);
      shape.lineTo(roomWidth/2, -roomDepth/2);
      shape.lineTo(roomWidth/2, roomDepth/2 - roomDepth * 0.4);
      shape.lineTo(-roomWidth/2 + roomWidth * 0.6, roomDepth/2 - roomDepth * 0.4);
      shape.lineTo(-roomWidth/2 + roomWidth * 0.6, roomDepth/2);
      shape.lineTo(-roomWidth/2, roomDepth/2);
      shape.closePath();
      
      const geometry = new THREE.ShapeGeometry(shape);
      const floor = new THREE.Mesh(geometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2;
      floor.userData.type = 'room';
      floor.receiveShadow = true;
      sceneRef.current.add(floor);
      
      // Create walls for L-shaped room (simplified)
      // This is a simplified approach; a more complete solution would extrude the shape
      
      // Back wall (long part)
      const backWallGeometry = new THREE.PlaneGeometry(roomWidth, roomHeight);
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.z = -roomDepth/2;
      backWall.position.y = roomHeight/2;
      backWall.userData.type = 'room';
      sceneRef.current.add(backWall);
      
      // Left wall (long part)
      const leftWallGeometry = new THREE.PlaneGeometry(roomDepth, roomHeight);
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.x = -roomWidth/2;
      leftWall.position.y = roomHeight/2;
      leftWall.userData.type = 'room';
      sceneRef.current.add(leftWall);
      
      // Right wall (partial)
      const rightWallGeometry = new THREE.PlaneGeometry(roomDepth * 0.6, roomHeight);
      const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.position.x = roomWidth/2;
      rightWall.position.y = roomHeight/2;
      rightWall.position.z = -roomDepth * 0.2;
      rightWall.userData.type = 'room';
      sceneRef.current.add(rightWall);
      
      // Inner L wall (vertical)
      const innerWallVGeometry = new THREE.PlaneGeometry(roomDepth * 0.4, roomHeight);
      const innerWallV = new THREE.Mesh(innerWallVGeometry, wallMaterial);
      innerWallV.rotation.y = Math.PI / 2;
      innerWallV.position.x = -roomWidth/2 + roomWidth * 0.6;
      innerWallV.position.y = roomHeight/2;
      innerWallV.position.z = roomDepth/2 - roomDepth * 0.2;
      innerWallV.userData.type = 'room';
      sceneRef.current.add(innerWallV);
      
      // Inner L wall (horizontal)
      const innerWallHGeometry = new THREE.PlaneGeometry(roomWidth * 0.4, roomHeight);
      const innerWallH = new THREE.Mesh(innerWallHGeometry, wallMaterial);
      innerWallH.position.x = roomWidth/2 - roomWidth * 0.2;
      innerWallH.position.y = roomHeight/2;
      innerWallH.position.z = roomDepth/2 - roomDepth * 0.4;
      innerWallH.userData.type = 'room';
      sceneRef.current.add(innerWallH);
    }
    
    // Add accent color element (simple cube in corner)
    const accentGeometry = new THREE.BoxGeometry(20, 20, 20);
    const accentMaterial = new THREE.MeshStandardMaterial({ color: accentColor });
    const accentCube = new THREE.Mesh(accentGeometry, accentMaterial);
    accentCube.position.set(roomWidth/2 - 20, 10, roomDepth/2 - 20);
    accentCube.userData.type = 'room';
    sceneRef.current.add(accentCube);

    // Add furniture
    currentDesign.furniture.forEach(furnitureItem => {
      const furnitureData = getFurnitureById(furnitureItem.id);
      if (!furnitureData) return;
      
      // Calculate position
      // Convert from 2D top-down coordinates to 3D
      const posX = furnitureItem.x - roomWidth/2;
      const posZ = furnitureItem.y - roomDepth/2;
      
      // Get dimensions
      const width = furnitureData.dimensions.width * furnitureItem.scale;
      const depth = furnitureData.dimensions.depth * furnitureItem.scale;
      const height = furnitureData.dimensions.height * furnitureItem.scale;
      
      // Create simple 3D representation based on furniture type
      let geometry, material, mesh;
      
      // Apply shading based on global and custom settings
      const baseColor = new THREE.Color(furnitureItem.color || furnitureData.defaultColor);
      let shadingFactor = currentDesign.shadingEnabled ? currentDesign.globalShading : 1.0;
      
      // Check for custom shading
      if (currentDesign.shadingEnabled && currentDesign.customShading.length > 0) {
        const customShading = currentDesign.customShading.find(item => item.furnitureId === furnitureItem.id);
        if (customShading) {
          shadingFactor = customShading.shadingLevel;
        }
      }
      
      // Apply shading effect (multiply the rgb values by the shading factor)
      const adjustedColor = new THREE.Color(
        baseColor.r * shadingFactor,
        baseColor.g * shadingFactor,
        baseColor.b * shadingFactor
      );
      
      if (furnitureData.category === 'chairs') {
        // Chair - cubes for seat and back
        const chairGroup = new THREE.Group();
        
        // Seat
        const seatGeometry = new THREE.BoxGeometry(width, height * 0.4, depth);
        const seatMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const seat = new THREE.Mesh(seatGeometry, seatMaterial);
        seat.position.y = height * 0.2;
        seat.castShadow = true;
        seat.receiveShadow = true;
        chairGroup.add(seat);
        
        // Back
        const backGeometry = new THREE.BoxGeometry(width, height * 0.6, depth * 0.2);
        const backMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const back = new THREE.Mesh(backGeometry, backMaterial);
        back.position.y = height * 0.7;
        back.position.z = -depth * 0.4;
        back.castShadow = true;
        back.receiveShadow = true;
        chairGroup.add(back);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(width * 0.1, height * 0.4, depth * 0.1);
        const legMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        
        // Front left leg
        const legFL = new THREE.Mesh(legGeometry, legMaterial);
        legFL.position.set(-width * 0.4, -height * 0.2, depth * 0.4);
        legFL.castShadow = true;
        chairGroup.add(legFL);
        
        // Front right leg
        const legFR = new THREE.Mesh(legGeometry, legMaterial);
        legFR.position.set(width * 0.4, -height * 0.2, depth * 0.4);
        legFR.castShadow = true;
        chairGroup.add(legFR);
        
        // Back left leg
        const legBL = new THREE.Mesh(legGeometry, legMaterial);
        legBL.position.set(-width * 0.4, -height * 0.2, -depth * 0.4);
        legBL.castShadow = true;
        chairGroup.add(legBL);
        
        // Back right leg
        const legBR = new THREE.Mesh(legGeometry, legMaterial);
        legBR.position.set(width * 0.4, -height * 0.2, -depth * 0.4);
        legBR.castShadow = true;
        chairGroup.add(legBR);
        
        mesh = chairGroup;
      } 
      else if (furnitureData.category === 'tables') {
        // Table - cube with legs
        const tableGroup = new THREE.Group();
        
        // Table top
        const topGeometry = new THREE.BoxGeometry(width, height * 0.1, depth);
        const topMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = height * 0.5;
        top.castShadow = true;
        top.receiveShadow = true;
        tableGroup.add(top);
        
        // Legs
        const legGeometry = new THREE.BoxGeometry(width * 0.05, height * 0.9, depth * 0.05);
        const legMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        
        // Front left leg
        const legFL = new THREE.Mesh(legGeometry, legMaterial);
        legFL.position.set(-width * 0.45, height * 0.05, depth * 0.45);
        legFL.castShadow = true;
        tableGroup.add(legFL);
        
        // Front right leg
        const legFR = new THREE.Mesh(legGeometry, legMaterial);
        legFR.position.set(width * 0.45, height * 0.05, depth * 0.45);
        legFR.castShadow = true;
        tableGroup.add(legFR);
        
        // Back left leg
        const legBL = new THREE.Mesh(legGeometry, legMaterial);
        legBL.position.set(-width * 0.45, height * 0.05, -depth * 0.45);
        legBL.castShadow = true;
        tableGroup.add(legBL);
        
        // Back right leg
        const legBR = new THREE.Mesh(legGeometry, legMaterial);
        legBR.position.set(width * 0.45, height * 0.05, -depth * 0.45);
        legBR.castShadow = true;
        tableGroup.add(legBR);
        
        mesh = tableGroup;
      } 
      else if (furnitureData.category === 'sofas') {
        // Sofa - main body with armrests and back
        const sofaGroup = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.BoxGeometry(width, height * 0.3, depth);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = height * 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        sofaGroup.add(base);
        
        // Back
        const backGeometry = new THREE.BoxGeometry(width, height * 0.5, depth * 0.2);
        const backMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const back = new THREE.Mesh(backGeometry, backMaterial);
        back.position.y = height * 0.55;
        back.position.z = -depth * 0.4;
        back.castShadow = true;
        back.receiveShadow = true;
        sofaGroup.add(back);
        
        // Left armrest
        const leftArmGeometry = new THREE.BoxGeometry(width * 0.1, height * 0.4, depth);
        const leftArmMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial);
        leftArm.position.set(-width * 0.45, height * 0.4, 0);
        leftArm.castShadow = true;
        leftArm.receiveShadow = true;
        sofaGroup.add(leftArm);
        
        // Right armrest
        const rightArmGeometry = new THREE.BoxGeometry(width * 0.1, height * 0.4, depth);
        const rightArmMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial);
        rightArm.position.set(width * 0.45, height * 0.4, 0);
        rightArm.castShadow = true;
        rightArm.receiveShadow = true;
        sofaGroup.add(rightArm);
        
        mesh = sofaGroup;
      } 
      else if (furnitureData.category === 'cabinets') {
        // Cabinet - simple rectangular box
        geometry = new THREE.BoxGeometry(width, height, depth);
        material = new THREE.MeshStandardMaterial({
          color: adjustedColor,
          roughness: 0.7,
          metalness: 0.3
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = height / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add simple handles as detail
        const handleGeometry = new THREE.BoxGeometry(width * 0.05, height * 0.02, depth * 0.05);
        const handleMaterial = new THREE.MeshStandardMaterial({ color: 0xdddddd });
        
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(0, height * 0.5, depth * 0.51);
        mesh.add(handle);
      } 
      else if (furnitureData.category === 'beds') {
        // Bed - base and mattress
        const bedGroup = new THREE.Group();
        
        // Base
        const baseGeometry = new THREE.BoxGeometry(width, height * 0.3, depth);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = height * 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        bedGroup.add(base);
        
        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.2, depth * 0.9);
        const mattressMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.y = height * 0.4;
        mattress.castShadow = true;
        mattress.receiveShadow = true;
        bedGroup.add(mattress);
        
        // Headboard
        const headboardGeometry = new THREE.BoxGeometry(width, height * 0.5, depth * 0.1);
        const headboardMaterial = new THREE.MeshStandardMaterial({ color: adjustedColor });
        const headboard = new THREE.Mesh(headboardGeometry, headboardMaterial);
        headboard.position.y = height * 0.55;
        headboard.position.z = -depth * 0.45;
        headboard.castShadow = true;
        headboard.receiveShadow = true;
        bedGroup.add(headboard);
        
        mesh = bedGroup;
      } 
      else {
        // Generic furniture (fallback)
        geometry = new THREE.BoxGeometry(width, height, depth);
        material = new THREE.MeshStandardMaterial({ color: adjustedColor });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = height / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
      
      // Position and rotate the furniture
      mesh.position.x = posX;
      mesh.position.z = posZ;
      mesh.rotation.y = (furnitureItem.rotation * Math.PI) / 180;
      
      // Mark as furniture for future cleaning
      mesh.userData.type = 'furniture';
      mesh.userData.id = furnitureItem.id;
      
      // Add to scene
      sceneRef.current.add(mesh);
    });

    // Position camera to view the entire room
    const roomSize = Math.max(roomWidth, roomDepth);
    if (cameraRef.current) {
      cameraRef.current.position.set(0, roomSize * 0.7, roomSize * 1.2);
      cameraRef.current.lookAt(0, 0, 0);
      
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }, [currentDesign]);

  return (
    <div className="h-full w-full relative" ref={containerRef}>
      <div className="absolute top-4 left-4 bg-white bg-opacity-70 p-2 rounded shadow-md text-sm z-10">
        <p>Use mouse to rotate view</p>
        <p>Scroll to zoom in/out</p>
      </div>
    </div>
  );
};

export default View3D;