import create from "zustand";
import { catalog } from "../data/catalog";

const uid = () => `itm-${Math.random().toString(36).slice(2, 8)}`;

export const useDesignerStore = create((set, get) => ({
  items: [],
  selectedId: null,
  room: { width: 520, height: 440, theme: "Modern", palette: ["#f5f1e8", "#0f172a", "#0ea5e9", "#fb7185"] },
  view: "2d",
  user: null,
  addItem: (catalogId, position = { x: 80, y: 80 }) => {
    const base = catalog.find((c) => c.id === catalogId);
    if (!base) return;
    const newId = uid();
    set((state) => ({
      items: [
        ...state.items,
        {
          id: newId,
          catalogId,
          name: base.name,
          category: base.category,
          style: base.style,
          color: base.color,
          price: base.price,
          position,
          rotation: 0,
          size: base.dimensions,
          material: "matte",
          light: { temp: 3500, intensity: 0.8 }
        }
      ],
      selectedId: newId
    }));
  },
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id), selectedId: state.selectedId === id ? null : state.selectedId })),
  updateItem: (id, payload) => set((state) => ({ items: state.items.map((i) => (i.id === id ? { ...i, ...payload } : i)) })),
  setSelected: (id) => set({ selectedId: id }),
  setView: (view) => set({ view }),
  loadTemplate: (template) => {
    const templateItems = template.items.map((item) => {
      const base = catalog.find((c) => c.id === item.ref);
      const newId = uid();
      return {
        id: newId,
        catalogId: item.ref,
        name: base?.name || "Item",
        category: base?.category || "",
        style: base?.style || template.type,
        color: base?.color || "White",
        price: base?.price || 0,
        position: item.position,
        rotation: item.rotation,
        size: base?.dimensions,
        material: "matte",
        light: { temp: 3500, intensity: 0.8 }
      };
    });
    set({ items: templateItems, selectedId: templateItems[0]?.id ?? null, room: { ...get().room, theme: template.type, palette: template.palette } });
  },
  saveDesignLocal: () => {
    const state = get();
    localStorage.setItem("hdp-design", JSON.stringify({ items: state.items, room: state.room }));
  },
  loadDesignLocal: () => {
    const raw = localStorage.getItem("hdp-design");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    set({ items: parsed.items || [], room: parsed.room || get().room });
  },
  setUser: (user) => set({ user }),
}));
