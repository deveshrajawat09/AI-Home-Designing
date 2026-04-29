import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { drawGrid, initCanvas, renderPlan } from "../utils/drawPlan";

export default function CanvasView({ plan, editable, land }) {
  const containerRef = useRef(null);
  const fabricRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);

  /* =========================================
     INIT CANVAS
  ========================================= */
  useEffect(() => {
    if (!containerRef.current) return;

    const canvasEl = document.createElement("canvas");
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(canvasEl);

    const canvas = initCanvas(canvasEl, 1000, 700);
    fabricRef.current = canvas;

    drawGrid(canvas, 25);
    setLoading(false);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  /* =========================================
     RENDER PLAN
  ========================================= */
  useEffect(() => {
    if (plan && fabricRef.current) {
      renderPlan(fabricRef.current, plan, editable);
    }
  }, [plan, editable]);

  /* =========================================
     EMPTY LAND VIEW
  ========================================= */
  useEffect(() => {
    if (!plan && fabricRef.current) {
      const canvas = fabricRef.current;

      canvas.clear();
      drawGrid(canvas, 25);

      const txt = new fabric.Text(
        `🏡 Empty Plot ${land.length}m × ${land.width}m`,
        {
          left: 30,
          top: 30,
          fontSize: 22,
          fill: "#ffffff",
          selectable: false,
          fontWeight: "600"
        }
      );

      canvas.add(txt);
    }
  }, [plan, land]);

  /* =========================================
     EXPORT PNG
  ========================================= */
  const exportPNG = () => {
    const data = fabricRef.current.toDataURL({
      format: "png",
      quality: 1
    });

    const a = document.createElement("a");
    a.href = data;
    a.download = "floorplan.png";
    a.click();
  };

  /* =========================================
     EXPORT PDF
  ========================================= */
  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const img = fabricRef.current.toDataURL({
      format: "png",
      quality: 1
    });

    pdf.addImage(img, "PNG", 10, 10, 277, 190);
    pdf.save("floorplan.pdf");
  };

  /* =========================================
     ZOOM CONTROLS
  ========================================= */
  const changeZoom = (value) => {
    if (!fabricRef.current) return;

    const next = Math.min(2, Math.max(0.5, zoom + value));
    setZoom(next);

    fabricRef.current.setZoom(next);
    fabricRef.current.requestRenderAll();
  };

  const resetZoom = () => {
    setZoom(1);
    fabricRef.current.setZoom(1);
    fabricRef.current.requestRenderAll();
  };

  return (
    <div className="card-glass p-5 rounded-3xl shadow-premium">

      {/* HEADER */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-5">

        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            🏗️ Floor Plan Preview
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Live canvas rendering with export controls
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button onClick={exportPNG} className="btn-primary">
            📥 PNG
          </button>

          <button onClick={exportPDF} className="btn-success">
            📄 PDF
          </button>

          <button
            onClick={() => changeZoom(0.1)}
            className="bg-white/10 text-white px-4 py-2 rounded-xl"
          >
            ➕
          </button>

          <button
            onClick={() => changeZoom(-0.1)}
            className="bg-white/10 text-white px-4 py-2 rounded-xl"
          >
            ➖
          </button>

          <button
            onClick={resetZoom}
            className="bg-white/10 text-white px-4 py-2 rounded-xl"
          >
            🔄
          </button>

          <span
            className={`badge ${editable ? "badge-emerald" : "badge-rose"
              }`}
          >
            {editable ? "✏️ Editable" : "🔒 Locked"}
          </span>
        </div>
      </div>

      {/* CANVAS */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#003b99]">

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="loader-ring"></div>
              <span className="text-white text-sm">Loading Canvas...</span>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-[700px]"
        />
      </div>

      {/* FOOTER */}
      <div className="mt-4 flex justify-between items-center text-sm text-slate-300">
        <span>
          📐 Plot Size: {land.length}m × {land.width}m
        </span>

        <span>
          🔍 Zoom: {(zoom * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}