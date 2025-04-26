import React, { useRef, useEffect, useState } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';

const Canvas2D = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { currentDesign, selectedFurniture, setSelectedFurniture, updateFurniture } = useDesign();
  
  const [scale, setScale] = useState(0.5); // 1 cm = 0.5 px
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedFurnitureIndex, setDraggedFurnitureIndex] = useState(null);
  
  // Redraw the canvas when design, selection, or scale changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Set canvas size to fit container
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate room position to center it
    const roomWidthPx = currentDesign.room.width * scale;
    const roomDepthPx = currentDesign.room.depth * scale;
    const roomX = (containerWidth - roomWidthPx) / 2;
    const roomY = (containerHeight - roomDepthPx) / 2;
    
    // Draw room background based on shape
    context.fillStyle = currentDesign.room.floorColor;
    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    
    if (currentDesign.room.shape === 'rectangle' || currentDesign.room.shape === 'square') {
      context.fillRect(roomX, roomY, roomWidthPx, roomDepthPx);
      context.strokeRect(roomX, roomY, roomWidthPx, roomDepthPx);
    } else if (currentDesign.room.shape === 'l-shaped') {
      // Draw L-shaped room
      context.beginPath();
      context.moveTo(roomX, roomY);
      context.lineTo(roomX + roomWidthPx, roomY);
      context.lineTo(roomX + roomWidthPx, roomY + roomDepthPx * 0.6);
      context.lineTo(roomX + roomWidthPx * 0.4, roomY + roomDepthPx * 0.6);
      context.lineTo(roomX + roomWidthPx * 0.4, roomY + roomDepthPx);
      context.lineTo(roomX, roomY + roomDepthPx);
      context.closePath();
      context.fill();
      context.stroke();
    }
    
    // Draw furniture
    currentDesign.furniture.forEach((furnitureItem, index) => {
      const furniture = getFurnitureById(furnitureItem.id);
      if (!furniture) return;
      
      // Transform coordinates from design space to canvas space
      const x = roomX + furnitureItem.x * scale;
      const y = roomY + furnitureItem.y * scale;
      const width = furniture.dimensions.width * scale * furnitureItem.scale;
      const height = furniture.dimensions.depth * scale * furnitureItem.scale;
      
      // Save context for rotation
      context.save();
      
      // Move to the center of the furniture
      context.translate(x, y);
      
      // Rotate around this center
      context.rotate((furnitureItem.rotation * Math.PI) / 180);
      
      // Draw furniture with its center at 0,0 (we're already translated there)
      context.fillStyle = furnitureItem.color || furniture.defaultColor;
      context.fillRect(-width / 2, -height / 2, width, height);
      
      // Add border, thicker if selected
      const isSelected = selectedFurniture && selectedFurniture.id === furnitureItem.id;
      context.strokeStyle = isSelected ? '#1E90FF' : '#000000';
      context.lineWidth = isSelected ? 3 : 1;
      context.strokeRect(-width / 2, -height / 2, width, height);
      
      // Add furniture name or symbol in the center
      context.fillStyle = '#FFFFFF';
      context.font = '12px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      const categoryEmoji = 
        furniture.category === 'chairs' ? '🪑' : 
        furniture.category === 'tables' ? '🪟' :
        furniture.category === 'sofas' ? '🛋️' :
        furniture.category === 'cabinets' ? '🗄️' :
        furniture.category === 'beds' ? '🛏️' : '📦';
      
      context.fillText(categoryEmoji, 0, 0);
      
      // Restore context to undo the rotation and translation
      context.restore();
    });
    
  }, [currentDesign, selectedFurniture, scale]);
  
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate room position (same as in drawing code)
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const roomWidthPx = currentDesign.room.width * scale;
    const roomDepthPx = currentDesign.room.depth * scale;
    const roomX = (containerWidth - roomWidthPx) / 2;
    const roomY = (containerHeight - roomDepthPx) / 2;
    
    // Check if any furniture was clicked, in reverse order to handle stacking
    for (let i = currentDesign.furniture.length - 1; i >= 0; i--) {
      const furnitureItem = currentDesign.furniture[i];
      const furniture = getFurnitureById(furnitureItem.id);
      if (!furniture) continue;
      
      // Transform coordinates from design space to canvas space
      const furnitureX = roomX + furnitureItem.x * scale;
      const furnitureY = roomY + furnitureItem.y * scale;
      const width = furniture.dimensions.width * scale * furnitureItem.scale;
      const height = furniture.dimensions.depth * scale * furnitureItem.scale;
      
      // Check if point is inside rotated rectangle
      // First translate to origin, then rotate back, then check if in unrotated rectangle
      const dx = x - furnitureX;
      const dy = y - furnitureY;
      const angle = -furnitureItem.rotation * Math.PI / 180;
      
      const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
      const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
      
      if (
        rotatedX >= -width / 2 &&
        rotatedX <= width / 2 &&
        rotatedY >= -height / 2 &&
        rotatedY <= height / 2
      ) {
        // Furniture found, start dragging
        setDragging(true);
        setDragStart({ x, y });
        setDraggedFurnitureIndex(i);
        setSelectedFurniture(furnitureItem);
        return;
      }
    }
    
    // No furniture clicked, clear selection
    setSelectedFurniture(null);
  };
  
  const handleCanvasMouseMove = (e) => {
    if (!dragging || draggedFurnitureIndex === null) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate room position (same as in drawing code)
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const roomWidthPx = currentDesign.room.width * scale;
    const roomDepthPx = currentDesign.room.depth * scale;
    const roomX = (containerWidth - roomWidthPx) / 2;
    const roomY = (containerHeight - roomDepthPx) / 2;
    
    // Calculate the delta in canvas coordinates
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    // Convert to design coordinates
    const dxDesign = dx / scale;
    const dyDesign = dy / scale;
    
    // Update furniture position
    const updatedFurniture = { ...currentDesign.furniture[draggedFurnitureIndex] };
    updatedFurniture.x += dxDesign;
    updatedFurniture.y += dyDesign;
    
    // Constrain to room bounds
    const furniture = getFurnitureById(updatedFurniture.id);
    if (furniture) {
      const furnitureWidth = furniture.dimensions.width * updatedFurniture.scale / 2;
      const furnitureDepth = furniture.dimensions.depth * updatedFurniture.scale / 2;
      
      updatedFurniture.x = Math.max(furnitureWidth, Math.min(currentDesign.room.width - furnitureWidth, updatedFurniture.x));
      updatedFurniture.y = Math.max(furnitureDepth, Math.min(currentDesign.room.depth - furnitureDepth, updatedFurniture.y));
    }
    
    updateFurniture(draggedFurnitureIndex, updatedFurniture);
    setDragStart({ x, y });
  };
  
  const handleCanvasMouseUp = () => {
    setDragging(false);
    setDraggedFurnitureIndex(null);
  };
  
  const handleRotateLeft = () => {
    if (!selectedFurniture) return;
    
    // Find the index of the selected furniture
    const index = currentDesign.furniture.findIndex(item => item.id === selectedFurniture.id);
    if (index === -1) return;
    
    // Update rotation (subtract 15 degrees)
    const updatedFurniture = { ...currentDesign.furniture[index] };
    updatedFurniture.rotation = (updatedFurniture.rotation - 15) % 360;
    updateFurniture(index, updatedFurniture);
  };
  
  const handleRotateRight = () => {
    if (!selectedFurniture) return;
    
    // Find the index of the selected furniture
    const index = currentDesign.furniture.findIndex(item => item.id === selectedFurniture.id);
    if (index === -1) return;
    
    // Update rotation (add 15 degrees)
    const updatedFurniture = { ...currentDesign.furniture[index] };
    updatedFurniture.rotation = (updatedFurniture.rotation + 15) % 360;
    updateFurniture(index, updatedFurniture);
  };
  
  const handleRemoveFurniture = () => {
    if (!selectedFurniture) return;
    
    // Find the index of the selected furniture
    const index = currentDesign.furniture.findIndex(item => item.id === selectedFurniture.id);
    if (index === -1) return;
    
    // Confirm and remove
    if (window.confirm('Are you sure you want to remove this furniture item?')) {
      // This will also clear selection as it's handled in the context
      updateFurniture(index, null);
    }
  };
  
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 1.5));
  };
  
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.2));
  };
  
  const handleScaleFurniture = (scaleFactor) => {
    if (!selectedFurniture) return;
    
    // Find the index of the selected furniture
    const index = currentDesign.furniture.findIndex(item => item.id === selectedFurniture.id);
    if (index === -1) return;
    
    // Update scale
    const updatedFurniture = { ...currentDesign.furniture[index] };
    updatedFurniture.scale = Math.max(0.5, Math.min(2.0, updatedFurniture.scale + scaleFactor));
    updateFurniture(index, updatedFurniture);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 p-2 flex justify-between items-center">
        <div>
          <span className="text-sm font-medium mr-2">Room: {currentDesign.room.width}cm × {currentDesign.room.depth}cm</span>
          <span className="text-sm text-gray-500">Shape: {currentDesign.room.shape}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
            title="Zoom Out"
          >
            🔍-
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
            title="Zoom In"
          >
            🔍+
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
        
        {selectedFurniture && (
          <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md">
            <div className="text-sm font-medium mb-2">
              {getFurnitureById(selectedFurniture.id)?.name || 'Selected Furniture'}
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={handleRotateLeft}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Rotate Left"
                >
                  ↺
                </button>
                <button
                  onClick={handleRotateRight}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Rotate Right"
                >
                  ↻
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleScaleFurniture(-0.1)}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Scale Down"
                >
                  -
                </button>
                <button
                  onClick={() => handleScaleFurniture(0.1)}
                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded"
                  title="Scale Up"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleRemoveFurniture}
                className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                title="Remove Furniture"
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-100 p-2 text-sm text-gray-600">
        <p>Click and drag to move furniture. Use controls to rotate and scale selected items.</p>
      </div>
    </div>
  );
};

export default Canvas2D;