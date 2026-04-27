/**
 * @file schema.js
 * @description Formal database schema definitions and validators
 * Ensures data integrity and type safety across the application
 */

// ── User Schema ──────────────────────────────────────────────
export const userSchema = {
  id: { type: "string", required: true, unique: true },
  email: { type: "string", required: true, unique: true, format: "email" },
  password: { type: "string", required: true, minLength: 8 },
  createdAt: { type: "string", required: true, format: "iso-date" },
  updatedAt: { type: "string", required: false, format: "iso-date" },
};

// ── Plan Schema ──────────────────────────────────────────────
export const planSchema = {
  id: { type: "string", required: true, unique: true },
  userId: { type: "string", required: true, references: "users" },
  name: { type: "string", required: true, maxLength: 100 },
  plan: { type: "object", required: true },
  land: { type: "object", required: false },
  savedAt: { type: "string", required: true, format: "iso-date" },
  updatedAt: { type: "string", required: false, format: "iso-date" },
};

// ── Plan Content Schema (nested) ─────────────────────────────
export const planContentSchema = {
  meta: {
    type: "object",
    required: true,
    fields: {
      length: { type: "number", required: true, min: 5, max: 200 },
      width: { type: "number", required: true, min: 5, max: 200 },
      unit: { type: "string", required: true, enum: ["m", "ft"] },
      scale: { type: "number", required: true },
    },
  },
  rooms: {
    type: "array",
    required: true,
    items: {
      type: "object",
      fields: {
        id: { type: "string", required: true },
        type: { type: "string", required: true },
        x: { type: "number", required: true },
        y: { type: "number", required: true },
        width: { type: "number", required: true, min: 1 },
        height: { type: "number", required: true, min: 1 },
        color: { type: "string", required: true, format: "hex-color" },
      },
    },
  },
  furniture: { type: "array", required: false, items: { type: "object" } },
  openings: { type: "array", required: false, items: { type: "object" } },
  legend: { type: "array", required: false, items: { type: "object" } },
};

// ── Validator Class ──────────────────────────────────────────
export class SchemaValidator {
  /**
   * Validate data against schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Schema definition
   * @returns {Object} { valid: boolean, errors: Array }
   */
  static validate(data, schema) {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = data[key];

      // Check required fields
      if (rules.required && (value === undefined || value === null)) {
        errors.push({ field: key, message: `${key} is required` });
        continue;
      }

      // Skip validation if field is not provided and not required
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push({
          field: key,
          message: `${key} must be of type ${rules.type}, got ${typeof value}`,
        });
        continue;
      }

      // Format validation
      if (rules.format === "email" && !this.isValidEmail(value)) {
        errors.push({ field: key, message: `${key} is not a valid email` });
      }

      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field: key,
          message: `${key} must be at least ${rules.minLength} characters`,
        });
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field: key,
          message: `${key} must be at most ${rules.maxLength} characters`,
        });
      }

      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push({
          field: key,
          message: `${key} must be one of: ${rules.enum.join(", ")}`,
        });
      }

      // ISO date validation
      if (rules.format === "iso-date" && !this.isValidIsoDate(value)) {
        errors.push({
          field: key,
          message: `${key} must be a valid ISO date`,
        });
      }

      // Hex color validation
      if (rules.format === "hex-color" && !this.isValidHexColor(value)) {
        errors.push({
          field: key,
          message: `${key} must be a valid hex color`,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Validate ISO date format
   */
  static isValidIsoDate(date) {
    return !isNaN(Date.parse(date));
  }

  /**
   * Validate hex color format
   */
  static isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  /**
   * Validate plan dimensions
   */
  static validateDimensions(length, width) {
    const errors = [];
    if (length < 5 || length > 200) {
      errors.push("Length must be between 5m and 200m");
    }
    if (width < 5 || width > 200) {
      errors.push("Width must be between 5m and 200m");
    }
    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate plan data structure
   */
  static validatePlanData(plan) {
    const errors = [];

    if (!plan.meta) errors.push("Plan must have 'meta' field");
    if (!plan.rooms || !Array.isArray(plan.rooms)) errors.push("Plan must have 'rooms' array");

    // Validate no room overlaps
    if (plan.rooms && Array.isArray(plan.rooms)) {
      for (let i = 0; i < plan.rooms.length; i++) {
        for (let j = i + 1; j < plan.rooms.length; j++) {
          if (this.doRoomsOverlap(plan.rooms[i], plan.rooms[j])) {
            errors.push(
              `Rooms ${plan.rooms[i].id} and ${plan.rooms[j].id} overlap`
            );
          }
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if two rooms overlap
   */
  static doRoomsOverlap(room1, room2) {
    const r1 = {
      left: room1.x,
      right: room1.x + room1.width,
      top: room1.y,
      bottom: room1.y + room1.height,
    };
    const r2 = {
      left: room2.x,
      right: room2.x + room2.width,
      top: room2.y,
      bottom: room2.y + room2.height,
    };

    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
  }
}

// ── Data Integrity Checks ────────────────────────────────────
export class DataIntegrityChecker {
  /**
   * Check data integrity after loading
   */
  static async checkDataIntegrity(data, schema) {
    const issues = [];

    // Check for required fields
    for (const record of data) {
      const validation = SchemaValidator.validate(record, schema);
      if (!validation.valid) {
        issues.push({
          record: record.id || record.email,
          errors: validation.errors,
        });
      }
    }

    return {
      isIntact: issues.length === 0,
      issues,
    };
  }

  /**
   * Sanitize data to match schema
   */
  static sanitizeRecord(record, schema) {
    const sanitized = {};

    for (const [key, rules] of Object.entries(schema)) {
      if (key in record) {
        sanitized[key] = record[key];
      } else if (rules.required) {
        // Provide defaults for required fields
        if (rules.type === "string") sanitized[key] = "";
        else if (rules.type === "number") sanitized[key] = 0;
        else if (rules.type === "array") sanitized[key] = [];
        else if (rules.type === "object") sanitized[key] = {};
      }
    }

    return sanitized;
  }
}
