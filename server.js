import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 5001;
const DATA_PATH = path.join(__dirname, "plans.json");
const DIST_DIR = path.join(__dirname, "client", "dist");

const genAI =
  process.env.GOOGLE_API_KEY &&
  new GoogleGenerativeAI(process.env.GOOGLE_API_KEY).getGenerativeModel({
    model: "gemini-1.0-pro"
  });

const ensureDataFile = async () => {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify([]));
  }
};

const readPlans = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw || "[]");
};

const writePlans = async (plans) => fs.writeFile(DATA_PATH, JSON.stringify(plans, null, 2));

const fallbackPlan = (len, wid) => {
  const scale = 1;
  return {
    meta: { length: len, width: wid, unit: "m", scale },
    rooms: [
      { id: "bed1", type: "Bedroom", x: 1, y: 1, width: 4, height: 3, color: "#fcd34d" },
      { id: "bed2", type: "Bedroom", x: 5.2, y: 1, width: 4, height: 3, color: "#facc15" },
      { id: "bed3", type: "Bedroom", x: 1, y: 4.2, width: 4, height: 3, color: "#fde68a" },
      { id: "living", type: "Living Room", x: 5.2, y: 4.2, width: 5, height: 4, color: "#bfdbfe" },
      { id: "kitchen", type: "Kitchen", x: 1, y: 7.5, width: 3.5, height: 3, color: "#bbf7d0" },
      { id: "dining", type: "Dining", x: 4.7, y: 8, width: 3.5, height: 2.5, color: "#a5f3fc" },
      { id: "bath1", type: "Bathroom", x: 8.7, y: 1, width: 1.8, height: 2, color: "#fecdd3" },
      { id: "bath2", type: "Bathroom", x: 8.9, y: 7, width: 1.8, height: 2, color: "#f9a8d4" },
      { id: "garage", type: "Garage", x: 0.5, y: 10, width: 4.5, height: 3.5, color: "#e5e7eb" },
      { id: "garden", type: "Garden", x: 5.5, y: 10.2, width: 4.5, height: 3.3, color: "#bbf7d0" }
    ],
    furniture: [
      { roomId: "living", type: "Sofa", x: 6, y: 5.2, width: 2, height: 1 },
      { roomId: "living", type: "TV", x: 9.5, y: 5, width: 0.5, height: 1.2 },
      { roomId: "kitchen", type: "Counter", x: 1.2, y: 7.6, width: 3, height: 0.6 },
      { roomId: "bed1", type: "Bed", x: 1.2, y: 1.2, width: 2, height: 1.6 }
    ],
    openings: [
      { type: "Door", from: "living", x: 5.2, y: 4.2, length: 1 },
      { type: "Door", from: "garage", x: 5, y: 10, length: 1 },
      { type: "Window", from: "living", x: 10.2, y: 6, length: 1.2 }
    ],
    legend: [
      { label: "Bedroom", color: "#fcd34d" },
      { label: "Living", color: "#bfdbfe" },
      { label: "Kitchen", color: "#bbf7d0" },
      { label: "Dining", color: "#a5f3fc" },
      { label: "Bath", color: "#fecdd3" },
      { label: "Garage", color: "#e5e7eb" },
      { label: "Garden", color: "#bbf7d0" }
    ]
  };
};

const buildPrompt = ({ length, width, shape, points }) => {
  const shapeText = shape === "irregular" && Array.isArray(points)
    ? `irregular polygon with vertices ${JSON.stringify(points)} (meters, clockwise, closed automatically)`
    : shape || "rectangle";
  return `You are an architect. Generate a compact JSON floor plan for land ${length}m by ${width}m, shape: ${shapeText}.
Rules:
- Return ONLY JSON, no markdown.
- Fields: meta{length,width,unit:"m",scale:1}, rooms[{id,type,x,y,width,height,color}], furniture[{roomId,type,x,y,width,height}], openings[{type,from,x,y,length,orientation:"N|S|E|W"}], legend[{label,color}].
- Coordinates in meters from top-left corner of land; keep rooms inside the shape; respect irregular polygon if provided by snapping rooms to polygon bounds (assume axis-aligned rectangles clipped to polygon).
- Include 2-4 bedrooms, 2 bathrooms, kitchen, living, dining, garage, garden/courtyard, circulation for flow.
- Optimize adjacency (kitchen near dining, garage near entry) and leave doors/windows in openings list.
- Prefer vivid pastel colors per room type.`;
};

const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      const sliced = text.slice(start, end + 1);
      return JSON.parse(sliced);
    }
    throw err;
  }
};

app.post("/generate-plan", async (req, res) => {
  const { length = 10, width = 15, shape = "rectangle", points = [] } = req.body;
  try {
    let plan;
    if (genAI) {
      const prompt = buildPrompt({ length, width, shape, points });
      const result = await genAI.generateContent(prompt);
      const txt = result.response.text().trim();
      plan = safeParseJSON(txt);
    } else {
      plan = fallbackPlan(length, width);
    }
    res.json({ plan });
  } catch (err) {
    console.error("Generation failed", err.message);
    res.status(500).json({ error: "Generation failed", detail: err.message });
  }
});

app.get("/plans", async (_req, res) => {
  const plans = await readPlans();
  res.json({ plans });
});

app.post("/plans", async (req, res) => {
  const { name, plan, land } = req.body;
  if (!name || !plan) return res.status(400).json({ error: "name and plan required" });
  const plans = await readPlans();
  const record = { id: Date.now().toString(), name, plan, land, savedAt: new Date().toISOString() };
  plans.push(record);
  await writePlans(plans);
  res.json({ saved: record });
});

app.delete("/plans/:id", async (req, res) => {
  const plans = await readPlans();
  const filtered = plans.filter((p) => p.id !== req.params.id);
  await writePlans(filtered);
  res.json({ ok: true });
});

// Serve built client if present
app.use(express.static(DIST_DIR));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/generate-plan") || req.path.startsWith("/plans")) return next();
  return res.sendFile(path.join(DIST_DIR, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
