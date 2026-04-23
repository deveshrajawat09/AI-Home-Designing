import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Security Middleware ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));

// ── Rate Limiting ────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many generation requests, slow down." },
});

// ── Constants ────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
const DATA_PATH = path.join(__dirname, "plans.json");
const USERS_PATH = path.join(__dirname, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";
const DIST_DIR = path.join(__dirname, "client", "dist");
const SALT_ROUNDS = 12;

// ── Gemini AI Setup (upgraded to 1.5-flash) ─────────────────
const genAI =
  process.env.GOOGLE_API_KEY &&
  new GoogleGenerativeAI(process.env.GOOGLE_API_KEY).getGenerativeModel({
    model: "gemini-1.5-flash",
  });

// ── File Helpers ─────────────────────────────────────────────
const ensureFile = async (filePath, defaultVal = "[]") => {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, defaultVal);
  }
};

const readJSON = async (filePath, defaultVal = []) => {
  await ensureFile(filePath, JSON.stringify(defaultVal));
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw || JSON.stringify(defaultVal));
  } catch {
    return defaultVal;
  }
};

const writeJSON = async (filePath, data) =>
  fs.writeFile(filePath, JSON.stringify(data, null, 2));

const readPlans = () => readJSON(DATA_PATH, []);
const writePlans = (plans) => writeJSON(DATA_PATH, plans);
const readUsers = () => readJSON(USERS_PATH, []);
const writeUsers = (users) => writeJSON(USERS_PATH, users);

// ── Input Validation Helpers ─────────────────────────────────
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password && password.length >= 8;

// ── Auth: Signup ─────────────────────────────────────────────
app.post("/api/signup", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });
    if (!validateEmail(email))
      return res.status(400).json({ error: "Invalid email format." });
    if (!validatePassword(password))
      return res.status(400).json({ error: "Password must be at least 8 characters." });

    const users = await readUsers();
    if (users.find((u) => u.email === email.toLowerCase()))
      return res.status(409).json({ error: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await writeUsers(users);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("[signup] Error:", err);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

// ── Auth: Login ──────────────────────────────────────────────
app.post("/api/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const users = await readUsers();
    const user = users.find((u) => u.email === email.toLowerCase());

    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    // Support legacy plain-text passwords (migrate on login)
    let passwordMatch = false;
    if (user.password.startsWith("$2")) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      passwordMatch = user.password === password;
      if (passwordMatch) {
        // Migrate to hashed password
        user.password = await bcrypt.hash(password, SALT_ROUNDS);
        await writeUsers(users);
      }
    }

    if (!passwordMatch)
      return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("[login] Error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ── Auth Middleware ──────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication required." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ error: "Session expired. Please login again." });
    return res.status(401).json({ error: "Invalid token." });
  }
};

// ── Fallback Floor Plan ──────────────────────────────────────
const fallbackPlan = (len, wid) => ({
  meta: { length: len, width: wid, unit: "m", scale: 1 },
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
    { id: "garden", type: "Garden", x: 5.5, y: 10.2, width: 4.5, height: 3.3, color: "#bbf7d0" },
  ],
  furniture: [
    { roomId: "living", type: "Sofa", x: 6, y: 5.2, width: 2, height: 1 },
    { roomId: "living", type: "TV", x: 9.5, y: 5, width: 0.5, height: 1.2 },
    { roomId: "kitchen", type: "Counter", x: 1.2, y: 7.6, width: 3, height: 0.6 },
    { roomId: "bed1", type: "Bed", x: 1.2, y: 1.2, width: 2, height: 1.6 },
  ],
  openings: [
    { type: "Door", from: "living", x: 5.2, y: 4.2, length: 1 },
    { type: "Door", from: "garage", x: 5, y: 10, length: 1 },
    { type: "Window", from: "living", x: 10.2, y: 6, length: 1.2 },
  ],
  legend: [
    { label: "Bedroom", color: "#fcd34d" },
    { label: "Living", color: "#bfdbfe" },
    { label: "Kitchen", color: "#bbf7d0" },
    { label: "Dining", color: "#a5f3fc" },
    { label: "Bath", color: "#fecdd3" },
    { label: "Garage", color: "#e5e7eb" },
    { label: "Garden", color: "#bbf7d0" },
  ],
});

