import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { drawGrid, initCanvas, renderPlan } from "../utils/drawPlan";

export default function CanvasView({ plan, editable, land }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  useEffect(() => {
    const canvas = initCanvas(canvasRef.current, 900, 650);
    fabricRef.current = canvas;
    drawGrid(canvas, 40);
    return () => canvas.dispose();
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

  const exportPNG = () => {
    const data = fabricRef.current.toDataURL({ format: "png" });
    const a = document.createElement("a");
    a.href = data;
    a.download = "homeplanner.png";
    a.click();
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "landscape" });
    const data = fabricRef.current.toDataURL({ format: "png" });
    pdf.addImage(data, "PNG", 10, 10, 270, 180);
    pdf.save("homeplanner.pdf");
  };

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/60 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3 text-sm">
        <button onClick={exportPNG} className="px-3 py-1.5 rounded bg-indigo-600 text-white">
          Export PNG
        </button>
        <button onClick={exportPDF} className="px-3 py-1.5 rounded bg-emerald-600 text-white">
          Export PDF
        </button>
        <span className="ml-auto text-gray-500 dark:text-gray-300">
          Editable: {editable ? "Yes" : "Locked"}
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[650px] rounded border border-dashed border-gray-300" />
    </div>
  );
}
