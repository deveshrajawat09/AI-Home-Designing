import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(helmet());

const PORT = process.env.PORT || 5001;
const DATA_PATH = path.join(__dirname, "plans.json");
const USERS_PATH = path.join(__dirname, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const DIST_DIR = path.join(__dirname, "client", "dist");

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." }
});

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

const ensureUsersFile = async () => {
  try {
    await fs.access(USERS_PATH);
  } catch {
    await fs.writeFile(USERS_PATH, JSON.stringify([]));
  }
};

const readUsers = async () => {
  await ensureUsersFile();
  const raw = await fs.readFile(USERS_PATH, "utf-8");
  return JSON.parse(raw || "[]");
};

const writeUsers = async (users) => fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));

const getUserRole = (user) => {
  if (user?.role === "admin") return "admin";
  // Backward-compatible default for existing seeded admin account.
  if (user?.email === "admin@example.com") return "admin";
  return "user";
};

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  role: getUserRole(user)
});

const inferCreatedAtFromId = (id) => {
  const ts = Number(id);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  const iso = new Date(ts).toISOString();
  return iso === "Invalid Date" ? null : iso;
};

app.post("/api/signup", authRateLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  const users = await readUsers();
  if (users.find(u => u.email === email)) return res.status(400).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now().toString(),
    email,
    password: passwordHash,
    role: "user"
  };
  users.push(user);
  await writeUsers(users);
  const role = getUserRole(user);
  const token = jwt.sign({ id: user.id, email: user.email, role }, JWT_SECRET);
  res.json({ token, user: publicUser(user) });
});

app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  const users = await readUsers();

  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const stored = user.password;
  const looksHashed = typeof stored === "string" && stored.startsWith("$2");
  const ok = looksHashed ? await bcrypt.compare(password, stored) : stored === password;

  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  // One-time migration: if old users are stored with plain-text passwords,
  // re-hash them after successful login.
  if (!looksHashed) {
    user.password = await bcrypt.hash(password, 10);
    await writeUsers(users);
  }

  const role = getUserRole(user);
  const token = jwt.sign({ id: user.id, email: user.email, role }, JWT_SECRET);
  res.json({ token, user: publicUser(user) });
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

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

app.post("/generate-plan", authenticate, async (req, res) => {
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

app.get("/plans", authenticate, async (_req, res) => {
  const plans = await readPlans();
  res.json({ plans });
});

app.post("/plans", authenticate, async (req, res) => {
  const { name, plan, land } = req.body;
  if (!name || !plan) return res.status(400).json({ error: "name and plan required" });
  const plans = await readPlans();
  const record = { id: Date.now().toString(), name, plan, land, savedAt: new Date().toISOString() };
  plans.push(record);
  await writePlans(plans);
  res.json({ saved: record });
});

app.delete("/plans/:id", authenticate, async (req, res) => {
  const plans = await readPlans();
  const filtered = plans.filter((p) => p.id !== req.params.id);
  await writePlans(filtered);
  res.json({ ok: true });
});

app.get("/api/admin/stats", authenticate, requireAdmin, async (_req, res) => {
  const users = await readUsers();
  const plans = await readPlans();
  const totalUsers = users.length;
  const adminUsers = users.filter((u) => getUserRole(u) === "admin").length;
  const normalUsers = totalUsers - adminUsers;
  res.json({
    stats: {
      totalUsers,
      adminUsers,
      normalUsers,
      totalPlans: plans.length
    }
  });
});

app.get("/api/admin/users", authenticate, requireAdmin, async (_req, res) => {
  const users = await readUsers();
  res.json({ users: users.map(publicUser) });
});

app.patch("/api/admin/users/:id/role", authenticate, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ error: "Role must be admin or user" });
  }

  const users = await readUsers();
  const idx = users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });

  const target = users[idx];
  const targetCurrentRole = getUserRole(target);
  if (targetCurrentRole === role) {
    return res.json({ user: publicUser({ ...target, role }) });
  }

  // Prevent last-admin lockout.
  if (targetCurrentRole === "admin" && role !== "admin") {
    const adminCount = users.filter((u) => getUserRole(u) === "admin").length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Cannot remove role from the last admin" });
    }
  }

  users[idx] = { ...target, role };
  await writeUsers(users);
  return res.json({ user: publicUser(users[idx]) });
});

app.delete("/api/admin/users/:id", authenticate, requireAdmin, async (req, res) => {
  const users = await readUsers();
  const target = users.find((u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: "User not found" });

  if (target.id === req.user.id) {
    return res.status(400).json({ error: "You cannot delete your own account" });
  }

  const targetRole = getUserRole(target);
  if (targetRole === "admin") {
    const adminCount = users.filter((u) => getUserRole(u) === "admin").length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: "Cannot delete the last admin" });
    }
  }

  const filtered = users.filter((u) => u.id !== req.params.id);
  await writeUsers(filtered);
  return res.json({ ok: true });
});

app.get("/api/admin/activity", authenticate, requireAdmin, async (_req, res) => {
  const users = await readUsers();
  const plans = await readPlans();

  const userEvents = users
    .map((u) => ({
      type: "user",
      message: `User account: ${u.email}`,
      at: inferCreatedAtFromId(u.id)
    }))
    .filter((e) => e.at);

  const planEvents = plans
    .map((p) => ({
      type: "plan",
      message: `Plan saved: ${p.name || "Untitled"}`,
      at: p.savedAt || null
    }))
    .filter((e) => e.at);

  const recent = [...planEvents, ...userEvents]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 8);

  res.json({ recent });
});

// Serve built client if present
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

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
