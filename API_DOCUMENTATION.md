/**
 * @file API_DOCUMENTATION.md
 * @description Complete API Documentation for Home Planner Backend
 */

# API Documentation

## Overview

The Home Planner API is a RESTful service for managing floor plans and user authentication. It provides endpoints for user registration, authentication, and floor plan generation/management.

**Base URL:** `http://localhost:5001`

**API Version:** 2.0

---

## Authentication

### Overview

All protected endpoints require a JWT (JSON Web Token) passed via the `Authorization` header.

### Token Format

```
Authorization: Bearer <token>
```

### Token Expiration

Tokens expire after 7 days. Users must login again to obtain a new token.

---

## Response Format

### Success Response

```json
{
  "data": { /* response payload */ },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "statusCode": 400,
  "timestamp": "2025-01-15T10:30:00Z",
  "details": [] // Optional: validation errors
}
```

---

## Endpoints

### 1. Authentication Endpoints

#### POST `/api/signup`

Create a new user account.

**Rate Limit:** 20 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- Email: Valid email format required
- Password: Minimum 8 characters required

**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1642177800000",
    "email": "user@example.com"
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Email and password are required |
| 400 | VALIDATION_ERROR | Invalid email format |
| 400 | VALIDATION_ERROR | Password must be at least 8 characters |
| 409 | CONFLICT | An account with this email already exists |
| 500 | INTERNAL_ERROR | Signup failed |

**Example:**
```bash
curl -X POST http://localhost:5001/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MySecurePass123"
  }'
```

---

#### POST `/api/login`

Authenticate a user and receive a JWT token.

**Rate Limit:** 20 requests per 15 minutes per IP

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1642177800000",
    "email": "user@example.com"
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Email and password are required |
| 401 | AUTHENTICATION_ERROR | Invalid email or password |
| 500 | INTERNAL_ERROR | Login failed |

**Example:**
```bash
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MySecurePass123"
  }'
```

---

### 2. Plan Generation Endpoints

#### POST `/generate-plan`

Generate an AI-powered floor plan.

**Authentication:** Required ✓

**Rate Limit:** 10 requests per minute per user

**Request Body:**
```json
{
  "length": 15,
  "width": 20,
  "shape": "rectangle",
  "points": []
}
```

**Parameters:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| length | number | Yes | 5-200 | Land length in meters |
| width | number | Yes | 5-200 | Land width in meters |
| shape | string | Yes | "rectangle", "irregular" | Land shape |
| points | array | No | - | Vertices for irregular shapes (only if shape="irregular") |

**Response (200 OK):**
```json
{
  "plan": {
    "meta": {
      "length": 15,
      "width": 20,
      "unit": "m",
      "scale": 1
    },
    "rooms": [
      {
        "id": "bed1",
        "type": "Bedroom",
        "x": 1,
        "y": 1,
        "width": 4,
        "height": 3,
        "color": "#fcd34d"
      }
    ],
    "furniture": [],
    "openings": [],
    "legend": []
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Dimensions must be between 5m and 200m |
| 401 | AUTHENTICATION_ERROR | Authentication required |
| 429 | RATE_LIMITED | Too many generation requests |
| 500 | INTERNAL_ERROR | Plan generation failed |

**Example:**
```bash
curl -X POST http://localhost:5001/generate-plan \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "length": 15,
    "width": 20,
    "shape": "rectangle"
  }'
```

---

### 3. Plan Management Endpoints

#### GET `/plans`

Retrieve all saved plans for the authenticated user.

**Authentication:** Required ✓

**Response (200 OK):**
```json
{
  "plans": [
    {
      "id": "1642177800001",
      "userId": "1642177800000",
      "name": "My First Home",
      "plan": { /* plan object */ },
      "land": { /* land dimensions */ },
      "savedAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | AUTHENTICATION_ERROR | Authentication required |
| 500 | INTERNAL_ERROR | Failed to load plans |

**Example:**
```bash
curl -X GET http://localhost:5001/plans \
  -H "Authorization: Bearer <token>"
```

---

#### POST `/plans`

Save a new floor plan.

**Authentication:** Required ✓

**Request Body:**
```json
{
  "name": "My Dream House",
  "plan": { /* plan object from /generate-plan */ },
  "land": {
    "length": 15,
    "width": 20,
    "shape": "rectangle"
  }
}
```

**Parameters:**

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| name | string | Yes | 1-100 chars | Plan name |
| plan | object | Yes | - | Plan data from generation |
| land | object | No | - | Land dimensions metadata |

**Response (201 Created):**
```json
{
  "saved": {
    "id": "1642177800001",
    "userId": "1642177800000",
    "name": "My Dream House",
    "plan": { /* plan object */ },
    "land": { /* land object */ },
    "savedAt": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Plan name and data are required |
| 400 | VALIDATION_ERROR | Plan name cannot be empty |
| 401 | AUTHENTICATION_ERROR | Authentication required |
| 500 | INTERNAL_ERROR | Failed to save plan |

**Example:**
```bash
curl -X POST http://localhost:5001/plans \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Dream House",
    "plan": { /* plan object */ },
    "land": {"length": 15, "width": 20}
  }'
```

---

#### DELETE `/plans/:id`

Delete a specific plan (only by owner).

**Authentication:** Required ✓

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Plan ID to delete |

**Response (200 OK):**
```json
{
  "ok": true,
  "message": "Plan deleted successfully"
}
```

**Error Responses:**

| Status | Code | Message |
|--------|------|---------|
| 401 | AUTHENTICATION_ERROR | Authentication required |
| 403 | AUTHORIZATION_ERROR | You do not have permission to delete this plan |
| 404 | NOT_FOUND | Plan not found |
| 500 | INTERNAL_ERROR | Failed to delete plan |

**Example:**
```bash
curl -X DELETE http://localhost:5001/plans/1642177800001 \
  -H "Authorization: Bearer <token>"
```

---

### 4. Utility Endpoints

#### GET `/api/health`

Health check endpoint.

**Authentication:** Not required

**Response (200 OK):**
```json
{
  "status": "ok",
  "aiEnabled": true,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST creating a resource |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Input validation failed |
| AUTHENTICATION_ERROR | 401 | Auth required or failed |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource doesn't exist |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| INVALID_TOKEN | 401 | JWT invalid |
| TOKEN_EXPIRED | 401 | JWT expired |

---

## Rate Limiting

- **Auth Endpoints:** 20 requests per 15 minutes per IP
- **Plan Generation:** 10 requests per minute per user
- **Other Endpoints:** No limit

Response includes `RateLimit-*` headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Time when limit resets (Unix timestamp)

---

## Security

### Password Requirements
- Minimum 8 characters
- Hashed using bcryptjs with salt rounds: 12

### Token Security
- Algorithm: HS256 (HMAC SHA-256)
- Expiration: 7 days
- Transmitted via `Authorization: Bearer` header only

### Data Protection
- HTTPS required in production
- CORS enabled for specified origins
- Content Security Policy enabled
- No sensitive data in logs

---

## Pagination & Filtering

Currently, all endpoints return full datasets. Future versions will support:
- `?limit=10` - Limit results
- `?offset=20` - Skip first N results
- `?sort=name` - Sort by field
- `?filter[status]=active` - Filter by field

---

## Versioning

API versioning via URL path:
- Current: `/v1/` (not yet implemented, all endpoints at root)
- Future versions will use `/v2/`, `/v3/`, etc.

---

## Best Practices

### Request Examples

**Always include Authorization header:**
```bash
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Content-Type header:**
```bash
-H "Content-Type: application/json"
```

### Error Handling

Always check `statusCode` or HTTP status and handle accordingly:
```javascript
if (response.statusCode === 401) {
  // Re-authenticate user
}
if (response.statusCode === 429) {
  // Implement exponential backoff
}
```

### Rate Limiting

Implement exponential backoff when receiving 429 responses.

---

## Changelog

### Version 2.0 (Current)
- Enhanced error handling
- Formal schema validation
- Comprehensive API documentation
- Rate limiting on auth endpoints
- Security improvements

### Version 1.0
- Initial release
- Basic CRUD operations
- JWT authentication

---

## Support

For issues or questions, contact the development team.

Last updated: 2025-01-15
