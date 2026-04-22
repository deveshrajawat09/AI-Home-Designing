# Home Planner API - Backend Documentation

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google API key (for AI plan generation)

### Installation

```bash
# Install backend dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# Add your Google API key and other configuration

# Start development server
npm run server:dev

# In another terminal, start the frontend
npm run client
```

### Ports
- Backend API: `http://localhost:5001`
- Frontend: `http://localhost:5173`

## 🔧 Environment Setup

Copy `.env.example` to `.env` and configure:

```env
# Server
NODE_ENV=development
PORT=5001

# Authentication
JWT_SECRET=your-very-secure-secret-key-min-32-chars-long

# CORS
CORS_ORIGIN=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://example.com

# AI
GOOGLE_API_KEY=your-google-api-key

# Security
BCRYPT_ROUNDS=10
```

## 📡 API Endpoints

### Authentication

#### Signup
```http
POST /api/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response: 201
{
  "token": "eyJhbGc...",
  "user": {
    "id": "1234567890",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Validation**:
- Email must be valid format
- Password: 8+ characters, uppercase, lowercase, numbers

**Error Codes**:
- `400` - Invalid input or email already registered
- `429` - Too many requests

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response: 200
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

**Error Codes**:
- `400` - Invalid input
- `401` - Invalid credentials
- `429` - Too many login attempts

### Plans

All plan endpoints require authentication header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### List Plans
```http
GET /plans
Authorization: Bearer <token>

