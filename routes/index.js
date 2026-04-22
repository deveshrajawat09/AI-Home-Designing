import express from "express";
import { asyncHandler, ValidationError, AuthError, NotFoundError } from "../middleware/errorHandler.js";
import { validateEmail, validatePassword, validatePlan, validateId } from "../middleware/validators.js";

const router = express.Router();

/**
 * Authentication Routes
 */
export const createAuthRoutes = (deps) => {
  const { readUsers, writeUsers, bcrypt, jwt, JWT_SECRET, authRateLimiter, loginLimiter } = deps;

  router.post("/signup", authRateLimiter, asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    // Check for existing user
    const users = await readUsers();
    if (users.find(u => u.email === validEmail)) {
      throw new ValidationError("Email already registered");
    }

    // Create new user
    const passwordHash = await bcrypt.hash(validPassword, 10);
    const user = {
      id: Date.now().toString(),
      email: validEmail,
      password: passwordHash,
      role: "user",
      createdAt: new Date().toISOString()
    };

    users.push(user);
    await writeUsers(users);

    // Generate token
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  }));

  router.post("/login", loginLimiter, asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const users = await readUsers();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      throw new AuthError("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthError("Invalid email or password");
    }

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  }));

  return router;
};

/**
 * Plans Routes
 */
export const createPlansRoutes = (deps) => {
  const { readPlans, writePlans, authenticate } = deps;
  const plansRouter = express.Router();

  // Get all plans for user
  plansRouter.get("/", authenticate, asyncHandler(async (req, res) => {
    const plans = await readPlans();
    const userPlans = plans.filter(p => p.userId === req.user.id);

    res.json({
      plans: userPlans.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        meta: p.meta
      }))
    });
  }));

  // Create new plan
  plansRouter.post("/", authenticate, asyncHandler(async (req, res) => {
    const { name, plan, land, description } = req.body;

    // Validate
    if (!name || !plan) {
      throw new ValidationError("name and plan are required");
    }

    validatePlan(plan);

    const plans = await readPlans();
    const newPlan = {
      id: Date.now().toString(),
      userId: req.user.id,
      name,
      description: description || "",
      plan,
      land,
      meta: plan.meta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    plans.push(newPlan);
    await writePlans(plans);

    res.status(201).json({
      success: true,
      plan: newPlan
    });
  }));

  // Get specific plan
  plansRouter.get("/:id", authenticate, asyncHandler(async (req, res) => {
    validateId(req.params.id);
    const plans = await readPlans();
    const plan = plans.find(p => p.id === req.params.id && p.userId === req.user.id);

    if (!plan) {
      throw new NotFoundError("Plan");
    }

    res.json({ plan });
  }));

  // Update plan
  plansRouter.put("/:id", authenticate, asyncHandler(async (req, res) => {
    validateId(req.params.id);
    const { name, plan, description } = req.body;

    if (!name && !plan && !description) {
      throw new ValidationError("At least one field (name, plan, description) is required");
    }

    if (plan) {
      validatePlan(plan);
    }

    const plans = await readPlans();
    const idx = plans.findIndex(p => p.id === req.params.id && p.userId === req.user.id);

    if (idx === -1) {
      throw new NotFoundError("Plan");
    }

    plans[idx] = {
      ...plans[idx],
      ...(name && { name }),
      ...(plan && { plan }),
      ...(description !== undefined && { description }),
      updatedAt: new Date().toISOString()
    };

    await writePlans(plans);
    res.json({ success: true, plan: plans[idx] });
  }));

  // Delete plan
  plansRouter.delete("/:id", authenticate, asyncHandler(async (req, res) => {
    validateId(req.params.id);
    const plans = await readPlans();
    const filtered = plans.filter(p => !(p.id === req.params.id && p.userId === req.user.id));

    if (filtered.length === plans.length) {
      throw new NotFoundError("Plan");
    }

    await writePlans(filtered);
    res.json({ success: true });
  }));

  return plansRouter;
};

export default { createAuthRoutes, createPlansRoutes };
