# AI Home Planner with Smart Architect Assistant

A full-stack, enterprise-grade AI-powered web application for floor plan generation, interior design, and exterior design visualization. Built with a unified Node.js/Express backend and a modern React (Vite) frontend.

## Features

*   **Secure Authentication**: User signup and login system utilizing JWT and bcrypt for safe credential management.
*   **Interactive Floor Planner**: Advanced 2D/3D floor plan editing, room manipulation, and architectural visualization.
*   **AI Interior Design**: Intelligent recommendations and tools to redesign and visualize interior spaces dynamically.
*   **AI Exterior Design**: Smart architect assistance for exterior structural planning and realistic previews.
*   **Modern UI/UX**: Premium, responsive, glassmorphism-styled frontend built with TailwindCSS, Radix UI, and Framer Motion.
*   **Dashboard & Profile**: Centralized workspace to manage saved projects, view ongoing designs, and update user preferences.
*   **Unified Full-Stack Architecture**: An integrated Node.js Express server that manages both REST API authentication endpoints and serves the static production build.

## Tech Stack

*   **Frontend**: React 18, Vite, React Router
*   **Styling & UI**: TailwindCSS v4, Radix UI (Accessible Primitives), Framer Motion, Lucide React icons
*   **Backend**: Node.js, Express.js
*   **Security**: bcryptjs, jsonwebtoken, cors
*   **Visualization**: Three.js (3D engine), react-dnd (Drag and Drop functionality)
*   **State & Forms**: react-hook-form, sonner (Toast Notifications)

## Project Structure

*   `src/`: Contains all frontend React code.
    *   `src/app/pages/`: Application views (Landing, Dashboard, FloorPlanner, InteriorDesign, ExteriorDesign, etc.).
    *   `src/app/components/`: Reusable UI elements, layouts, and forms.
    *   `src/app/routes.tsx`: Application routing configuration.
*   `server.js`: The Express server acting as the backend API and the static file server for production deployment.
*   `dist/`: The output directory for the compiled production frontend.
*   `package.json`: Project metadata, dependencies, and NPM scripts.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or another package manager

### Installation

1.  Navigate into the project directory:
    ```bash
    cd "f:\Mini Project"
    ```
2.  Install all dependencies:
    ```bash
    npm install
    ```

### Running the Application

#### Development Mode (Frontend)
To run the Vite development server with Hot Module Replacement (HMR) for frontend development:
```bash
npm run dev
```

#### Full-Stack Mode (Frontend + Backend API)
To run the application exactly how it operates in production (serving both the React app and the API endpoints from Express):
1.  Build the frontend:
    ```bash
    npm run build
    ```
2.  Start the integrated Express server:
    ```bash
    node server.js
    ```
*The full application will now be running at http://localhost:5173/*