Response: 200
{
  "plans": [
    {
      "id": "1234567890",
      "name": "My Home Plan",
      "description": "Ground floor plan",
      "meta": {
        "length": 10,
        "width": 15,
        "unit": "m"
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Plan
```http
POST /plans
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "My Home Plan",
  "description": "Ground floor layout",
  "plan": {
    "meta": {
      "length": 10,
      "width": 15,
      "unit": "m",
      "scale": 1
    },
    "rooms": [ ... ],
    "furniture": [ ... ]
  },
  "land": {
    "length": 10,
    "width": 15
  }
}

Response: 201
{
  "success": true,
  "plan": { ... }
}
```

**Validation**:
- name: required, string
- plan: required, valid floor plan structure
- land: required, object with length/width

#### Get Plan
```http
GET /plans/{id}
Authorization: Bearer <token>

Response: 200
{
  "plan": { ... }
}
```

**Error Codes**:
- `404` - Plan not found
- `401` - Unauthorized

#### Update Plan
```http
PUT /plans/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "description": "Updated description",
  "plan": { ... }
}

Response: 200
{
  "success": true,
  "plan": { ... }
}
```

#### Delete Plan
```http
DELETE /plans/{id}
Authorization: Bearer <token>

Response: 200
{
  "success": true
}
```

### Plan Generation (AI)

#### Generate Plan
```http
POST /generate-plan
Content-Type: application/json
Authorization: Bearer <token>

{
  "length": 15,
  "width": 20,
  "shape": "rectangle",
  "points": []
}

Response: 200
{
  "plan": {
    "meta": { ... },
    "rooms": [ ... ],
    "furniture": [ ... ]
  }
}
```

**Parameters**:
- length: number (required)
- width: number (required)
- shape: "rectangle" | "irregular" (default: "rectangle")
- points: array of coordinates for irregular shapes

### Admin Routes

#### Get Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin-token>

Response: 200
{
  "stats": {
    "totalUsers": 50,
    "adminUsers": 2,
    "normalUsers": 48,
    "totalPlans": 156
  }
}
```

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin-token>

Response: 200
{
  "users": [
    {
      "id": "123",
      "email": "user@example.com",
      "role": "user"
    }
  ]
}
```

#### Update User Role
```http
PUT /api/admin/users/{id}
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "role": "admin"
}

Response: 200
{
  "user": { ... }
}
```

#### Delete User
```http
DELETE /api/admin/users/{id}
Authorization: Bearer <admin-token>

Response: 200
{
  "success": true
}
```

## 🔐 Authentication

### JWT Token

Tokens are valid for 7 days. Include in requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

Currently, get a new token by logging in again. Future enhancement will add refresh token endpoint.

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": { }
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Missing/invalid token |
| 403  | Forbidden - No permission |
| 404  | Not Found - Resource doesn't exist |
| 429  | Too Many Requests - Rate limited |
| 500  | Internal Server Error |

### Rate Limiting

- **Auth endpoints**: 20 requests per 15 minutes
- **Login endpoint**: 10 requests per 15 minutes

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Debug tests
npm run test:debug
```

### Test Structure

```
test/
├── setup.js              # Test configuration
├── validators.test.js    # Validator unit tests
├── errorHandler.test.js  # Error handler tests
└── routes.test.js        # API route tests (TODO)
```

### Writing Tests

```javascript
describe('My Feature', () => {
  test('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

## 🐳 Docker

### Build and Run

```bash
# Build image
docker build -t homeplanner:latest .

# Run container
docker run -p 5001:5001 \
  -e JWT_SECRET=your-secret \
  -e GOOGLE_API_KEY=your-key \
  homeplanner:latest
```

### Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## 📦 Project Structure

```
project/
├── middleware/              # Express middleware
│   ├── errorHandler.js      # Error handling & async wrapper
│   ├── validators.js        # Input validation
│   └── apiDoc.js            # API documentation
├── routes/                  # API route handlers
│   └── index.js
├── test/                    # Test files
│   ├── setup.js
│   ├── validators.test.js
│   └── errorHandler.test.js
├── server.js                # Main Express app
├── package.json
├── .env.example
├── docker-compose.yml
├── Dockerfile
└── IMPROVEMENTS.md          # Detailed improvements
```

## 🔄 Data Flow

```
Client Request
    ↓
Express Middleware (CORS, Rate Limit)
    ↓
Route Handler
    ↓
Validators (validateInput)
    ↓
Authentication (if required)
    ↓
Business Logic
    ↓
Response
    ↓
Error Handler (catches exceptions)
    ↓
Client Response
```

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (min 32 chars)
- [ ] Set `CORS_ORIGIN` to your domain
- [ ] Add Google API key
- [ ] Set `BCRYPT_ROUNDS=12`
- [ ] Configure database (migrate from JSON)
- [ ] Set up backups
- [ ] Enable HTTPS
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Set up CI/CD
- [ ] Load test application
- [ ] Plan rollback strategy

## 📚 Future Enhancements

### Phase 2: Database
- [ ] Migrate to MongoDB/PostgreSQL
- [ ] Add database migrations
- [ ] Implement query optimization
- [ ] Add caching layer (Redis)

### Phase 3: Features
- [ ] Undo/Redo functionality
- [ ] Real-time collaboration
- [ ] Advanced drawing tools
- [ ] Export to CAD formats
- [ ] Sharing and permissions

### Phase 4: Infrastructure
- [ ] CI/CD pipeline
- [ ] API versioning
- [ ] GraphQL support
- [ ] WebSocket for real-time updates
- [ ] Message queue (RabbitMQ)
- [ ] Container orchestration (Kubernetes)

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process on port 5001
lsof -i :5001

# Kill process
kill -9 <PID>
```

### JWT Secret Not Set
```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Errors
Check file permissions:
```bash
chmod 644 plans.json users.json
```

### CORS Issues
Verify `CORS_ORIGIN` matches your frontend URL in `.env`

## 📞 Support

For questions or issues:
1. Check [IMPROVEMENTS.md](./IMPROVEMENTS.md) for detailed changes
2. Review test files for usage examples
3. Check API documentation in `middleware/apiDoc.js`

---

**Version**: 1.0.0  
**Last Updated**: 2024-04-22  
**Node Version**: 18+