// ── Build AI Prompt ──────────────────────────────────────────
const buildPrompt = ({ length, width, shape, points }) => {
  const shapeText =
    shape === "irregular" && Array.isArray(points)
      ? `irregular polygon with vertices ${JSON.stringify(points)} (meters, clockwise, closed automatically)`
      : shape || "rectangle";
  return `You are a professional architect. Generate a detailed JSON floor plan for a land plot of ${length}m by ${width}m, shape: ${shapeText}.
STRICT RULES:
- Return ONLY valid JSON, no markdown, no comments, no explanation.
- Schema: { meta:{length,width,unit:"m",scale:1}, rooms:[{id,type,x,y,width,height,color}], furniture:[{roomId,type,x,y,width,height}], openings:[{type,from,x,y,length,orientation:"N|S|E|W"}], legend:[{label,color}] }
- All coordinates in meters from top-left; all rooms must fit inside the land dimensions.
- Include: 2-4 bedrooms, 2 bathrooms, kitchen, living room, dining, garage, garden/courtyard.
- Optimize adjacency: kitchen near dining, master bedroom away from garage, good circulation.
- Leave corridor/hallway space between rooms for doors.
- Use vivid pastel colors unique to each room type.
- Ensure no two rooms overlap.`;
};

// ── Safe JSON Parse ──────────────────────────────────────────
const safeParseJSON = (text) => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end !== -1) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error("AI returned invalid JSON.");
  }
};

// ── Generate Plan ────────────────────────────────────────────
app.post("/generate-plan", authenticate, generateLimiter, async (req, res) => {
  const { length = 10, width = 15, shape = "rectangle", points = [] } = req.body;

  // Input validation
  if (length < 5 || length > 200 || width < 5 || width > 200)
    return res.status(400).json({ error: "Dimensions must be between 5m and 200m." });

  try {
    let plan;
    if (genAI) {
      const prompt = buildPrompt({ length, width, shape, points });
      const result = await genAI.generateContent(prompt);
      const txt = result.response.text().trim();
      plan = safeParseJSON(txt);
    } else {
      console.warn("[generate-plan] No GOOGLE_API_KEY found, using fallback plan.");
      plan = fallbackPlan(length, width);
    }
    res.json({ plan });
  } catch (err) {
    console.error("[generate-plan]", err.message);
    // On AI failure, fall back gracefully
    res.json({ plan: fallbackPlan(length, width), warning: "AI unavailable, showing sample plan." });
  }
});

// ── Plans: List (user-specific) ──────────────────────────────
app.get("/plans", authenticate, async (req, res) => {
  try {
    const plans = await readPlans();
    const userPlans = plans.filter((p) => p.userId === req.user.id);
    res.json({ plans: userPlans });
  } catch (err) {
    console.error("[GET /plans]", err.message);
    res.status(500).json({ error: "Failed to load plans." });
  }
});

// ── Plans: Save (user-specific) ──────────────────────────────
app.post("/plans", authenticate, async (req, res) => {
  try {
    const { name, plan, land } = req.body;
    if (!name || !plan)
      return res.status(400).json({ error: "Plan name and data are required." });
    if (typeof name !== "string" || name.trim().length === 0)
      return res.status(400).json({ error: "Plan name cannot be empty." });

    const plans = await readPlans();
    const record = {
      id: Date.now().toString(),
      userId: req.user.id,
      name: name.trim().slice(0, 100),
      plan,
      land,
      savedAt: new Date().toISOString(),
    };
    plans.push(record);
    await writePlans(plans);
    res.status(201).json({ saved: record });
  } catch (err) {
    console.error("[POST /plans]", err.message);
    res.status(500).json({ error: "Failed to save plan." });
  }
});

// ── Plans: Delete (user-specific) ────────────────────────────
app.delete("/plans/:id", authenticate, async (req, res) => {
  try {
    const plans = await readPlans();
    const target = plans.find((p) => p.id === req.params.id);
    if (!target) return res.status(404).json({ error: "Plan not found." });
    if (target.userId !== req.user.id)
      return res.status(403).json({ error: "You do not have permission to delete this plan." });
    const filtered = plans.filter((p) => p.id !== req.params.id);
    await writePlans(filtered);
    res.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /plans/:id]", err.message);
    res.status(500).json({ error: "Failed to delete plan." });
  }
});

// ── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiEnabled: !!genAI,
    timestamp: new Date().toISOString(),
  });
});

// ── Serve Built Client ────────────────────────────────────────
app.use(express.static(DIST_DIR));
app.get("*", (req, res, next) => {
  if (
    req.path.startsWith("/generate-plan") ||
    req.path.startsWith("/plans") ||
    req.path.startsWith("/api")
  ) {
    return next();
  }
  return res.sendFile(path.join(DIST_DIR, "index.html"), (err) => {
    if (err) next();
  });
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`   AI: ${genAI ? "Gemini 1.5 Flash enabled" : "Fallback mode (no API key)"}`);
});
