import * as fabric from "fabric";

/* ===============================
   INIT CANVAS (Blueprint Style)
================================= */
export const initCanvas = (canvasEl, width, height) => {
  const canvas = new fabric.Canvas(canvasEl, {
    backgroundColor: "#003b99",
    selection: false,
    preserveObjectStacking: true
  });

  canvas.setWidth(width);
  canvas.setHeight(height);

  return canvas;
};

/* ===============================
   GRID DRAW
================================= */
export const drawGrid = (canvas, unit = 25) => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  const lines = [];

  for (let x = 0; x <= width; x += unit) {
    lines.push(
      new fabric.Line([x, 0, x, height], {
        stroke: "rgba(255,255,255,0.08)",
        selectable: false,
        evented: false
      })
    );
  }

  for (let y = 0; y <= height; y += unit) {
    lines.push(
      new fabric.Line([0, y, width, y], {
        stroke: "rgba(255,255,255,0.08)",
        selectable: false,
        evented: false
      })
    );
  }

  canvas.add(...lines);
};

/* ===============================
   MAIN PLAN RENDER
================================= */
export const renderPlan = (canvas, plan, editable = false) => {
  const old = canvas.getObjects().filter((o) => o._typeTag);
  old.forEach((o) => canvas.remove(o));

  const scale = plan.meta?.scale || 1;
  const toPx = (v) => v * 40 * scale;

  drawBorder(canvas);
  drawTitle(canvas, plan.meta?.title || "GROUND FLOOR PLAN");

  /* ===============================
     ROOMS
  ================================= */
  plan.rooms?.forEach((room) => {
    const left = toPx(room.x);
    const top = toPx(room.y);
    const width = toPx(room.width);
    const height = toPx(room.height);

    const rect = new fabric.Rect({
      left,
      top,
      width,
      height,
      fill: "transparent",
      stroke: "#ffffff",
      strokeWidth: 2,
      selectable: editable,
      hasControls: editable,
      hasBorders: editable
    });

    rect._typeTag = "room";

    const label = new fabric.Text(room.type.toUpperCase(), {
      left: left + width / 2,
      top: top + height / 2,
      originX: "center",
      originY: "center",
      fontSize: 16,
      fill: "#ffffff",
      fontFamily: "Arial",
      selectable: false
    });

    label._typeTag = "room";

    canvas.add(rect, label);
  });

  /* ===============================
     FURNITURE
  ================================= */
  plan.furniture?.forEach((item) => {
    const rect = new fabric.Rect({
      left: toPx(item.x),
      top: toPx(item.y),
      width: toPx(item.width),
      height: toPx(item.height),
      fill: "transparent",
      stroke: "#ffffff",
      strokeWidth: 1.5,
      selectable: editable
    });

    rect._typeTag = "furniture";

    const label = new fabric.Text(item.type, {
      left: rect.left + rect.width / 2,
      top: rect.top + rect.height / 2,
      originX: "center",
      originY: "center",
      fontSize: 10,
      fill: "#ffffff",
      selectable: false
    });

    label._typeTag = "furniture";

    canvas.add(rect, label);
  });

  /* ===============================
     DOORS / WINDOWS
  ================================= */
  plan.openings?.forEach((o) => {
    const line = new fabric.Line(
      [toPx(o.x), toPx(o.y), toPx(o.x + o.length), toPx(o.y)],
      {
        stroke: "#ffffff",
        strokeWidth: 3,
        selectable: false
      }
    );

    line._typeTag = "opening";

    canvas.add(line);
  });

  canvas.requestRenderAll();
};

/* ===============================
   BORDER
================================= */
const drawBorder = (canvas) => {
  const rect = new fabric.Rect({
    left: 15,
    top: 15,
    width: canvas.getWidth() - 30,
    height: canvas.getHeight() - 30,
    fill: "transparent",
    stroke: "#ffffff",
    strokeWidth: 2,
    selectable: false
  });

  rect._typeTag = "border";
  canvas.add(rect);
};

/* ===============================
   TITLE
================================= */
const drawTitle = (canvas, title) => {
  const txt = new fabric.Text(title, {
    left: canvas.getWidth() / 2,
    top: 30,
    originX: "center",
    fontSize: 28,
    fill: "#ffffff",
    fontWeight: "bold",
    selectable: false
  });

  txt._typeTag = "title";

  canvas.add(txt);
};