import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { computePxPerMeter, drawGrid, initCanvas, renderPlan } from "../utils/drawPlan";

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const GRID_MARGIN = 20;

/* ── Tiny SVG icon components ──────────────────────── */
const IconZoomIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const IconZoomOut = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);
const IconReset = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);
const IconFullscreen = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);
const IconExitFullscreen = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
    <line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>
  </svg>
);
const IconPNG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);
const IconPDF = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
);

/* ── Tool button ────────────────────────────────────── */
function ToolBtn({ onClick, title, children, variant = "default" }) {
  const variants = {
    default: "bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-white/10 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200",
    primary: "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-500",
    success: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500",
    neutral: "bg-slate-700 text-white border-slate-700 hover:bg-slate-600",
    violet:  "bg-violet-600 text-white border-violet-600 hover:bg-violet-500",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`hp-hover-lift inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold tracking-wide shadow-sm transition-all ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default function CanvasView({ plan, editable, land }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fabricRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

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
    canvas.backgroundColor = "#ffffff";

    const { pxPerMeter } = computeWorldBounds(canvas);
    const gridSize = Math.max(20, Math.min(40, pxPerMeter));
    drawGrid(canvas, gridSize);

    if (plan) {
      renderPlan(canvas, plan, editable);
    } else {
      const text = new fabric.Text(`Empty plot ${land.length}m × ${land.width}m`, {
        left: GRID_MARGIN + 10,
        top: GRID_MARGIN + 10,
        fontSize: 13,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: "600",
        fill: "#64748b",
        selectable: false,
        evented: false
      });

      const frame = new fabric.Rect({
        left: GRID_MARGIN,
        top: GRID_MARGIN,
        width: pxPerMeter * land.length,
        height: pxPerMeter * land.width,
        fill: "rgba(99,102,241,0.03)",
        stroke: "#c7d2fe",
        strokeWidth: 2,
        strokeDashArray: [6, 4],
        selectable: false,
        evented: false
      });

      canvas.add(frame, text);
    }

    canvas.requestRenderAll();
  };

  const resetView = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const { worldWidth, worldHeight } = computeWorldBounds(canvas);
    const canvasW = canvas.getWidth();
    const canvasH = canvas.getHeight();
    const z = Math.min(canvasW / worldWidth, canvasH / worldHeight, 1);
    const tx = (canvasW - worldWidth * z) / 2;
    const ty = (canvasH - worldHeight * z) / 2;

    canvas.setViewportTransform([z, 0, 0, z, tx, ty]);
    canvas.requestRenderAll();
    setZoom(Math.round(z * 100));
  };

  const zoomIn = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const nextZoom = Math.min(canvas.getZoom() + 0.1, MAX_ZOOM);
    const center = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    canvas.zoomToPoint(center, nextZoom);
    setZoom(Math.round(nextZoom * 100));
  };

  const zoomOut = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const nextZoom = Math.max(canvas.getZoom() - 0.1, MIN_ZOOM);
    const center = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2);
    canvas.zoomToPoint(center, nextZoom);
    setZoom(Math.round(nextZoom * 100));
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
    setZoom(Math.round(nextZoom * 100));
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

  useEffect(() => { redrawCanvas(); }, [plan, editable, land.length, land.width]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/8 shadow-sm">
      {/* ── Toolbar ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-white/6 bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur">
        {/* Zoom group */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="hp-hover-lift px-2 py-1.5 bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-white/10 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors border-r border-slate-200 dark:border-white/10"
          >
            <IconZoomOut />
          </button>
          <span className="px-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-white/5 select-none min-w-[44px] text-center">
            {zoom}%
          </span>
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="hp-hover-lift px-2 py-1.5 bg-white/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-white/10 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors border-l border-slate-200 dark:border-white/10"
          >
            <IconZoomIn />
          </button>
        </div>

        <ToolBtn onClick={resetView} title="Reset View" variant="violet">
          <IconReset /> Reset
        </ToolBtn>

        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-0.5" />

        <ToolBtn onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} variant="neutral">
          {isFullscreen ? <IconExitFullscreen /> : <IconFullscreen />}
          {isFullscreen ? "Exit" : "Fullscreen"}
        </ToolBtn>

        <div className="h-4 w-px bg-slate-200 dark:bg-white/10 mx-0.5" />

        <ToolBtn onClick={exportPNG} title="Export as PNG" variant="primary">
          <IconPNG /> PNG
        </ToolBtn>
        <ToolBtn onClick={exportPDF} title="Export as PDF" variant="success">
          <IconPDF /> PDF
        </ToolBtn>

        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium select-none">
          <span className="hidden sm:inline">Scroll to zoom · Drag to pan</span>
        </div>
      </div>

      {/* ── Canvas area ─────────────────────────────── */}
      <div className="relative flex-1">
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: "calc(100vh - 220px)", background: "#fafafa" }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ background: "#ffffff" }}
          />
        </div>
      </div>
    </div>
  );
}
