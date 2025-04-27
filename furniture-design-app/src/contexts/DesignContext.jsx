import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  initializeDesigns,
  saveDesign,
  updateDesign,
  renameDesign as renameDesignInStorage,
  deleteDesign,
  getDesignById,
} from '../models/designData';
import { getFurnitureById } from '../models/furnitureData';

// ────────────────────────────────────────────────────────────
// Context setup
// ────────────────────────────────────────────────────────────
const DesignContext = createContext();
export const useDesign = () => useContext(DesignContext);

// ────────────────────────────────────────────────────────────
// Provider
// ────────────────────────────────────────────────────────────
export const DesignProvider = ({ children }) => {
  /** Initialise sample data once */
  useEffect(() => {
    initializeDesigns();
  }, []);

  /** State: active design */
  const [currentDesign, setCurrentDesign] = useState({
    name: 'Untitled Design',
    room: {
      width: 500,
      depth: 400,
      height: 280,
      shape: 'rectangle',
      wallColor: '#F8F8FF',
      floorColor: '#A9A9A9',
      accentColor: '#4682B4',
    },
    furniture: [],
    shadingEnabled: true,
    globalShading: 0.7,
    customShading: [],
  });

  /** Keep a ref that *always* points at the very latest design */
  const designRef = useRef(currentDesign);
  useEffect(() => {
    designRef.current = currentDesign;
  }, [currentDesign]);

  /** Other state */
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [viewMode, setViewMode] = useState('2D');

  const log = (op, data) => console.log(`[DesignContext] ${op}:`, data);

  // ────────── CRUD helpers ──────────
  const loadDesign = (designId) => {
    const d = getDesignById(designId);
    if (!d) {
      log('Design not found', designId);
      return false;
    }
    setCurrentDesign(d);
    setSelectedFurniture(null);
    log('Loaded design', d);
    return true;
  };

  const createNewDesign = (designerId) => {
    const fresh = {
      name: 'Untitled Design',
      createdBy: designerId,
      room: {
        width: 500,
        depth: 400,
        height: 280,
        shape: 'rectangle',
        wallColor: '#F8F8FF',
        floorColor: '#A9A9A9',
        accentColor: '#4682B4',
      },
      furniture: [],
      shadingEnabled: true,
      globalShading: 0.7,
      customShading: [],
    };
    setCurrentDesign(fresh);
    setSelectedFurniture(null);
    log('New design created', fresh);
    return fresh;
  };

  const renameDesign = (newName) => {
    const t = String(newName || '').trim();
    if (!t) {
      log('Invalid rename', newName);
      return false;
    }

    // If the design is already saved, rename in storage.
    if (designRef.current.id) {
      const updated = renameDesignInStorage(designRef.current.id, t);
      if (!updated) {
        log('Rename in storage failed');
        return false;
      }
      setCurrentDesign(updated);
      return true;
    }

    // Unsaved design – just update local state.
    setCurrentDesign((prev) => ({ ...prev, name: t }));
    return true;
  };

  // ────────── Room & furniture helpers ──────────
  const updateRoom = (roomProps) =>
    setCurrentDesign((prev) => ({
      ...prev,
      room: { ...prev.room, ...roomProps },
    }));

  const addFurniture = (furnitureId, pos = { x: 100, y: 100 }) => {
    const f = getFurnitureById(furnitureId);
    if (!f) {
      log('Furniture not found', furnitureId);
      return false;
    }
    const item = {
      id: f.id,
      x: pos.x,
      y: pos.y,
      rotation: 0,
      color: f.defaultColor,
      scale: 1,
    };
    setCurrentDesign((prev) => ({
      ...prev,
      furniture: [...prev.furniture, item],
    }));
    setSelectedFurniture(item);
    return true;
  };

  const updateFurniture = (idx, props) =>
    setCurrentDesign((prev) => {
      const arr = [...prev.furniture];
      arr[idx] = { ...arr[idx], ...props };
      if (selectedFurniture?.id === arr[idx].id) {
        setSelectedFurniture(arr[idx]);
      }
      return { ...prev, furniture: arr };
    });

  const removeFurniture = (idx) =>
    setCurrentDesign((prev) => {
      const arr = [...prev.furniture];
      arr.splice(idx, 1);
      setSelectedFurniture(null);
      return { ...prev, furniture: arr };
    });

  // ────────── Shading helpers ──────────
  const updateShading = (props) =>
    setCurrentDesign((prev) => ({ ...prev, ...props }));

  const updateCustomShading = (furnitureId, shadingLevel) =>
    setCurrentDesign((prev) => {
      const i = prev.customShading.findIndex(
        (c) => c.furnitureId === furnitureId
      );
      const list = [...prev.customShading];
      if (i !== -1) list[i] = { furnitureId, shadingLevel };
      else list.push({ furnitureId, shadingLevel });
      return { ...prev, customShading: list };
    });

  // ────────── SAVE / DELETE ──────────
  /** Always uses the up-to-date ref; caller may pass `overrides` (e.g. `{ name }`). */
  const saveCurrentDesign = (designerId, overrides = {}) => {
    const draft = {
      ...designRef.current,
      ...overrides,
      createdBy:
        designerId || designRef.current.createdBy || 'default-user',
    };
    if (!draft.name?.trim()) draft.name = 'Untitled Design';

    let saved;
    if (draft.id) {
      saved = updateDesign(draft.id, draft);
    } else {
      saved = saveDesign(draft);
    }
    if (saved) setCurrentDesign(saved);
    return saved;
  };

  const deleteCurrentDesign = () => {
    if (!designRef.current.id) return false;
    const ok = deleteDesign(designRef.current.id);
    if (ok) createNewDesign(designRef.current.createdBy);
    return ok;
  };

  // ────────── Context value ──────────
  const value = {
    currentDesign,
    selectedFurniture,
    viewMode,
    setSelectedFurniture,
    setViewMode,
    loadDesign,
    createNewDesign,
    renameDesign,
    updateRoom,
    addFurniture,
    updateFurniture,
    removeFurniture,
    updateShading,
    updateCustomShading,
    saveCurrentDesign,
    deleteCurrentDesign,
  };

  return (
    <DesignContext.Provider value={value}>
      {children}
    </DesignContext.Provider>
  );
};

export default DesignContext;
