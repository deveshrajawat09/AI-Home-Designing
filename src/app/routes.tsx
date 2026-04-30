import { createBrowserRouter } from 'react-router';
import RootLayout from './components/layout/RootLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import FloorPlannerPage from './pages/FloorPlannerPage';
import InteriorDesignPage from './pages/InteriorDesignPage';
import ExteriorDesignPage from './pages/ExteriorDesignPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: 'login', Component: LoginPage },
      { path: 'signup', Component: SignupPage },
      { path: 'dashboard', Component: Dashboard },
      { path: 'floor-planner', Component: FloorPlannerPage },
      { path: 'interior', Component: InteriorDesignPage },
      { path: 'exterior', Component: ExteriorDesignPage },
      { path: 'profile', Component: ProfilePage },
    ],
  },
]);
