import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../../contexts/DesignContext';
import { formatDate } from '../../utils/helpers';

const DesignActions = ({ design }) => {
  const { saveDesign, removeDesign, updateCurrentDesign } = useDesign();
  const navigate = useNavigate();
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(design?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Handle save design
  const handleSaveDesign = async () => {
    setIsSaving(true);
    try {
      const result = await saveDesign();
      if (result) {
        setActionMessage({ type: 'success', text: 'Design saved successfully!' });
        setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
      } else {
        setActionMessage({ type: 'error', text: 'Failed to save design.' });
      }
    } catch (err) {
      console.error('Failed to save design:', err);
      setActionMessage({ type: 'error', text: 'Error saving design.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete design
  const handleDeleteDesign = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }
    
    try {
      const result = await removeDesign(design.id);
      if (result) {
        navigate('/dashboard');
      } else {
        setActionMessage({ type: 'error', text: 'Failed to delete design.' });
        setIsDeleting(false);
      }
    } catch (err) {
      console.error('Failed to delete design:', err);
      setActionMessage({ type: 'error', text: 'Error deleting design.' });
      setIsDeleting(false);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setIsDeleting(false);
  };

  // Handle rename design
  const handleRenameDesign = () => {
    if (!isRenaming) {
      setIsRenaming(true);
      setNewName(design.name);
      return;
    }
    
    if (newName.trim() === '') {
      setActionMessage({ type: 'error', text: 'Design name cannot be empty.' });
      return;
    }
    
    updateCurrentDesign({ name: newName });
    setIsRenaming(false);
    setActionMessage({ type: 'success', text: 'Design renamed successfully!' });
    setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
  };

  // Handle cancel rename
  const handleCancelRename = () => {
    setIsRenaming(false);
  };

  if (!design) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Design Details</h3>
      
      {/* Display action messages */}
      {actionMessage.text && (
        <div className={`mt-2 p-2 text-sm rounded-md ${
          actionMessage.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {actionMessage.text}
        </div>
      )}
      
      <div className="mt-4 space-y-4">
        {/* Design name */}
        <div>
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Name</h4>
            {!isRenaming && (
              <button
                onClick={handleRenameDesign}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            )}
          </div>
          
          {isRenaming ? (
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                onClick={handleRenameDesign}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save
              </button>
              <button
                onClick={handleCancelRename}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-900">{design.name}</p>
          )}
        </div>
        
        {/* Design metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Created</h4>
            <p className="mt-1 text-sm text-gray-500">{formatDate(design.createdAt)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700">Last Modified</h4>
            <p className="mt-1 text-sm text-gray-500">{formatDate(design.updatedAt)}</p>
          </div>
        </div>
        
        {/* Room details */}
        <div>
          <h4 className="text-sm font-medium text-gray-700">Room Dimensions</h4>
          <p className="mt-1 text-sm text-gray-500">
            {design.room.width}m × {design.room.length}m × {design.room.height}m
          </p>
        </div>
        
        {/* Furniture count */}
        <div>
          <h4 className="text-sm font-medium text-gray-700">Furniture Count</h4>
          <p className="mt-1 text-sm text-gray-500">
            {design.furniture.length} {design.furniture.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleSaveDesign}
            disabled={isSaving}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Design'}
          </button>
          
          {isDeleting ? (
            <div className="flex-1 flex space-x-1">
              <button
                onClick={handleDeleteDesign}
                className="flex-1 px-2 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Confirm
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-2 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeleteDesign}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignActions;