import * as fabric from "fabric";

/** Pastel palette similar to the reference floor-plan style */
const ROOM_FILL_BY_TYPE = [
  { match: /bedroom/i, fill: "#fde68a" },
  { match: /living/i, fill: "#bfdbfe" },
  { match: /bath/i, fill: "#fecdd3" },
  { match: /kitchen/i, fill: "#bbf7d0" },
  { match: /dining/i, fill: "#a5f3fc" },
  { match: /garage/i, fill: "#e5e7eb" },
  { match: /garden|court/i, fill: "#d9f99d" },
  { match: /counter/i, fill: "#bbf7d0" }
];

/** Type-based pastel fills (reference style); otherwise use API color */
export const fillForRoomType = (type, apiColor) => {
  const t = String(type || "");
  for (const { match, fill } of ROOM_FILL_BY_TYPE) {
    if (match.test(t)) return fill;
  }
  return apiColor || "#e0e7ff";
};

export const initCanvas = (canvasEl, width, height) => {
  const canvas = new fabric.Canvas(canvasEl, {
    backgroundColor: "#ffffff",
    selection: false,
    preserveObjectStacking: true
  });
  canvas.setWidth(width);
  canvas.setHeight(height);
  // Force white background on Fabric's own wrapper div
  if (canvas.wrapperEl) {
    canvas.wrapperEl.style.background = '#ffffff';
  }
  if (canvas.lowerCanvasEl) {
    canvas.lowerCanvasEl.style.background = '#ffffff';
  }
  return canvas;
};

// Scale blueprint so it always fits inside the current canvas size.
export const computePxPerMeter = (canvas, lengthM, widthM, marginPx = 20) => {
  const canvasW = canvas?.getWidth?.() ?? 900;
  const canvasH = canvas?.getHeight?.() ?? 650;
  const len = Number(lengthM) || 0;
  const wid = Number(widthM) || 0;
  if (len > 0 && wid > 0) {
    return Math.min((canvasW - 2 * marginPx) / len, (canvasH - 2 * marginPx) / wid);
  }
  return 40;
};

export const drawGrid = (canvas, unit = 40) => {
  const { width, height } = canvas;
  const lines = [];
  const gridStroke = "#e8e8e8";
  const gridWidth = 0.75;
  for (let i = 0; i <= width; i += unit) {
    lines.push(
      new fabric.Line([i, 0, i, height], {
        stroke: gridStroke,
        strokeWidth: gridWidth,
        selectable: false,
        evented: false
      })
    );
  }
  for (let j = 0; j <= height; j += unit) {
    lines.push(
      new fabric.Line([0, j, width, j], {
        stroke: gridStroke,
        strokeWidth: gridWidth,
        selectable: false,
        evented: false
      })
    );
  }
  lines.forEach((l) => canvas.add(l));
};

const addHatchLines = (canvas, rect, opts) => {
  const { spacingPx = 12, stroke = "#111827", opacity = 0.07 } = opts || {};
  const left = rect.left;
  const top = rect.top;
  const bottom = rect.top + rect.height;
  const right = rect.left + rect.width;

  // Performance guard
  const height = bottom - top;
  const maxLines = 80;
  let linesAdded = 0;

  for (let x = left - height; x < right + height; x += spacingPx) {
    if (linesAdded >= maxLines) break;
    const line = new fabric.Line([x, top, x + height, bottom], {
      stroke,
      strokeWidth: 1,
      opacity,
      selectable: false,
      evented: false,
      clipPath: rect
    });
    line._typeTag = "hatch";
    canvas.add(line);
    linesAdded += 1;
  }
};

const addDimensionLine = (canvas, { x1, y1, x2, y2, text, rotate = 0 }) => {
  const stroke = "#111827";
  const line = new fabric.Line([x1, y1, x2, y2], {
    stroke,
    strokeWidth: 1,
    selectable: false,
    evented: false,
    strokeLineCap: "round"
  });
  line._typeTag = "dimension";
  canvas.add(line);

  const t = new fabric.Text(text, {
    left: (x1 + x2) / 2,
    top: (y1 + y2) / 2,
    originX: "center",
    originY: "center",
    fontSize: 12,
    fontFamily: "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    fill: stroke,
    selectable: false,
    evented: false,
    angle: rotate
  });
  t._typeTag = "dimension";
  canvas.add(t);
};

export const renderPlan = (canvas, plan, editable) => {
  canvas.getObjects().forEach((o) => {
    if (o._typeTag) canvas.remove(o);
  });

  const lenM = plan.meta?.length ?? 0;
  const widM = plan.meta?.width ?? 0;
  const margin = 20;
  const pxPerMeter = computePxPerMeter(canvas, lenM, widM, margin);
  const toPx = (v) => Number(v) * pxPerMeter;

  const outerW = toPx(lenM);
  const outerH = toPx(widM);
  const offsetX = margin;
  const offsetY = margin;

  // Outer frame (technical drawing look)
  const frame = new fabric.Rect({
    left: offsetX,
    top: offsetY,
    width: outerW,
    height: outerH,
    fill: "transparent",
    stroke: "#111827",
    strokeWidth: 2,
    selectable: false,
    evented: false
  });
  frame._typeTag = "frame";
  canvas.add(frame);

  plan.rooms.forEach((r) => {
    const fill = fillForRoomType(r.type, r.color);
    const rect = new fabric.Rect({
      left: offsetX + toPx(r.x),
      top: offsetY + toPx(r.y),
      width: toPx(r.width),
      height: toPx(r.height),
      fill,
      opacity: 0.22,
      stroke: "#111827",
      strokeWidth: 2,
      rx: 0,
      ry: 0,
      hasBorders: editable,
      hasControls: editable,
      selectable: editable
    });
    rect._typeTag = "room";
    rect.roomId = r.id;
    canvas.add(rect);

    // Hatch overlay
    addHatchLines(canvas, rect, { spacingPx: 12, stroke: "#111827", opacity: 0.08 });

    const label = new fabric.Text(String(r.type || ""), {
      left: rect.left + 10,
      top: rect.top + 7,
      fontSize: 11,
      fontFamily: "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      fontWeight: "600",
      fill: "#111827",
      selectable: false,
      evented: false
    });
    label._typeTag = "room";
    canvas.add(label);
  });

  plan.furniture?.forEach((f) => {
    const rect = new fabric.Rect({
      left: offsetX + toPx(f.x),
      top: offsetY + toPx(f.y),
      width: toPx(f.width),
      height: toPx(f.height),
      fill: "#111827",
      stroke: "#111827",
      strokeWidth: 1,
      rx: 0,
      ry: 0,
      opacity: 0.7,
      selectable: editable
    });
    rect._typeTag = "furniture";

    const label = new fabric.Text(String(f.type || ""), {
      left: rect.left + 4,
      top: rect.top + 3,
      fontSize: 9,
      fontFamily: "system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      fill: "#ffffff",
      selectable: false,
      evented: false
    });
    label._typeTag = "furniture";
    canvas.add(rect, label);
  });

  plan.openings?.forEach((o) => {
    const isWindow = o.type === "Window";
    const line = new fabric.Line(
      [
        offsetX + toPx(o.x),
        offsetY + toPx(o.y),
        offsetX + toPx(o.x + o.length),
        offsetY + toPx(o.y)
      ],
      {
        stroke: isWindow ? "#16a34a" : "#dc2626",
        strokeWidth: 3,
        strokeLineCap: "round",
        selectable: false,
        evented: false
      }
    );
    line._typeTag = "opening";
    canvas.add(line);
  });

  // Dimensions (simple technical annotations)
  if (outerW > 0 && outerH > 0) {
    const pad = 10;
    addDimensionLine(canvas, {
      x1: offsetX,
      y1: offsetY + pad,
      x2: offsetX + outerW,
      y2: offsetY + pad,
      text: `${plan.meta?.length ?? 0}m`
    });
    addDimensionLine(canvas, {
      x1: offsetX + pad,
      y1: offsetY,
      x2: offsetX + pad,
      y2: offsetY + outerH,
      text: `${plan.meta?.width ?? 0}m`,
      rotate: -90
    });
  }

  canvas.requestRenderAll();
};
