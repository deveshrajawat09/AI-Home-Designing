/**
 * @file validators.js
 * @description Request validation middleware and utility functions
 */

import { ValidationError } from "./errorHandler.js";

// ── Email Validation ─────────────────────────────────────────
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

// ── Password Validation ──────────────────────────────────────
export const validatePassword = (password) => {
  if (!password || typeof password !== "string") return false;
  return password.length >= 8;
};

// ── Plan Dimensions Validation ───────────────────────────────
export const validateDimensions = (length, width) => {
  const errors = [];

  if (!Number.isFinite(length) || length < 5 || length > 200) {
    errors.push("Length must be a number between 5m and 200m");
  }

  if (!Number.isFinite(width) || width < 5 || width > 200) {
    errors.push("Width must be a number between 5m and 200m");
  }

  return { valid: errors.length === 0, errors };
};

// ── Plan Shape Validation ────────────────────────────────────
export const validateShape = (shape, points) => {
  const errors = [];
  const validShapes = ["rectangle", "irregular"];

  if (!validShapes.includes(shape)) {
    errors.push(`Shape must be one of: ${validShapes.join(", ")}`);
  }

  if (shape === "irregular") {
    if (!Array.isArray(points) || points.length < 3) {
      errors.push("Irregular shape requires at least 3 vertices");
    }

    if (Array.isArray(points)) {
      for (let i = 0; i < points.length; i++) {
        if (!Array.isArray(points[i]) || points[i].length !== 2) {
          errors.push(`Vertex ${i} must be [x, y] coordinates`);
        }
        const [x, y] = points[i];
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
          errors.push(`Vertex ${i} coordinates must be numbers`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

// ── Plan Name Validation ─────────────────────────────────────
export const validatePlanName = (name) => {
  const errors = [];

  if (!name || typeof name !== "string") {
    errors.push("Plan name must be a string");
  } else if (name.trim().length === 0) {
    errors.push("Plan name cannot be empty");
  } else if (name.length > 100) {
    errors.push("Plan name must not exceed 100 characters");
  }

  return { valid: errors.length === 0, errors };
};

// ── Request Body Validation Middleware ───────────────────────
/**
 * Validate signup request
 */
export const validateSignupRequest = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push({ field: "email", message: "Email is required" });
  else if (!validateEmail(email)) errors.push({ field: "email", message: "Invalid email format" });

  if (!password) errors.push({ field: "password", message: "Password is required" });
  else if (!validatePassword(password))
    errors.push({ field: "password", message: "Password must be at least 8 characters" });

  if (errors.length > 0) {
    throw new ValidationError("Signup validation failed", errors);
  }

  next();
};

/**
 * Validate login request
 */
export const validateLoginRequest = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) errors.push({ field: "email", message: "Email is required" });
  else if (!validateEmail(email)) errors.push({ field: "email", message: "Invalid email format" });

  if (!password) errors.push({ field: "password", message: "Password is required" });

  if (errors.length > 0) {
    throw new ValidationError("Login validation failed", errors);
  }

  next();
};

/**
 * Validate generate-plan request
 */
export const validateGeneratePlanRequest = (req, res, next) => {
  const { length = 10, width = 15, shape = "rectangle", points = [] } = req.body;
  const errors = [];

  // Validate dimensions
  const dimValidation = validateDimensions(length, width);
  if (!dimValidation.valid) {
    errors.push(...dimValidation.errors.map(msg => ({ field: "dimensions", message: msg })));
  }

  // Validate shape
  const shapeValidation = validateShape(shape, points);
  if (!shapeValidation.valid) {
    errors.push(...shapeValidation.errors.map(msg => ({ field: "shape", message: msg })));
  }

  if (errors.length > 0) {
    throw new ValidationError("Plan generation validation failed", errors);
  }

  next();
};

/**
 * Validate save-plan request
 */
export const validateSavePlanRequest = (req, res, next) => {
  const { name, plan } = req.body;
  const errors = [];

  // Validate name
  const nameValidation = validatePlanName(name);
  if (!nameValidation.valid) {
    errors.push(...nameValidation.errors.map(msg => ({ field: "name", message: msg })));
  }

  // Validate plan object
  if (!plan || typeof plan !== "object") {
    errors.push({ field: "plan", message: "Plan data is required and must be an object" });
  }

  if (errors.length > 0) {
    throw new ValidationError("Save plan validation failed", errors);
  }

  next();
};

// ── Common Validation Patterns ───────────────────────────────
export class ValidationPatterns {
  /**
   * UUID v4 format validation
   */
  static isValidUUID(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  }

  /**
   * Hex color validation
   */
  static isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  /**
   * ISO date validation
   */
  static isValidIsoDate(date) {
    return !isNaN(Date.parse(date));
  }

  /**
   * Coordinate validation (for room positions)
   */
  static isValidCoordinate(x, y, maxX, maxY) {
    return (
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      x >= 0 &&
      y >= 0 &&
      x <= maxX &&
      y <= maxY
    );
  }

  /**
   * Validate room object
   */
  static isValidRoom(room, maxLength, maxWidth) {
    if (!room || typeof room !== "object") return false;

    const required = ["id", "type", "x", "y", "width", "height", "color"];
    if (!required.every(key => key in room)) return false;

    if (typeof room.id !== "string") return false;
    if (typeof room.type !== "string") return false;
    if (room.width < 1 || room.height < 1) return false;
    if (!this.isValidHexColor(room.color)) return false;
    if (!this.isValidCoordinate(room.x, room.y, maxLength, maxWidth)) return false;

    // Check if room fits within land
    if (room.x + room.width > maxLength || room.y + room.height > maxWidth) return false;

    return true;
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(str, maxLength = 255) {
    return str.trim().slice(0, maxLength).replace(/[<>]/g, "");
  }

  /**
   * Validate JSON structure
   */
  static isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
}

// ── Batch Validation ─────────────────────────────────────────
export class BatchValidator {
  /**
   * Validate array of items
   */
  static validateArray(items, validatorFn, options = {}) {
    const { maxItems = 1000, minItems = 0 } = options;
    const errors = [];

    if (!Array.isArray(items)) {
      return { valid: false, errors: [{ message: "Input must be an array" }] };
    }

    if (items.length < minItems) {
      errors.push({ message: `Minimum ${minItems} items required` });
    }

    if (items.length > maxItems) {
      errors.push({ message: `Maximum ${maxItems} items allowed` });
    }

    items.forEach((item, index) => {
      const itemErrors = validatorFn(item);
      if (itemErrors && itemErrors.length > 0) {
        errors.push({
          index,
          errors: itemErrors,
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
