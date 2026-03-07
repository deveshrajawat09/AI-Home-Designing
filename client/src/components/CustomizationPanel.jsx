import { HexColorPicker } from "react-colorful";
import { useDesignerStore } from "../store/useDesignerStore";

const materials = ["matte", "wood", "marble", "fabric", "metal"];

const CustomizationPanel = () => {
  const { items, selectedId, updateItem, removeItem } = useDesignerStore();
  const selected = items.find((i) => i.id === selectedId);

  if (!selected)
    return (
      <div className="glass rounded-2xl border border-slate-200 p-4 shadow-soft text-slate-500 text-sm">
        Select an item to customize colors, materials, and lighting.
      </div>
    );

  return (
    <div className="glass rounded-2xl border border-slate-200 p-4 shadow-soft space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Customization</p>
          <h3 className="text-lg font-semibold">{selected.name}</h3>
        </div>
        <button onClick={() => removeItem(selected.id)} className="text-sm text-red-500">Remove</button>
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-3 items-center">
        <HexColorPicker color={selected.color || "#0ea5e9"} onChange={(c) => updateItem(selected.id, { color: c })} />
        <div className="space-y-2 text-sm">
          <label className="block">
            Material
            <select
              value={selected.material}
              onChange={(e) => updateItem(selected.id, { material: e.target.value })}
              className="w-full border rounded-lg px-2 py-1"
            >
              {materials.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block">
            Rotation
            <input
              type="range"
              min="0"
              max="360"
              value={selected.rotation}
              onChange={(e) => updateItem(selected.id, { rotation: Number(e.target.value) })}
              className="w-full"
            />
          </label>
          <label className="block">
            Lighting temp ({selected.light?.temp}K)
            <input
              type="range"
              min="2700"
              max="6500"
              step="100"
              value={selected.light?.temp ?? 3500}
              onChange={(e) => updateItem(selected.id, { light: { ...selected.light, temp: Number(e.target.value) } })}
              className="w-full"
            />
          </label>
          <label className="block">
            Intensity ({selected.light?.intensity?.toFixed(2)})
            <input
              type="range"
              min="0"
              max="1.2"
              step="0.05"
              value={selected.light?.intensity ?? 0.8}
              onChange={(e) => updateItem(selected.id, { light: { ...selected.light, intensity: Number(e.target.value) } })}
              className="w-full"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
