import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { computePxPerMeter, drawGrid, initCanvas, renderPlan } from "../utils/drawPlan";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const GRID_MARGIN = 20;

export default function CanvasView({ plan, editable, land }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fabricRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getDimensions = () => {
    const length = plan?.meta?.length ?? land.length;
    const width = plan?.meta?.width ?? land.width;
    return { length, width };
  };

  const computeWorldBounds = (canvas) => {
    const { length, width } = getDimensions();
    const pxPerMeter = computePxPerMeter(canvas, length, width, GRID_MARGIN);
    return {
      pxPerMeter,
      worldWidth: pxPerMeter * length + GRID_MARGIN * 2,
      worldHeight: pxPerMeter * width + GRID_MARGIN * 2,
      length,
      width
    };
  };

  const redrawCanvas = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = "#f8fafc";

    const { pxPerMeter } = computeWorldBounds(canvas);
    const gridSize = Math.max(60, Math.min(100, pxPerMeter * 1.5));
    drawGrid(canvas, gridSize);

    if (plan) {
      renderPlan(canvas, plan, editable);
    }

    canvas.requestRenderAll();
  };

  const resetView = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const { worldWidth, worldHeight } = computeWorldBounds(canvas);
    const canvasW = canvas.getWidth();
    const canvasH = canvas.getHeight();
    const zoom = Math.min(canvasW / worldWidth, canvasH / worldHeight, 1);
    const tx = (canvasW - worldWidth * zoom) / 2;
    const ty = (canvasH - worldHeight * zoom) / 2;

    canvas.setViewportTransform([zoom, 0, 0, zoom, tx, ty]);
    canvas.requestRenderAll();
  };

  const zoomIn = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const nextZoom = Math.min(canvas.getZoom() + 0.1, MAX_ZOOM);
    const center = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    canvas.zoomToPoint(center, nextZoom);
  };

  const zoomOut = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const nextZoom = Math.max(canvas.getZoom() - 0.1, MIN_ZOOM);
    const center = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    canvas.zoomToPoint(center, nextZoom);
  };

  const toggleFullscreen = async () => {
    const wrapper = containerRef.current;
    if (!wrapper) return;

    if (!document.fullscreenElement) {
      await wrapper.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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

  const handleWheel = (opt) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    opt.e.preventDefault();
    opt.e.stopPropagation();

    const delta = opt.e.deltaY;
    const currentZoom = canvas.getZoom();
    const nextZoom = Math.min(Math.max(currentZoom * (delta > 0 ? 0.9 : 1.1), MIN_ZOOM), MAX_ZOOM);
    const pointer = canvas.getPointer(opt.e);
    canvas.zoomToPoint(new fabric.Point(pointer.x, pointer.y), nextZoom);
  };

  useEffect(() => {
    const wrapper = containerRef.current;
    const canvasElement = canvasRef.current;
    if (!wrapper || !canvasElement) return;

    const canvas = initCanvas(canvasElement, wrapper.clientWidth || 900, wrapper.clientHeight || 650);
    fabricRef.current = canvas;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const startDrag = (opt) => {
      if (!opt.target) {
        isDragging = true;
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
        canvas.defaultCursor = "grabbing";
      }
    };

    const drag = (opt) => {
      if (!isDragging) return;
      const e = opt.e;
      const vpt = canvas.viewportTransform;
      vpt[4] += e.clientX - lastX;
      vpt[5] += e.clientY - lastY;
      canvas.setViewportTransform(vpt);
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.requestRenderAll();
    };

    const endDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      canvas.defaultCursor = "grab";
    };

    canvas.on("mouse:down", startDrag);
    canvas.on("mouse:move", drag);
    canvas.on("mouse:up", endDrag);
    canvas.on("mouse:out", endDrag);
    canvas.on("mouse:wheel", handleWheel);
    canvas.defaultCursor = "grab";

    redrawCanvas();
    resetView();

    const observer = new ResizeObserver(() => {
      canvas.setWidth(Math.max(wrapper.clientWidth, 320));
      canvas.setHeight(Math.max(wrapper.clientHeight, 320));
      resetView();
    });

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      canvas.off("mouse:down", startDrag);
      canvas.off("mouse:move", drag);
      canvas.off("mouse:up", endDrag);
      canvas.off("mouse:out", endDrag);
      canvas.off("mouse:wheel", handleWheel);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [plan, editable, land.length, land.width]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
        <button
          onClick={zoomIn}
          className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white shadow-sm hover:bg-teal-500"
        >
          Zoom In
        </button>
        <button
          onClick={zoomOut}
          className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white shadow-sm hover:bg-teal-500"
        >
          Zoom Out
        </button>
        <button
          onClick={resetView}
          className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-600 text-white shadow-sm hover:bg-slate-500"
        >
          Reset View
        </button>
        <button
          onClick={toggleFullscreen}
          className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white shadow-sm hover:bg-slate-700"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
        <button
          onClick={exportPNG}
          className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-500"
        >
          Export PNG
        </button>
        <button
          onClick={exportPDF}
          className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-700 text-white shadow-sm hover:bg-emerald-600"
        >
          Export PDF
        </button>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="w-full"
          style={{ minHeight: "calc(100vh - 180px)", background: "#f1f5f9" }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded border border-dashed border-slate-300"
            style={{ background: "#f8fafc" }}
          />
        </div>
      </div>
    </div>
  );
}
