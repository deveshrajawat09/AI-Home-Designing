import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { drawGrid, initCanvas, renderPlan } from "../utils/drawPlan";

export default function CanvasView({ plan, editable, land }) {
  const containerRef = useRef(null);
  const fabricRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create underlying canvas element
    const canvasEl = document.createElement("canvas");
    containerRef.current.appendChild(canvasEl);
    
    const canvas = initCanvas(canvasEl, 900, 650);
    fabricRef.current = canvas;
    drawGrid(canvas, 40);
    
    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (plan && fabricRef.current) renderPlan(fabricRef.current, plan, editable);
  }, [plan, editable]);

  useEffect(() => {
    if (!plan && fabricRef.current) {
      fabricRef.current.clear();
      drawGrid(fabricRef.current, 40);
      const txt = new fabric.Text(
        `Empty plot ${land.length}m x ${land.width}m`,
        { left: 20, top: 20, fontSize: 16, selectable: false }
      );
      fabricRef.current.add(txt);
    }
  }, [plan, land]);

  const exportPNG = async () => {
    try {
      const data = fabricRef.current.toDataURL({ format: "png" });
      const a = document.createElement("a");
      a.href = data;
      a.download = "homeplanner.png";
      a.click();
      // Optional: Show success feedback
    } catch (error) {
      console.error("PNG export failed:", error);
    }
  };

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape" });
      const data = fabricRef.current.toDataURL({ format: "png" });
      pdf.addImage(data, "PNG", 10, 10, 270, 180);
      pdf.save("homeplanner.pdf");
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-600 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-6 shadow-lg dark:shadow-2xl dark:shadow-black/30 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={exportPNG} 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium text-sm transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            title="Download floor plan as PNG image"
          >
            <span>📥</span>
            <span className="hidden sm:inline">PNG</span>
          </button>
          <button 
            onClick={exportPDF} 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium text-sm transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            title="Download floor plan as PDF document"
          >
            <span>📄</span>
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
        <div className="flex items-center gap-2 ml-auto text-sm">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium ${
            editable 
              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300" 
              : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
          }`}>
            <span className={editable ? "text-lg" : "text-lg"}>{
              editable ? "✏️ Editable" : "🔒 Locked"
            }</span>
          </span>
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="w-full h-[650px] rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-inner bg-white dark:bg-gray-700 overflow-hidden relative" 
      />
    </div>
  );
}
