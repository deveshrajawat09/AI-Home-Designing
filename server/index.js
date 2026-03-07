import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieSession from "cookie-session";
import { nanoid } from "nanoid";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieSession({ name: "hdp-session", keys: [process.env.SESSION_SECRET || "dev"], maxAge: 24 * 60 * 60 * 1000 }));
app.use(passport.initialize());
app.use(passport.session());

const designSchema = new mongoose.Schema({
  slug: { type: String, default: () => nanoid(8), unique: true },
  userId: String,
  items: Array,
  room: Object,
  createdAt: { type: Date, default: Date.now }
});
const Design = mongoose.model("Design", designSchema);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: "/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => done(null, { id: profile.id, name: profile.displayName })
  )
);

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: CLIENT_URL }),
  (req, res) => res.redirect(CLIENT_URL)
);

app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.post("/api/designs", async (req, res) => {
  try {
    const design = await Design.create({ ...req.body, userId: req.user?.id });
    res.json(design);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save design" });
  }
});

app.get("/api/designs/:slug", async (req, res) => {
  const design = await Design.findOne({ slug: req.params.slug });
  if (!design) return res.status(404).json({ error: "Not found" });
  res.json(design);
});

async function start() {
  const mongoUri = process.env.MONGODB_URI || "";
  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } else {
    console.log("MONGODB_URI not set - running in stateless mode");
  }
  app.listen(PORT, () => console.log(`HomeDesigner Pro API on ${PORT}`));
}

start();
