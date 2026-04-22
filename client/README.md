# Frontend - Home Planner UI

React + Vite + Tailwind CSS frontend for the AI Home Designing application.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running on http://localhost:5001

### Installation

```bash
# From project root
cd client

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Directory Structure

```
client/
├── src/
│   ├── components/
│   │   ├── AdminPanel.jsx       # Admin dashboard
│   │   ├── CanvasView.jsx       # Main drawing canvas
│   │   ├── DrawingTools.jsx     # NEW: Drawing tools UI
│   │   ├── Login.jsx            # Login page
│   │   ├── Signup.jsx           # Registration page
│   │   ├── ThreePreview.jsx     # 3D preview (future)
│   │   └── App.jsx              # Main app component
│   ├── utils/
│   │   ├── api.js               # API client
│   │   ├── authUtils.js         # Auth utilities
│   │   ├── drawPlan.js          # Canvas utilities
│   │   └── store.js             # Redux store
│   ├── styles/
│   │   └── index.css            # Global styles
│   ├── index.css                # Main CSS
│   └── main.jsx                 # Entry point
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
├── package.json
└── README.md
```

## 🎨 Components

### Login Component
```jsx
<Login onSuccess={handleLoginSuccess} />
```

User authentication with email and password.

### Signup Component
```jsx
<Signup onSuccess={handleSignupSuccess} />
```

New user registration with validation.

### CanvasView Component
```jsx
<CanvasView 
  plan={planData} 
  editable={true}
  land={{ length: 10, width: 15 }}
/>
```

Main canvas for drawing and editing floor plans.

### DrawingTools Component
```jsx
import { DrawingToolbar, ColorPicker, BrushSettings } from './DrawingTools';

<DrawingToolbar 
  activeTool={tool}
  onToolChange={setTool}
  onUndo={handleUndo}
  onRedo={handleRedo}
/>

<ColorPicker color={color} onChange={setColor} />

<BrushSettings 
  brushSize={size}
  onBrushSizeChange={setSize}
/>
```

New drawing tools interface with multiple utilities.

### AdminPanel Component
```jsx
<AdminPanel />
```

Admin dashboard for managing users and viewing statistics.

## 📦 Dependencies

### Core
- **react**: UI framework
- **vite**: Build tool and dev server
- **axios**: HTTP client
- **react-redux**: State management
- **redux**: Predictable state container

### UI & Styling
- **tailwindcss**: Utility-first CSS framework
- **postcss**: CSS transformations
- **autoprefixer**: CSS vendor prefixes

### Canvas
- **fabric**: Canvas manipulation library

### Development
- **@vitejs/plugin-react**: Vite React plugin

## 🔑 Key Features

### Authentication Flow
```
User Input → Validation → API Call → Token Storage → Redirect to Dashboard
```

### Canvas Features
- Free-form drawing
- Object selection and manipulation
- Zoom and pan
- Grid rendering
- Export to PNG/PDF
- Undo/Redo support

### State Management
Redux store manages:
- User authentication state
- Current plan data
- UI state (modals, notifications)
- Drawing tools state

## 🎯 Utilities

### API Client
```javascript
import * as API from './utils/api';

// Authentication
const { token, user } = await API.login(email, password);
await API.signup(email, password);

// Plans
const plans = await API.listPlans();
await API.savePlan(planData);
const plan = await API.getPlan(planId);
await API.deletePlan(planId);

// Generation
const plan = await API.generatePlan({
  length: 10,
  width: 15,
  shape: 'rectangle'
});

// Admin
const stats = await API.getAdminStats();
const users = await API.getAdminUsers();
```

### Auth Utilities
```javascript
import { getToken, setToken, clearToken, isAuthenticated } from './utils/authUtils';

// Check authentication
if (isAuthenticated()) {
  // Render protected content
}

// Manage tokens
const token = getToken();
setToken(newToken);
clearToken();
```

### Canvas Utilities
```javascript
import { 
  initCanvas, 
  drawGrid, 
  computePxPerMeter, 
  renderPlan,
  fillForRoomType
} from './utils/drawPlan';

// Initialize canvas
const canvas = initCanvas(element, width, height);

// Draw grid
drawGrid(canvas, gridSize);

// Calculate scaling
const pixelsPerMeter = computePxPerMeter(canvas, length, width);

// Render plan
renderPlan(canvas, planData, editableMode);
```

## 🎨 Styling

### Tailwind CSS Classes

The application uses utility-first CSS with custom classes:

```jsx
// Common patterns
<div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
  <button className="hp-hover-lift inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600 text-white shadow-sm hover:bg-teal-500">
    Button
  </button>
</div>
```

### Custom CSS
Check `index.css` for:
- Color palette
- Custom animations
- Responsive utilities
- Component-specific styles

## 🚀 Development Commands

```bash
# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint and format (if configured)
npm run lint
```

## 📱 Responsive Design

The application is responsive across:
- **Desktop**: Full features, optimized layout
- **Tablet**: Touch-friendly controls
- **Mobile**: Basic functionality (future enhancement)

## 🎯 User Flows

### Authentication Flow
```
1. User visits app
2. Check if authenticated (token in localStorage)
3. If not authenticated → Show Login/Signup
4. If authenticated → Show Dashboard
```

### Plan Creation Flow
```
1. Click "New Plan"
2. Enter plan details
3. Generate AI plan OR start with blank canvas
4. Edit plan using drawing tools
5. Save plan
6. View in plan list
```

### Plan Editing Flow
```
1. Select plan from list
2. Load plan into canvas
3. Edit using drawing tools
4. Save changes
5. Export if needed
```

## 🔐 Authentication

### Token Storage
Tokens are stored in `localStorage`:
```javascript
localStorage.setItem('token', jwtToken);
const token = localStorage.getItem('token');
localStorage.removeItem('token');
```

### Protected Routes
```jsx
// Check authentication before rendering
const ProtectedComponent = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};
```

## 📊 State Structure

```javascript
{
  auth: {
    token: string,
    user: { id, email, role },
    isLoading: boolean,
    error: string
  },
  plans: {
    list: [],
    current: null,
    isLoading: boolean,
    error: string
  },
  ui: {
    activeTab: string,
    isDrawerOpen: boolean,
    notifications: []
  },
  tools: {
    activeTool: string,
    brushSize: number,
    color: string,
    opacity: number
  }
}
```

## 🧪 Testing Components

### Example: Testing CanvasView
```jsx
import { render, screen } from '@testing-library/react';
import CanvasView from './CanvasView';

test('renders canvas element', () => {
  const mockPlan = { meta: { length: 10, width: 15 } };
  render(<CanvasView plan={mockPlan} land={{ length: 10, width: 15 }} />);
  expect(screen.getByRole('canvas')).toBeInTheDocument();
});
```

## 🐛 Debugging

### Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to React DevTools tab
3. Inspect component hierarchy
4. Check props and state

### Redux DevTools
Enable Redux DevTools browser extension to:
- See state changes
- Replay actions
- Time-travel debugging

### Logging
```javascript
console.log('Plan:', plan);
console.log('Token:', getToken());
console.log('Canvas state:', fabricRef.current);
```

## 📈 Performance Optimization

### Code Splitting
Vite automatically code-splits routes and components.

### Lazy Loading
```jsx
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./components/AdminPanel'));

<Suspense fallback={<Loading />}>
  <AdminPanel />
</Suspense>
```

### Memoization
```jsx
import { memo } from 'react';

const DrawingTools = memo(({ activeTool, onToolChange }) => {
  // Component only re-renders if props change
  return <div>...</div>;
});
```

## 🔍 Common Issues

### CORS Errors
- Verify backend is running on http://localhost:5001
- Check `CORS_ORIGIN` in backend `.env`

### Token Expiration
- User will be redirected to login
- Token is automatically cleared from localStorage

### Canvas Not Loading
- Verify Fabric.js is installed: `npm list fabric`
- Check canvas element exists in DOM

### API Calls Failing
- Check backend server is running
- Verify network tab shows correct URL
- Check browser console for errors

## 🚀 Building for Production

```bash
# Build optimized production bundle
npm run build

# The build output is in 'dist/' folder
# Upload to your hosting service
```

### Deployment Checklist
- [ ] Set API URL to production backend
- [ ] Disable debug logging
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Test authentication flow
- [ ] Test all features
- [ ] Check bundle size
- [ ] Enable caching headers

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Fabric.js](http://fabricjs.com/)
- [Redux](https://redux.js.org/)
- [Axios](https://axios-http.com/)

## 📞 Support

For frontend-specific issues:
1. Check browser console for errors
2. Verify backend API is accessible
3. Check Redux state in DevTools
4. Review component props and state

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: 2024-04-22  
**React Version**: 18+  
**Vite Version**: 4+
