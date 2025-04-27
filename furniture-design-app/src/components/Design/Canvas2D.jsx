import React, { useRef, useEffect, useState } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import { getFurnitureById } from '../../models/furnitureData';

const Canvas2D = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { currentDesign, selectedFurniture, setSelectedFurniture, updateFurniture } = useDesign();

  const [scale, setScale] = useState(0.5);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedFurnitureIndex, setDraggedFurnitureIndex] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Function to ensure colors are visible and valid
  const ensureValidColor = (color) => {
    // If no color is provided, return a default color
    if (!color) return '#A3A3A3'; // Default gray color
    
    // If color is too light (close to white background), darken it
    if (color === '#FFFFFF' || color === '#FFF' || color === 'white') {
      return '#A3A3A3';
    }
    
    return color;
  };

  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setCanvasSize({ width, height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Redraw canvas when design, furniture selection, scale, or canvas size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match container
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const roomWidthPx = currentDesign.room.width * scale;
    const roomDepthPx = currentDesign.room.depth * scale;
    const roomX = (canvasSize.width - roomWidthPx) / 2;
    const roomY = (canvasSize.height - roomDepthPx) / 2;

    // Apply floor color with fallback
    context.fillStyle = ensureValidColor(currentDesign.room.floorColor);
    context.strokeStyle = '#000000';
    context.lineWidth = 2;

    if (['rectangle', 'square'].includes(currentDesign.room.shape)) {
      context.fillRect(roomX, roomY, roomWidthPx, roomDepthPx);
      context.strokeRect(roomX, roomY, roomWidthPx, roomDepthPx);
    } else if (currentDesign.room.shape === 'l-shaped') {
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
    currentDesign.furniture.forEach((item) => {
      const furniture = getFurnitureById(item.id);
      if (!furniture) return;

      const x = roomX + item.x * scale;
      const y = roomY + item.y * scale;
      const width = furniture.dimensions.width * scale * item.scale;
      const height = furniture.dimensions.depth * scale * item.scale;

      context.save();
      context.translate(x, y);
      context.rotate((item.rotation * Math.PI) / 180);

      // Apply furniture color with fallback
      context.fillStyle = ensureValidColor(item.color || furniture.defaultColor);
      context.fillRect(-width / 2, -height / 2, width, height);

      const isSelected = selectedFurniture?.id === item.id;
      context.strokeStyle = isSelected ? '#2563EB' : '#000000'; // Bright blue for selection
      context.lineWidth = isSelected ? 3 : 1;
      context.strokeRect(-width / 2, -height / 2, width, height);

      // Add furniture label/icon
      context.fillStyle = '#FFFFFF';
      context.font = '12px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';

      const emoji =
        furniture.category === 'chairs' ? '🪑' :
        furniture.category === 'tables' ? '🪟' :
        furniture.category === 'sofas' ? '🛋️' :
        furniture.category === 'cabinets' ? '🗄️' :
        furniture.category === 'beds' ? '🛏️' : '📦';

      context.fillText(emoji, 0, 0);

      context.restore();
    });

  }, [currentDesign, selectedFurniture, scale, canvasSize]);

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const roomWidthPx = currentDesign.room.width * scale;
    const roomDepthPx = currentDesign.room.depth * scale;
    const roomX = (canvasSize.width - roomWidthPx) / 2;
    const roomY = (canvasSize.height - roomDepthPx) / 2;

    // Check if clicked on furniture (check in reverse order to prioritize top items)
    for (let i = currentDesign.furniture.length - 1; i >= 0; i--) {
      const item = currentDesign.furniture[i];
      const furniture = getFurnitureById(item.id);
      if (!furniture) continue;

      const furnitureX = roomX + item.x * scale;
      const furnitureY = roomY + item.y * scale;
      const width = furniture.dimensions.width * scale * item.scale;
      const height = furniture.dimensions.depth * scale * item.scale;

      const dx = x - furnitureX;
      const dy = y - furnitureY;
      const angle = -item.rotation * Math.PI / 180;
      const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
      const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

      if (
        rotatedX >= -width / 2 &&
        rotatedX <= width / 2 &&
        rotatedY >= -height / 2 &&
        rotatedY <= height / 2
      ) {
        setDragging(true);
        setDragStart({ x, y });
        setDraggedFurnitureIndex(i);
        setSelectedFurniture(item);
        return;
      }
    }

    setSelectedFurniture(null);
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragging || draggedFurnitureIndex === null) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    const updated = { ...currentDesign.furniture[draggedFurnitureIndex] };
    updated.x += dx / scale;
    updated.y += dy / scale;

    const furniture = getFurnitureById(updated.id);
    if (furniture) {
      const halfWidth = (furniture.dimensions.width * updated.scale) / 2;
      const halfDepth = (furniture.dimensions.depth * updated.scale) / 2;
      updated.x = Math.max(halfWidth, Math.min(currentDesign.room.width - halfWidth, updated.x));
      updated.y = Math.max(halfDepth, Math.min(currentDesign.room.depth - halfDepth, updated.y));
    }

    updateFurniture(draggedFurnitureIndex, updated);
    setDragStart({ x, y });
  };

  // Handle touch events for mobile support
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      e.preventDefault();
      const touch = e.touches[0];
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      handleCanvasMouseDown(simulatedEvent);
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      e.preventDefault();
      const touch = e.touches[0];
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      handleCanvasMouseMove(simulatedEvent);
    }
  };

  const handleTouchEnd = () => {
    handleCanvasMouseUp();
  };

  const handleCanvasMouseUp = () => {
    setDragging(false);
    setDraggedFurnitureIndex(null);
  };

  const handleRotateLeft = () => {
    if (!selectedFurniture) return;
    const index = currentDesign.furniture.findIndex(f => f.id === selectedFurniture.id);
    if (index !== -1) {
      const updated = { ...currentDesign.furniture[index] };
      updated.rotation = (updated.rotation - 15 + 360) % 360;
      updateFurniture(index, updated);
    }
  };

  const handleRotateRight = () => {
    if (!selectedFurniture) return;
    const index = currentDesign.furniture.findIndex(f => f.id === selectedFurniture.id);
    if (index !== -1) {
      const updated = { ...currentDesign.furniture[index] };
      updated.rotation = (updated.rotation + 15) % 360;
      updateFurniture(index, updated);
    }
  };

  const handleRemoveFurniture = () => {
    if (!selectedFurniture) return;
    const index = currentDesign.furniture.findIndex(f => f.id === selectedFurniture.id);
    if (index !== -1 && window.confirm('Are you sure you want to remove this item?')) {
      updateFurniture(index, null);
    }
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.1, 1.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.1, 0.2));
  
  const handleScaleFurniture = (factor) => {
    if (!selectedFurniture) return;
    const index = currentDesign.furniture.findIndex(f => f.id === selectedFurniture.id);
    if (index !== -1) {
      const updated = { ...currentDesign.furniture[index] };
      updated.scale = Math.max(0.5, Math.min(2.0, updated.scale + factor));
      updateFurniture(index, updated);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar - Responsive layout for room info and zoom controls */}
      <div className="bg-gray-100 p-2 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <span className="font-medium">Room: {currentDesign.room.width}cm × {currentDesign.room.depth}cm</span>
          <span className="text-gray-500">Shape: {currentDesign.room.shape}</span>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          <button 
            onClick={handleZoomOut} 
            className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
            aria-label="Zoom out"
          >
            🔍-
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button 
            onClick={handleZoomIn} 
            className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
            aria-label="Zoom in"
          >
            🔍+
          </button>
        </div>
      </div>

      {/* Canvas - Fills available space */}
      <div className="flex-1 relative" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        
        {/* Furniture controls - Positioned responsively */}
        {selectedFurniture && (
          <div className="absolute top-4 right-4 sm:top-4 sm:right-4 bg-white p-2 rounded shadow-md flex flex-col space-y-2 w-36 sm:w-40 text-gray-700 z-10">
            <div className="font-medium text-xs sm:text-sm text-center truncate">
              {getFurnitureById(selectedFurniture.id)?.name || 'Furniture'}
            </div>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={handleRotateLeft} 
                className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                aria-label="Rotate left"
              >
                ↺
              </button>
              <button 
                onClick={handleRotateRight} 
                className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                aria-label="Rotate right"
              >
                ↻
              </button>
            </div>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => handleScaleFurniture(-0.1)} 
                className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                aria-label="Scale down"
              >
                -
              </button>
              <button 
                onClick={() => handleScaleFurniture(0.1)} 
                className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
                aria-label="Scale up"
              >
                +
              </button>
            </div>
            <button 
              onClick={handleRemoveFurniture} 
              className="p-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
              aria-label="Remove furniture"
            >
              🗑️ Remove
            </button>
          </div>
        )}
      </div>

      {/* Footer - Instructions */}
      <div className="bg-gray-100 p-2 text-center text-gray-600 text-xs sm:text-sm">
        <span className="hidden sm:inline">Click and drag to move furniture. Use controls to rotate, scale or remove items.</span>
        <span className="sm:hidden">Tap and drag furniture. Use controls to modify.</span>
      </div>
    </div>
  );
};

export default Canvas2D;