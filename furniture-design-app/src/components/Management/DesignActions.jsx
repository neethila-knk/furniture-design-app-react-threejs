import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../contexts/DesignContext';

const DesignHeader = () => {
  const navigate = useNavigate();
  const {
    currentDesign,
    renameDesign,
    saveCurrentDesign,
    viewMode,
    setViewMode,
  } = useDesign();

  // UI state
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(
    currentDesign.name || 'Untitled Design'
  );
  const [isSaved, setIsSaved] = useState(!!currentDesign.id);
  const [statusMessage, setStatusMessage] = useState('');

  // “Enter-name-then-save” modal
  const [showNameModal, setShowNameModal] = useState(false);
  const [modalName, setModalName] = useState('');

  const renameInputRef = useRef(null);
  const log = (op, data) => console.log(`[DesignHeader] ${op}`, data || '');

  // Keep UI state in sync
  useEffect(() => {
    setNewName(currentDesign.name || 'Untitled Design');
    setIsSaved(!!currentDesign.id);
  }, [currentDesign]);

  // Auto-focus rename field
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const flashStatus = (msg, isError = false) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
    log('Status', { msg, isError });
  };

  // ────────── inline rename ──────────
  const handleNameClick = () => {
    setNewName(currentDesign.name || 'Untitled Design');
    setIsRenaming(true);
  };

  const confirmInlineRename = () => {
    const t = newName.trim();
    if (!t) return flashStatus('Name cannot be empty', true);
    if (t !== currentDesign.name) {
      const ok = renameDesign(t);
      if (!ok) return flashStatus('Rename failed', true);
      setIsSaved(false);
      flashStatus('Renamed! Remember to save.');
    }
    setIsRenaming(false);
  };

  // ────────── Save flow ──────────
  const handleSaveClick = () => {
    // If we already have a proper name, save immediately.
    if (currentDesign.name && currentDesign.name !== 'Untitled Design') {
      const saved = saveCurrentDesign('user123');
      setIsSaved(!!saved);
      flashStatus(saved ? 'Design saved!' : 'Save failed', !saved);
      return;
    }
    // Otherwise prompt for the name.
    setModalName('');
    setShowNameModal(true);
  };

  const handleModalConfirm = () => {
    const t = modalName.trim();
    if (!t) return flashStatus('A name is required.', true);

    renameDesign(t); // update UI quickly
    const saved = saveCurrentDesign('user123', { name: t });

    setShowNameModal(false);
    setIsRenaming(false);
    setIsSaved(!!saved);
    flashStatus(saved ? 'Design saved!' : 'Error saving design', !saved);
  };

  // ────────── Other UI helpers ──────────
  const toggleView = () => setViewMode(viewMode === '2D' ? '3D' : '2D');
  const goToLibrary = () => navigate('/furniture-library');

  // ────────── render ──────────
  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        {/* left */}
        <div className="flex items-center">
          <div className="mr-4 text-xl font-bold text-blue-600">
            InteriorDesignApp
          </div>

          {/* name / inline-rename */}
          <div className="flex items-center">
            {isRenaming ? (
              <div className="flex items-center">
                <input
                  ref={renameInputRef}
                  className="border rounded px-2 py-1 w-64 focus:ring"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={confirmInlineRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmInlineRename();
                    if (e.key === 'Escape') setIsRenaming(false);
                  }}
                />
                <button
                  onClick={confirmInlineRename}
                  className="ml-2 text-green-600"
                >
                  ✓
                </button>
                <button
                  onClick={() => setIsRenaming(false)}
                  className="ml-1 text-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <h1
                className="text-lg font-medium cursor-pointer hover:text-blue-600"
                onClick={handleNameClick}
              >
                {currentDesign.name || 'Untitled Design'}
              </h1>
            )}

            {statusMessage && (
              <span
                className={`ml-3 text-sm ${
                  statusMessage.toLowerCase().includes('error')
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}
              >
                {statusMessage}
              </span>
            )}
          </div>
        </div>

        {/* right */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleView}
            className="px-3 py-1 border rounded hover:bg-gray-100"
          >
            {viewMode === '2D' ? '3D View' : '2D View'}
          </button>
          <button
            onClick={goToLibrary}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Furniture
          </button>
          <button
            onClick={handleSaveClick}
            className={`px-3 py-1 rounded ${
              isSaved
                ? 'bg-gray-200 text-gray-700'
                : 'bg-green-600 text-white'
            }`}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* name-prompt modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-medium mb-2">Name your design</h2>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-4 focus:ring"
              placeholder="Enter a name…"
              value={modalName}
              onChange={(e) => setModalName(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNameModal(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesignHeader;
