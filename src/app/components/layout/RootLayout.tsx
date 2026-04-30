import React from 'react';
import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { ThemeProvider } from '../../context/ThemeContext';
import { AppProvider } from '../../context/AppContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="min-h-screen">
          <Navbar />
          <Outlet />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}
