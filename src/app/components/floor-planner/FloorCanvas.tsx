import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FloorElement } from '../../context/AppContext';

export type Tool = 'select' | 'wall' | 'door' | 'window' | 'furniture' | 'label' | 'erase' | 'pan';
export type FurnitureType = 'bed' | 'sofa' | 'table' | 'chair' | 'bathtub' | 'toilet' | 'sink' | 'fridge' | 'desk' | 'tv' | 'wardrobe' | 'dining-table';

interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
}

interface SelectState {
  selectedId: string | null;
  dragOffset: { x: number; y: number } | null;
}

const GRID = 20;
const WALL_THICKNESS = 8;

const snap = (v: number) => Math.round(v / GRID) * GRID;

const FURNITURE_COLORS: Record<FurnitureType, string> = {
  bed: '#93c5fd',
  sofa: '#a5b4fc',
  table: '#d4b896',
  chair: '#fca5a5',
  bathtub: '#6ee7b7',
  toilet: '#e5e7eb',
  sink: '#bae6fd',
  fridge: '#c7d2fe',
  desk: '#fde68a',
  tv: '#374151',
  wardrobe: '#c4b5fd',
  'dining-table': '#d4b896',
};

const FURNITURE_LABELS: Record<FurnitureType, string> = {
  bed: 'Bed',
  sofa: 'Sofa',
  table: 'Table',
  chair: 'Chair',
  bathtub: 'Bathtub',
  toilet: 'WC',
  sink: 'Sink',
  fridge: 'Fridge',
  desk: 'Desk',
  tv: 'TV',
  wardrobe: 'Wardrobe',
  'dining-table': 'Dining',
};

const FURNITURE_SIZES: Record<FurnitureType, { w: number; h: number }> = {
  bed: { w: 80, h: 100 },
  sofa: { w: 120, h: 60 },
  table: { w: 60, h: 60 },
  chair: { w: 40, h: 40 },
  bathtub: { w: 60, h: 100 },
  toilet: { w: 40, h: 60 },
  sink: { w: 40, h: 40 },
  fridge: { w: 40, h: 60 },
  desk: { w: 80, h: 40 },
  tv: { w: 80, h: 20 },
  wardrobe: { w: 80, h: 40 },
  'dining-table': { w: 100, h: 60 },
};

export interface FloorCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  loadElements: (elements: FloorElement[]) => void;
  getElements: () => FloorElement[];
}

interface Props {
  tool: Tool;
  selectedFurniture: FurnitureType | null;
  elements: FloorElement[];
  onElementsChange: (elements: FloorElement[]) => void;
}

export const FloorCanvas = forwardRef<FloorCanvasRef, Props>(function FloorCanvas(
  { tool, selectedFurniture, elements, onElementsChange },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [drawing, setDrawing] = useState<DrawingState>({ isDrawing: false, startX: 0, startY: 0 });
  const [selection, setSelection] = useState<SelectState>({ selectedId: null, dragOffset: null });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });
  const [labelInput, setLabelInput] = useState<{ visible: boolean; x: number; y: number; canvasX: number; canvasY: number } | null>(null);
  const [labelText, setLabelText] = useState('');

  const history = useRef<FloorElement[][]>([[]]);
  const historyIndex = useRef(0);

  const pushHistory = useCallback((elems: FloorElement[]) => {
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push([...elems]);
    historyIndex.current = history.current.length - 1;
  }, []);

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    undo: () => {
      if (historyIndex.current > 0) {
        historyIndex.current--;
        onElementsChange([...history.current[historyIndex.current]]);
      }
    },
    redo: () => {
      if (historyIndex.current < history.current.length - 1) {
        historyIndex.current++;
        onElementsChange([...history.current[historyIndex.current]]);
      }
    },
    clearAll: () => {
      const empty: FloorElement[] = [];
      pushHistory(empty);
      onElementsChange(empty);
    },
    loadElements: (elems: FloorElement[]) => {
      pushHistory(elems);
      onElementsChange([...elems]);
    },
    getElements: () => elements,
  }));

  const getCanvasPos = useCallback((e: React.MouseEvent | MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  }, [pan, zoom]);

  const getSnappedPos = (pos: { x: number; y: number }) => ({
    x: snap(pos.x),
    y: snap(pos.y),
  });

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const startX = (-pan.x / zoom);
    const startY = (-pan.y / zoom);
    const endX = (w - pan.x) / zoom;
    const endY = (h - pan.y) / zoom;
    const gStart = { x: Math.floor(startX / GRID) * GRID, y: Math.floor(startY / GRID) * GRID };

    for (let x = gStart.x; x <= endX; x += GRID) {
      const isMajor = x % (GRID * 5) === 0;
      ctx.strokeStyle = isDark
        ? isMajor ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)'
        : isMajor ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.05)';
      ctx.lineWidth = isMajor ? 0.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = gStart.y; y <= endY; y += GRID) {
      const isMajor = y % (GRID * 5) === 0;
      ctx.strokeStyle = isDark
        ? isMajor ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)'
        : isMajor ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.05)';
      ctx.lineWidth = isMajor ? 0.5 : 0.5;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }, [pan, zoom, isDark]);

  const drawWall = (ctx: CanvasRenderingContext2D, el: any, selected: boolean) => {
    const dx = el.x2 - el.x1;
    const dy = el.y2 - el.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;
    const nx = -dy / len;
    const ny = dx / len;
    const t = (el.thickness || WALL_THICKNESS) / 2;

    ctx.beginPath();
    ctx.moveTo(el.x1 + nx * t, el.y1 + ny * t);
    ctx.lineTo(el.x2 + nx * t, el.y2 + ny * t);
    ctx.lineTo(el.x2 - nx * t, el.y2 - ny * t);
    ctx.lineTo(el.x1 - nx * t, el.y1 - ny * t);
    ctx.closePath();
    ctx.fillStyle = selected
      ? '#6366f1'
      : isDark ? '#d1d5db' : '#374151';
    ctx.fill();
    if (selected) {
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  };

  const drawDoor = (ctx: CanvasRenderingContext2D, el: any, selected: boolean) => {
    const w = el.width || 50;
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate((el.angle || 0) * Math.PI / 180);

    // Door frame
    ctx.strokeStyle = selected ? '#6366f1' : isDark ? '#f3f4f6' : '#1f2937';
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -4, w, 4);

    // Door swing arc
    ctx.beginPath();
    ctx.arc(-w / 2, -4, w, 0, Math.PI / 2);
    ctx.strokeStyle = selected ? '#818cf8' : 'rgba(99,102,241,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Door panel
    ctx.fillStyle = isDark ? 'rgba(165,180,252,0.3)' : 'rgba(99,102,241,0.2)';
    ctx.fillRect(-w / 2, -4, w, 4);
    ctx.restore();
  };

  const drawWindow = (ctx: CanvasRenderingContext2D, el: any, selected: boolean) => {
    const w = el.width || 60;
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.rotate((el.angle || 0) * Math.PI / 180);

    ctx.fillStyle = isDark ? 'rgba(186,230,253,0.4)' : 'rgba(147,197,253,0.5)';
    ctx.strokeStyle = selected ? '#6366f1' : isDark ? '#bae6fd' : '#3b82f6';
    ctx.lineWidth = 2;
    ctx.fillRect(-w / 2, -3, w, 6);
    ctx.strokeRect(-w / 2, -3, w, 6);

    // Glass lines
    ctx.strokeStyle = isDark ? 'rgba(186,230,253,0.6)' : 'rgba(147,197,253,0.8)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(0, 3);
    ctx.stroke();

    ctx.restore();
  };

  const drawFurniture = (ctx: CanvasRenderingContext2D, el: any, selected: boolean) => {
    const { w, h, subtype, rotation, color } = el;
    ctx.save();
    ctx.translate(el.x + w / 2, el.y + h / 2);
    ctx.rotate(((rotation || 0) * Math.PI) / 180);

    const fc = color || FURNITURE_COLORS[subtype as FurnitureType] || '#cbd5e1';

    ctx.fillStyle = fc + (isDark ? 'dd' : 'bb');
    ctx.strokeStyle = selected ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)');
    ctx.lineWidth = selected ? 2 : 1;

    // Draw shape
    if (subtype === 'bathtub') {
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 20, 6);
      ctx.fill();
    } else if (subtype === 'toilet') {
      ctx.beginPath();
      ctx.ellipse(0, h / 6, w / 2 - 2, h / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isDark ? '#374151' : '#f3f4f6';
      ctx.fillRect(-w / 2, -h / 2, w, h / 3);
      ctx.strokeRect(-w / 2, -h / 2, w, h / 3);
    } else if (subtype === 'sofa') {
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();
      // cushions
      const cw = (w - 16) / 3;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.roundRect(-w / 2 + 8 + i * (cw + 4), -h / 2 + 8, cw, h - 16, 4);
        ctx.fill();
      }
    } else if (subtype === 'bed') {
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 4);
      ctx.fill();
      ctx.stroke();
      // pillow
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 8, -h / 2 + 8, w - 16, 24, 4);
      ctx.fill();
      // blanket
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.roundRect(-w / 2 + 6, -h / 2 + 36, w - 12, h - 48, 4);
      ctx.fill();
    } else if (subtype === 'tv') {
      ctx.fillStyle = isDark ? '#111827' : '#1f2937';
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = isDark ? '#1d4ed8' : '#3b82f6';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
    } else {
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 4);
      ctx.fill();
      ctx.stroke();
    }

    // Label
    if (subtype && w > 30) {
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
      ctx.font = `${Math.min(11, w / 5)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(FURNITURE_LABELS[subtype as FurnitureType] || subtype, 0, 0);
    }

    if (selected) {
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
      ctx.setLineDash([]);
    }

    ctx.restore();
  };

  const drawLabel = (ctx: CanvasRenderingContext2D, el: any, selected: boolean) => {
    ctx.font = `${el.fontSize || 12}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = selected ? '#6366f1' : (el.color || (isDark ? '#9ca3af' : '#6b7280'));
    ctx.fillText(el.text, el.x, el.y);

    if (selected) {
      const m = ctx.measureText(el.text);
      const w = m.width + 8;
      const h = (el.fontSize || 12) + 8;
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(el.x - w / 2, el.y - h / 2, w, h);
      ctx.setLineDash([]);
    }
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = isDark ? '#030712' : '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Grid
    drawGrid(ctx, w, h);

    // Elements
    elements.forEach(el => {
      const selected = selection.selectedId === el.id;
      if (el.type === 'wall') drawWall(ctx, el, selected);
      else if (el.type === 'door') drawDoor(ctx, el, selected);
      else if (el.type === 'window') drawWindow(ctx, el, selected);
      else if (el.type === 'furniture') drawFurniture(ctx, el, selected);
      else if (el.type === 'label') drawLabel(ctx, el, selected);
    });

    // Drawing preview
    if (drawing.isDrawing) {
      const { startX: sx, startY: sy } = drawing;
      const mx = snap((mousePos.x - pan.x) / zoom);
      const my = snap((mousePos.y - pan.y) / zoom);

      if (tool === 'wall') {
        const preview: FloorElement = {
          id: 'preview', type: 'wall',
          x1: snap(sx), y1: snap(sy),
          x2: mx, y2: my,
          thickness: WALL_THICKNESS,
        };
        ctx.globalAlpha = 0.6;
        drawWall(ctx, preview, false);
        ctx.globalAlpha = 1;

        // Dimension label
        const dx = mx - snap(sx);
        const dy = my - snap(sy);
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 10) {
          ctx.font = '11px Inter, sans-serif';
          ctx.fillStyle = '#6366f1';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${(len / 20).toFixed(1)}m`, (snap(sx) + mx) / 2, (snap(sy) + my) / 2 - 12);
        }
      }

      // Snap cursor indicator
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
    }

    // Cursor crosshair for wall tool
    if ((tool === 'wall' || tool === 'door' || tool === 'window') && !drawing.isDrawing) {
      const mx = snap((mousePos.x - pan.x) / zoom);
      const my = snap((mousePos.y - pan.y) / zoom);
      ctx.strokeStyle = isDark ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.4)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(mx, -1000);
      ctx.lineTo(mx, 10000);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1000, my);
      ctx.lineTo(10000, my);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();

    // Scale indicator
    ctx.fillStyle = isDark ? 'rgba(99,102,241,0.8)' : 'rgba(99,102,241,0.7)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Scale: 1 cell = 50cm | Zoom: ${Math.round(zoom * 100)}%`, 12, h - 12);
  }, [elements, isDark, zoom, pan, drawing, mousePos, selection, tool, drawGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      render();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    return () => observer.disconnect();
  }, [render]);

  useEffect(() => { render(); }, [render]);

  const findElementAt = useCallback((x: number, y: number): FloorElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      if (el.type === 'wall') {
        const dx = el.x2 - el.x1;
        const dy = el.y2 - el.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) continue;
        const t = ((x - el.x1) * dx + (y - el.y1) * dy) / (len * len);
        const tc = Math.max(0, Math.min(1, t));
        const px = el.x1 + tc * dx;
        const py = el.y1 + tc * dy;
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (dist < (el.thickness || WALL_THICKNESS) + 4) return el;
      } else if (el.type === 'furniture') {
        if (x >= el.x - 4 && x <= el.x + el.w + 4 && y >= el.y - 4 && y <= el.y + el.h + 4) return el;
      } else if (el.type === 'door' || el.type === 'window') {
        const w = el.width || 50;
        if (Math.abs(x - el.x) < w / 2 + 8 && Math.abs(y - el.y) < 20) return el;
      } else if (el.type === 'label') {
        if (Math.abs(x - el.x) < 60 && Math.abs(y - el.y) < 16) return el;
      }
    }
    return null;
  }, [elements]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rawPos = getCanvasPos(e);
    const pos = getSnappedPos(rawPos);

    if (tool === 'pan' || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y });
      return;
    }

    if (tool === 'select') {
      const found = findElementAt(rawPos.x, rawPos.y);
      if (found) {
        setSelection({
          selectedId: found.id,
          dragOffset: {
            x: found.type === 'furniture' ? rawPos.x - found.x : rawPos.x - (found.x1 || found.x),
            y: found.type === 'furniture' ? rawPos.y - found.y : rawPos.y - (found.y1 || found.y),
          },
        });
      } else {
        setSelection({ selectedId: null, dragOffset: null });
      }
      return;
    }

    if (tool === 'erase') {
      const found = findElementAt(rawPos.x, rawPos.y);
      if (found) {
        const newEls = elements.filter(el => el.id !== found.id);
        pushHistory(newEls);
        onElementsChange(newEls);
      }
      return;
    }

    if (tool === 'wall') {
      setDrawing({ isDrawing: true, startX: pos.x, startY: pos.y });
      return;
    }

    if (tool === 'door') {
      const newEl: FloorElement = {
        id: `door-${Date.now()}`,
        type: 'door',
        x: pos.x, y: pos.y,
        width: 60, angle: 0,
      };
      const newEls = [...elements, newEl];
      pushHistory(newEls);
      onElementsChange(newEls);
      return;
    }

    if (tool === 'window') {
      const newEl: FloorElement = {
        id: `win-${Date.now()}`,
        type: 'window',
        x: pos.x, y: pos.y,
        width: 60, angle: 0,
      };
      const newEls = [...elements, newEl];
      pushHistory(newEls);
      onElementsChange(newEls);
      return;
    }

    if (tool === 'furniture' && selectedFurniture) {
      const sz = FURNITURE_SIZES[selectedFurniture];
      const newEl: FloorElement = {
        id: `furn-${Date.now()}`,
        type: 'furniture',
        subtype: selectedFurniture,
        x: pos.x - sz.w / 2, y: pos.y - sz.h / 2,
        w: sz.w, h: sz.h,
        rotation: 0,
        color: FURNITURE_COLORS[selectedFurniture],
      };
      const newEls = [...elements, newEl];
      pushHistory(newEls);
      onElementsChange(newEls);
      return;
    }

    if (tool === 'label') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      setLabelInput({
        visible: true,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        canvasX: pos.x,
        canvasY: pos.y,
      });
      setLabelText('');
    }
  }, [tool, pan, zoom, elements, selectedFurniture, findElementAt, pushHistory, onElementsChange, getCanvasPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0), y: e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0) });

    if (isPanning) {
      setPan({
        x: panStart.panX + e.clientX - panStart.x,
        y: panStart.panY + e.clientY - panStart.y,
      });
      return;
    }

    if (tool === 'select' && selection.selectedId && selection.dragOffset) {
      const rawPos = getCanvasPos(e);
      const pos = getSnappedPos(rawPos);
      const newEls = elements.map(el => {
        if (el.id !== selection.selectedId) return el;
        if (el.type === 'furniture') {
          return { ...el, x: pos.x - (selection.dragOffset!.x > 0 ? selection.dragOffset!.x : el.w / 2), y: pos.y - (selection.dragOffset!.y > 0 ? selection.dragOffset!.y : el.h / 2) };
        } else if (el.type === 'wall') {
          const ox1 = el.x1; const oy1 = el.y1;
          const dx = snap(rawPos.x) - snap(selection.dragOffset!.x + ox1);
          const dy = snap(rawPos.y) - snap(selection.dragOffset!.y + oy1);
          return { ...el, x1: el.x1 + dx, y1: el.y1 + dy, x2: el.x2 + dx, y2: el.y2 + dy };
        } else {
          return { ...el, x: pos.x - selection.dragOffset!.x, y: pos.y - selection.dragOffset!.y };
        }
      });
      onElementsChange(newEls);
    }
  }, [isPanning, panStart, tool, selection, elements, getCanvasPos, onElementsChange]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isPanning) { setIsPanning(false); return; }
    if (selection.dragOffset) {
      setSelection(prev => ({ ...prev, dragOffset: null }));
      pushHistory(elements);
      return;
    }

    if (tool === 'wall' && drawing.isDrawing) {
      const rawPos = getCanvasPos(e);
      const pos = getSnappedPos(rawPos);
      const sx = snap(drawing.startX);
      const sy = snap(drawing.startY);
      const dist = Math.sqrt((pos.x - sx) ** 2 + (pos.y - sy) ** 2);
      if (dist > 10) {
        const newEl: FloorElement = {
          id: `wall-${Date.now()}`,
          type: 'wall',
          x1: sx, y1: sy,
          x2: pos.x, y2: pos.y,
          thickness: WALL_THICKNESS,
        };
        const newEls = [...elements, newEl];
        pushHistory(newEls);
        onElementsChange(newEls);
      }
      setDrawing({ isDrawing: false, startX: 0, startY: 0 });
    }
  }, [isPanning, drawing, tool, elements, selection.dragOffset, pushHistory, onElementsChange, getCanvasPos]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(3, Math.max(0.2, prev * factor)));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selection.selectedId && document.activeElement?.tagName !== 'INPUT') {
        const newEls = elements.filter(el => el.id !== selection.selectedId);
        pushHistory(newEls);
        onElementsChange(newEls);
        setSelection({ selectedId: null, dragOffset: null });
      }
    }
    if (e.key === 'Escape') {
      setDrawing({ isDrawing: false, startX: 0, startY: 0 });
      setSelection({ selectedId: null, dragOffset: null });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      if (historyIndex.current > 0) {
        historyIndex.current--;
        onElementsChange([...history.current[historyIndex.current]]);
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      if (historyIndex.current < history.current.length - 1) {
        historyIndex.current++;
        onElementsChange([...history.current[historyIndex.current]]);
      }
    }

    // Rotate selected furniture
    if (e.key === 'r' || e.key === 'R') {
      if (selection.selectedId) {
        const newEls = elements.map(el => {
          if (el.id === selection.selectedId && el.type === 'furniture') {
            return { ...el, rotation: ((el.rotation || 0) + 90) % 360 };
          }
          return el;
        });
        pushHistory(newEls);
        onElementsChange(newEls);
      }
    }
  }, [selection.selectedId, elements, pushHistory, onElementsChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLabelSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && labelInput && labelText.trim()) {
      const newEl: FloorElement = {
        id: `label-${Date.now()}`,
        type: 'label',
        x: labelInput.canvasX,
        y: labelInput.canvasY,
        text: labelText,
        fontSize: 13,
        color: isDark ? '#9ca3af' : '#6b7280',
      };
      const newEls = [...elements, newEl];
      pushHistory(newEls);
      onElementsChange(newEls);
      setLabelInput(null);
      setLabelText('');
    }
    if (e.key === 'Escape') {
      setLabelInput(null);
      setLabelText('');
    }
  };

  const getCursor = () => {
    if (isPanning || tool === 'pan') return 'grab';
    if (selection.dragOffset) return 'grabbing';
    if (tool === 'wall' || tool === 'door' || tool === 'window') return 'crosshair';
    if (tool === 'erase') return 'cell';
    if (tool === 'select') return 'default';
    if (tool === 'furniture') return 'copy';
    if (tool === 'label') return 'text';
    return 'default';
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { setIsPanning(false); setDrawing(d => ({ ...d, isDrawing: false })); }}
        onWheel={handleWheel}
        style={{ cursor: getCursor(), display: 'block', width: '100%', height: '100%' }}
      />

      {/* Label input overlay */}
      {labelInput && (
        <input
          type="text"
          value={labelText}
          onChange={e => setLabelText(e.target.value)}
          onKeyDown={handleLabelSubmit}
          onBlur={() => setLabelInput(null)}
          autoFocus
          placeholder="Room name (Enter to confirm)"
          style={{
            position: 'absolute',
            left: labelInput.x,
            top: labelInput.y,
            transform: 'translateX(-50%)',
            zIndex: 50,
          }}
          className="px-2 py-1 text-sm bg-indigo-900/90 text-indigo-100 border border-indigo-500 rounded-lg outline-none backdrop-blur-sm min-w-40"
        />
      )}
    </div>
  );
});
