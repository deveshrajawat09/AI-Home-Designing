import { useEffect, useRef, useState } from "react";
import { useDesignerStore } from "../store/useDesignerStore";

const GRID = 40;

const Canvas2D = () => {
  const { items, addItem, updateItem, selectedId, setSelected } = useDesignerStore();
  const areaRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("catalogId");
    if (!id || !areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / GRID) * GRID;
    const y = Math.round((e.clientY - rect.top) / GRID) * GRID;
    addItem(id, { x, y });
  };

  const startDrag = (item, e) => {
    e.stopPropagation();
    setSelected(item.id);
    const rect = areaRef.current.getBoundingClientRect();
    setDragging({ id: item.id, offsetX: e.clientX - (rect.left + item.position.x), offsetY: e.clientY - (rect.top + item.position.y) });
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragging || !areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left - dragging.offsetX) / GRID) * GRID;
      const y = Math.round((e.clientY - rect.top - dragging.offsetY) / GRID) * GRID;
      updateItem(dragging.id, { position: { x, y } });
    };
    const stop = () => setDragging(null);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
  }, [dragging, updateItem]);

  return (
    <div
      ref={areaRef}
      className="h-full w-full grid-bg relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onMouseDown={() => setSelected(null)}
    >
      {items.map((item) => (
        <div
          key={item.id}
          onMouseDown={(e) => startDrag(item, e)}
          className={`absolute select-none cursor-move px-3 py-2 rounded-xl border text-xs font-semibold shadow-soft ${
            selectedId === item.id ? "border-teal bg-white" : "border-slate-200 bg-white/90"
          }`}
          style={{
            left: item.position.x,
            top: item.position.y,
            transform: `rotate(${item.rotation}deg)`
          }}
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: item.color || "#0ea5e9" }} />
            {item.name}
          </div>
          <p className="text-[10px] text-slate-500">{item.category}</p>
        </div>
      ))}
      <div className="absolute right-3 bottom-3 text-[11px] bg-white/80 border border-slate-200 px-2 py-1 rounded-md text-slate-500">
        Drag items from the catalog to place them. Grid snaps at {GRID}px.
      </div>
    </div>
  );
};

export default Canvas2D;
