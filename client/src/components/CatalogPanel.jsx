import { useMemo, useState } from "react";
import { catalog } from "../data/catalog";

const CatalogPanel = () => {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState("All");

  const filtered = useMemo(() => {
    return catalog.filter((item) => {
      const matchQuery = item.name.toLowerCase().includes(query.toLowerCase());
      const matchStyle = style === "All" || item.style === style;
      return matchQuery && matchStyle;
    });
  }, [query, style]);

  const styles = ["All", ...Array.from(new Set(catalog.map((c) => c.style)))];

  return (
    <div className="glass rounded-2xl border border-slate-200 p-4 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-slate-500">Furniture Catalog</p>
          <h3 className="text-lg font-semibold">50+ curated pieces</h3>
        </div>
        <select value={style} onChange={(e) => setStyle(e.target.value)} className="text-sm border rounded-lg px-2 py-1">
          {styles.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm mb-3"
        placeholder="Search sofa, table, lamp..."
      />
      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
        {filtered.map((item) => (
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("catalogId", item.id)}
            key={item.id}
            className="border border-slate-200 bg-white rounded-xl p-3 cursor-grab active:scale-[0.99]"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold">{item.name}</p>
              <span className="text-[11px] text-slate-500">{item.style}</span>
            </div>
            <p className="text-[11px] text-slate-500">{item.dimensions}</p>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="font-semibold">${item.price}</span>
              <span className="text-slate-500">{item.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogPanel;
