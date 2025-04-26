/**
 * Utility functions for the furniture design application
 */

// Format a date string to a readable format
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Generate a random color in hex format
export const generateRandomColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
};

// Calculate if a point is inside a rotated rectangle
export const isPointInRotatedRectangle = (
  pointX, 
  pointY, 
  rectCenterX, 
  rectCenterY, 
  rectWidth, 
  rectHeight, 
  rotationDegrees
) => {
  // Convert rotation from degrees to radians
  const rotationRadians = (rotationDegrees * Math.PI) / 180;
  
  // Translate point to origin (rect center)
  const translatedX = pointX - rectCenterX;
  const translatedY = pointY - rectCenterY;
  
  // Rotate point in the opposite direction
  const rotatedX = translatedX * Math.cos(-rotationRadians) - translatedY * Math.sin(-rotationRadians);
  const rotatedY = translatedX * Math.sin(-rotationRadians) + translatedY * Math.cos(-rotationRadians);
  
  // Check if the rotated point is inside the non-rotated rectangle
  return (
    rotatedX >= -rectWidth / 2 &&
    rotatedX <= rectWidth / 2 &&
    rotatedY >= -rectHeight / 2 &&
    rotatedY <= rectHeight / 2
  );
};

// Get common room dimensions based on type
export const getCommonRoomDimensions = (roomType) => {
  switch (roomType) {
    case 'living-room':
      return { width: 500, depth: 400, height: 280 };
    case 'bedroom':
      return { width: 400, depth: 350, height: 280 };
    case 'kitchen':
      return { width: 350, depth: 350, height: 280 };
    case 'dining-room':
      return { width: 450, depth: 400, height: 280 };
    case 'office':
      return { width: 380, depth: 320, height: 280 };
    default:
      return { width: 400, depth: 400, height: 280 };
  }
};

// Convert canvas coordinates to room coordinates
export const canvasToRoomCoordinates = (
  canvasX, 
  canvasY, 
  canvasWidth, 
  canvasHeight, 
  roomWidth, 
  roomDepth, 
  scale
) => {
  // Calculate room position to center it on canvas
  const roomWidthPx = roomWidth * scale;
  const roomDepthPx = roomDepth * scale;
  const roomX = (canvasWidth - roomWidthPx) / 2;
  const roomY = (canvasHeight - roomDepthPx) / 2;
  
  // Convert canvas coordinates to room coordinates
  const roomCoordX = (canvasX - roomX) / scale;
  const roomCoordY = (canvasY - roomY) / scale;
  
  return { x: roomCoordX, y: roomCoordY };
};

// Calculate the bounding box of a rotated rectangle
export const getRotatedRectangleBounds = (
  centerX, 
  centerY, 
  width, 
  height, 
  rotationDegrees
) => {
  const rotationRadians = (rotationDegrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rotationRadians));
  const sin = Math.abs(Math.sin(rotationRadians));
  
  // Calculate width and height of the bounding box
  const boundingWidth = width * cos + height * sin;
  const boundingHeight = width * sin + height * cos;
  
  return {
    left: centerX - boundingWidth / 2,
    top: centerY - boundingHeight / 2,
    right: centerX + boundingWidth / 2,
    bottom: centerY + boundingHeight / 2,
    width: boundingWidth,
    height: boundingHeight
  };
};