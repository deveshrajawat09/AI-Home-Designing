import * as fabric from "fabric";

export const initCanvas = (canvasEl, width, height) => {
  const canvas = new fabric.Canvas(canvasEl, {
    backgroundColor: "#1e3a8a", // Blueprint blue
    selection: false,
    preserveObjectStacking: true
  });
  canvas.setWidth(width);
  canvas.setHeight(height);
  return canvas;
};

export const drawGrid = (canvas, unit = 40) => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  const lines = [];
  for (let i = 0; i < width; i += unit) {
    lines.push(
      new fabric.Line([i, 0, i, height], {
        stroke: "rgba(255, 255, 255, 0.15)",
        selectable: false
      })
    );
  }
  for (let j = 0; j < height; j += unit) {
    lines.push(
      new fabric.Line([0, j, width, j], {
        stroke: "rgba(255, 255, 255, 0.15)",
        selectable: false
      })
    );
  }
  if (lines.length > 0) {
    canvas.add(...lines);
  }
};

export const renderPlan = (canvas, plan, editable) => {
  const oldObjects = canvas.getObjects().filter((o) => o._typeTag);
  oldObjects.forEach((o) => canvas.remove(o));

  const scale = plan.meta?.scale || 1;
  const toPx = (v) => v * 40 * scale;

  // Draw plot boundary
  if (plan.meta) {
    const w = toPx(plan.meta.width);
    const h = toPx(plan.meta.length);
    const plot = new fabric.Rect({
      left: 0,
      top: 0,
      width: w,
      height: h,
      fill: "transparent",
      stroke: "#ffffff",
      strokeWidth: 3,
      selectable: false
    });
    canvas.add(plot);

    const widthText = new fabric.Text(`${plan.meta.width}m`, {
      left: w / 2,
      top: -20,
      originX: "center",
      fontSize: 14,
      fill: "#ffffff",
      selectable: false
    });
    const lengthText = new fabric.Text(`${plan.meta.length}m`, {
      left: -20,
      top: h / 2,
      originY: "center",
      angle: -90,
      fontSize: 14,
      fill: "#ffffff",
      selectable: false
    });
    canvas.add(widthText, lengthText);
  }

  plan.rooms?.forEach((r) => {
    const rect = new fabric.Rect({
      left: toPx(r.x),
      top: toPx(r.y),
      width: toPx(r.width),
      height: toPx(r.height),
      fill: "rgba(255, 255, 255, 0.02)",
      stroke: "#ffffff",
      strokeWidth: 2,
      hasBorders: editable,
      hasControls: editable,
      selectable: editable
    });
    rect._typeTag = "room";
    rect.roomId = r.id;
    const labelText = `${r.type.toUpperCase()}\n${r.width}m x ${r.height}m`;
    const label = new fabric.Text(labelText, {
      left: toPx(r.x) + toPx(r.width) / 2,
      top: toPx(r.y) + toPx(r.height) / 2,
      originX: "center",
      originY: "center",
      fontSize: 12,
      fontFamily: "monospace",
      fill: "#ffffff",
      textAlign: "center",
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
      fill: "transparent",
      stroke: "#ffffff",
      strokeWidth: 1,
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
        stroke: "#ffffff",
        strokeWidth: o.type === "Window" ? 2 : 4,
        strokeDashArray: o.type === "Window" ? [4, 2] : null,
        selectable: false
      }
    );
    line._typeTag = "opening";
    canvas.add(line);
  });

  canvas.requestRenderAll();
};
