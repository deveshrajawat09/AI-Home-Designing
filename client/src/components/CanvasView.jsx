import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { computePxPerMeter, drawGrid, initCanvas, renderPlan } from "../utils/drawPlan";

export default function CanvasView({ plan, editable, land }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  useEffect(() => {
    const canvas = initCanvas(canvasRef.current, 900, 650);
    fabricRef.current = canvas;
    const margin = 20;
    const pxPerMeter = computePxPerMeter(canvas, land.length, land.width, margin);
    // Draw a reference grid under the blueprint – keep cells between 20–40px
    const gridSize = Math.max(20, Math.min(40, pxPerMeter));
    drawGrid(canvas, gridSize);
    return () => canvas.dispose();
  }, []);

  useEffect(() => {
    if (plan && fabricRef.current) renderPlan(fabricRef.current, plan, editable);
  }, [plan, editable]);

  useEffect(() => {
    if (!plan && fabricRef.current) {
      fabricRef.current.clear();
      const canvas = fabricRef.current;
      const margin = 20;
      const pxPerMeter = computePxPerMeter(canvas, land.length, land.width, margin);
      const toPx = (v) => Number(v) * pxPerMeter;
      // Re-add the grid after clearing the canvas
      const gridSize = Math.max(20, Math.min(40, pxPerMeter));
      drawGrid(canvas, gridSize);
      const txt = new fabric.Text(
        `Empty plot ${land.length}m x ${land.width}m`,
        {
          left: margin + 10,
          top: margin + 10,
          fontSize: 14,
          fontFamily: "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          fontWeight: "600",
          fill: "#374151",
          selectable: false,
          evented: false
        }
      );
      const frame = new fabric.Rect({
        left: margin,
        top: margin,
        width: toPx(land.length),
        height: toPx(land.width),
        fill: "transparent",
        stroke: "#111827",
        strokeWidth: 2,
        selectable: false,
        evented: false
      });
      fabricRef.current.add(frame, txt);
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3 text-sm">
        <button
          onClick={exportPNG}
          className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3v10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 7l4-4 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 14v6h14v-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Export PNG
        </button>
        <button
          onClick={exportPDF}
          className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M7 3h7l3 3v15H7V3Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M14 3v4h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M9 13h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 17h4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Export PDF
        </button>
        <span className="ml-auto text-gray-500">
          Editable: {editable ? "Yes" : "Locked"}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[650px] rounded border border-dashed border-gray-300 bg-transparent"
      />
    </div>
  );
}
