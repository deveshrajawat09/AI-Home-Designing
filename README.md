# HomeDesigner Pro

Full-stack interior design web app with 2D drag/drop builder, 3D preview (React Three Fiber), Tailwind + Framer Motion, Node/Express API, and MongoDB persistence. Deployable to Vercel (client) + Render/Atlas (API) or full-stack to Netlify functions.

## Quickstart

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
cp .env.example .env
# set MONGODB_URI and Google OAuth keys
npm install
npm start
```

Set `CLIENT_URL` in `.env` to your Vite dev URL or deployed frontend domain.

## Deploy
- **Vercel/Netlify**: Deploy `client` as a static/Vite app. Set `VITE_API_URL` env (use proxy or relative `/api`).
- **Render/Fly/Heroku**: Deploy `server` with the provided `index.js`. Add MongoDB Atlas connection string.

## Features Implemented
- 2D grid builder with drag-and-drop + snap
- 3D preview (R3F + lighting + orbit controls)
- Templates & palettes for Living/Bedroom/Kitchen/Office
- Catalog of 50+ furniture items with styles/categories
- Customization panel (color picker, materials, rotation, lighting)
- Save locally + POST to `/api/designs`; share links `/share/:slug`
- Export via browser print; copy share link; "Buy all" estimator
- AI Design Assistant (rule-based suggestions placeholder for later LLM)

## Next Steps
- Hook Google OAuth keys; store user profile on session
- Harden share links with validation and role-based access
- Add AR/WebXR preview hook (8th Wall/WebXR polyfill) and real PNG/PDF export via `html2canvas` + `jsPDF`
- Add unit tests and move catalog to DB with media URLs
