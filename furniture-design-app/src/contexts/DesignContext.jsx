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

/* ───────────────────────────── context setup ───────────────────────────── */
const DesignContext = createContext();
export const useDesign = () => useContext(DesignContext);

/* ───────────────────────────── provider ───────────────────────────── */
export const DesignProvider = ({ children }) => {
  /* one‑time init */
  useEffect(initializeDesigns, []);

  /* state : active design */
  const [currentDesign, setCurrentDesign] = useState({
    name: 'Untitled Design',
    createdBy: 'default-user',
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
    globalShading: 0.3,            //  ← brighter default
    customShading: [],
    globalTextureId: 'wood',
    globalTextureColor: '#8B4513',
    globalTexturePath: '/textures/wood.jpg',
    customTextures: [],
  });

  /* always‑fresh ref */
  const designRef = useRef(currentDesign);
  useEffect(() => {
    designRef.current = currentDesign;
  }, [currentDesign]);

  /* other UI state */
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [viewMode, setViewMode]                 = useState('2D');

  const log = (op, data) => console.log(`[DesignContext] ${op}`, data ?? '');

  /* ────────── CRUD helpers ────────── */
  const loadDesign = (designId) => {
    const d = getDesignById(designId);
    if (!d) return log('Design not found', designId) || false;

    /* sanity‑fill new fields */
    if (!d.globalTextureId)    d.globalTextureId    = 'wood';
    if (!d.globalTextureColor) d.globalTextureColor = '#8B4513';
    if (!d.globalTexturePath)  d.globalTexturePath  = '/textures/wood.jpg';
    if (!d.customTextures)     d.customTextures     = [];

    const clean = JSON.parse(JSON.stringify(d));
    setCurrentDesign(clean);
    setSelectedFurniture(null);
    designRef.current = clean;
    return true;
  };

  const createNewDesign = (designerId) => {
    const fresh = {
      ...currentDesign,
      id: undefined,
      name: 'Untitled Design',
      createdBy: designerId,
      furniture: [],
      customTextures: [],
      customShading: [],
    };
    setCurrentDesign(fresh);
    setSelectedFurniture(null);
    return fresh;
  };

  const renameDesign = (newName) => {
    const t = String(newName || '').trim();
    if (!t) return false;

    /* persisted? */
    if (designRef.current.id) {
      const upd = renameDesignInStorage(designRef.current.id, t);
      if (!upd) return false;
      setCurrentDesign(upd);
      return true;
    }
    setCurrentDesign((prev) => ({ ...prev, name: t }));
    return true;
  };

  /* ────────── room & furniture helpers ────────── */
  const updateRoom = (props) =>
    setCurrentDesign((p) => ({ ...p, room: { ...p.room, ...props } }));

  const addFurniture = (furnitureId, pos = { x: 100, y: 100 }) => {
    const f = getFurnitureById(furnitureId);
    if (!f) return false;
    const item = {
      id: f.id,
      x: pos.x,
      y: pos.y,
      rotation: 0,
      color: f.defaultColor,
      scale: 1,
    };
    setCurrentDesign((p) => ({ ...p, furniture: [...p.furniture, item] }));
    setSelectedFurniture(item);
    return true;
  };


  /* replace the whole furniture array at once */
const replaceFurniture = (newArr) =>
  setCurrentDesign((prev) => ({ ...prev, furniture: newArr }));


  const updateFurniture = (idx, props) =>
    setCurrentDesign((p) => {
      const arr = [...p.furniture];
      arr[idx] = { ...arr[idx], ...props };
      if (selectedFurniture?.id === arr[idx].id) setSelectedFurniture(arr[idx]);
      return { ...p, furniture: arr };
    });

  const removeFurniture = (idx) =>
    setCurrentDesign((p) => {
      const arr = [...p.furniture];
      const removedId = arr[idx]?.id;
      arr.splice(idx, 1);
      return {
        ...p,
        furniture: arr,
        customShading: p.customShading.filter((c) => c.furnitureId !== removedId),
        customTextures: p.customTextures.filter((c) => c.furnitureId !== removedId),
      };
    });

  /* ────────── shading helpers ────────── */
  const updateShading = (props) =>
    setCurrentDesign((p) => ({ ...p, ...props }));

  const updateCustomShading = (furnitureId, shadingLevel) =>
    setCurrentDesign((p) => {
      const i = p.customShading.findIndex((c) => c.furnitureId === furnitureId);
      const list = [...p.customShading];
      if (i !== -1) list[i] = { furnitureId, shadingLevel };
      else list.push({ furnitureId, shadingLevel });
      return { ...p, customShading: list };
    });

  /* ────────── TEXTURE helpers ────────── */
  /** 1. global: also add entry for every current item */
  const updateGlobalTexture = (textureObj) => {
    if (!textureObj) return;
    setCurrentDesign((prev) => {
      const newCustom = prev.furniture.map((it) => ({
        furnitureId: it.id,
        textureId:   textureObj.id,
        texturePath: textureObj.path,
        color:       textureObj.color,
      }));
      const upd = {
        ...prev,
        globalTextureId:    textureObj.id,
        globalTextureColor: textureObj.color,
        globalTexturePath:  textureObj.path,
        customTextures:     newCustom,
      };
      designRef.current = upd;
      return upd;
    });
  };

  /** 2. per‑item; pass NULL to *remove* (reset) */
  const updateFurnitureTexture = (furnitureId, textureObj) =>
    setCurrentDesign((prev) => {
      const i = prev.customTextures.findIndex((c) => c.furnitureId === furnitureId);
      const list = [...prev.customTextures];

      /* reset */
      if (!textureObj) {
        if (i !== -1) list.splice(i, 1);
        return { ...prev, customTextures: list };
      }

      const entry = {
        furnitureId,
        textureId:   textureObj.id,
        texturePath: textureObj.path,
        color:       textureObj.color,
      };
      if (i !== -1) list[i] = entry;
      else list.push(entry);
      return { ...prev, customTextures: list };
    });

  /** 3. reset ALL textures */
  const resetAllTextures = () =>
    setCurrentDesign((prev) => ({ ...prev, customTextures: [] }));

  /* ────────── SAVE / DELETE ────────── */
  const saveCurrentDesign = (designerId, overrides = {}) => {
    const latest = designRef.current;                 // always freshest snapshot
    const draft  = {
      ...latest,
      ...overrides,
      createdBy: designerId || latest.createdBy || 'default-user',
    };
    if (!draft.name?.trim()) draft.name = 'Untitled Design';
    let saved;
    if (draft.id) saved = updateDesign(draft.id, draft);
    else          saved = saveDesign(draft);
    if (saved) {
      const clean = JSON.parse(JSON.stringify(saved));
      setCurrentDesign(clean);
      designRef.current = clean;
    }
    return saved;
  };

  const deleteCurrentDesign = () => {
    if (!designRef.current.id) return false;
    const ok = deleteDesign(designRef.current.id);
    if (ok) createNewDesign(designRef.current.createdBy);
    return ok;
  };

  /* ────────── context value ────────── */
  const value = {
    currentDesign,
    selectedFurniture,
    viewMode,
    setSelectedFurniture,
    setViewMode,
    /* room & furniture */
    loadDesign,
    createNewDesign,
    renameDesign,
    updateRoom,
    addFurniture,
    updateFurniture,
    removeFurniture,
    /* shading & texture */
    updateShading,
    updateCustomShading,
    updateGlobalTexture,
    updateFurnitureTexture,
    resetAllTextures,
    /* persistence */
    saveCurrentDesign,
    deleteCurrentDesign,
    replaceFurniture,
  };

  return (
    <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
  );
};

export default DesignContext;
