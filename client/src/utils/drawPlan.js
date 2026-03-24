import * as fabric from "fabric";

export const initCanvas = (canvasEl, width, height) => {
  const canvas = new fabric.Canvas(canvasEl, {
    backgroundColor: "white",
    selection: false,
    preserveObjectStacking: true
  });
  canvas.setWidth(width);
  canvas.setHeight(height);
  return canvas;
};

export const drawGrid = (canvas, unit = 40) => {
  const { width, height } = canvas;
  const lines = [];
  for (let i = 0; i < width; i += unit) {
    lines.push(
      new fabric.Line([i, 0, i, height], {
        stroke: "#e5e7eb",
        selectable: false
      })
    );
  }
  for (let j = 0; j < height; j += unit) {
    lines.push(
      new fabric.Line([0, j, width, j], {
        stroke: "#e5e7eb",
        selectable: false
      })
    );
  }
  lines.forEach((l) => canvas.add(l));
};

export const renderPlan = (canvas, plan, editable) => {
  canvas.getObjects().forEach((o) => {
    if (o._typeTag) canvas.remove(o);
  });

  const scale = plan.meta?.scale || 1;
  const toPx = (v) => v * 40 * scale;

  plan.rooms.forEach((r) => {
    const rect = new fabric.Rect({
      left: toPx(r.x),
      top: toPx(r.y),
      width: toPx(r.width),
      height: toPx(r.height),
      fill: r.color || "#c7d2fe",
      stroke: "#111827",
      strokeWidth: 1,
      rx: 4,
      ry: 4,
      hasBorders: editable,
      hasControls: editable,
      selectable: editable
    });
    rect._typeTag = "room";
    rect.roomId = r.id;
    const label = new fabric.Text(r.type, {
      left: rect.left + 6,
      top: rect.top + 6,
      fontSize: 12,
      fill: "#111827",
      selectable: false
    });
    label._typeTag = "room";
    canvas.add(rect, label);
  });

  plan.furniture?.forEach((f) => {
    const rect = new fabric.Rect({
      left: toPx(f.x),
      top: toPx(f.y),
      width: toPx(f.width),
      height: toPx(f.height),
      fill: "#1f2937",
      opacity: 0.6,
      selectable: editable
    });
    rect._typeTag = "furniture";
    const label = new fabric.Text(f.type, {
      left: rect.left + 2,
      top: rect.top + 2,
      fontSize: 10,
      fill: "#f9fafb",
      selectable: false
    });
    label._typeTag = "furniture";
    canvas.add(rect, label);
  });

  plan.openings?.forEach((o) => {
    const line = new fabric.Line(
      [toPx(o.x), toPx(o.y), toPx(o.x + o.length), toPx(o.y)],
      {
        stroke: o.type === "Window" ? "#22c55e" : "#ef4444",
        strokeWidth: 3,
        selectable: false
      }
    );
    line._typeTag = "opening";
    canvas.add(line);
  });

  canvas.requestRenderAll();
};
