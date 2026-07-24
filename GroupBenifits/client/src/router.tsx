import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/dashboard/Dashboard';
import EmployerDirectory from './pages/employers/EmployerDirectory';
import EmployerDetail from './pages/employers/EmployerDetail';

// lazy load future pages
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <h1 className="text-2xl font-bold text-slate-200 mb-2">404</h1>
    <p className="text-slate-400">Page not found</p>
  </div>
);

const ComingSoon = ({ page }: { page: string }) => (
  <div className="flex flex-col items-center justify-center h-64">
    <h1 className="text-2xl font-bold text-slate-200 mb-2">{page}</h1>
    <p className="text-slate-400 text-sm">Coming in a future phase</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell><Dashboard /></AppShell>,
  },
  {
    path: '/employers',
    element: <AppShell><EmployerDirectory /></AppShell>,
  },
  {
    path: '/employers/:employerId',
    element: <AppShell><EmployerDetail /></AppShell>,
  },
  {
    path: '/employees',
    element: <AppShell><ComingSoon page="Employees" /></AppShell>,
  },
  {
    path: '/plans',
    element: <AppShell><ComingSoon page="Plans" /></AppShell>,
  },
  {
    path: '/enrollment',
    element: <AppShell><ComingSoon page="Enrollment" /></AppShell>,
  },
  {
    path: '/requirements',
    element: <AppShell><ComingSoon page="Requirements" /></AppShell>,
  },
  {
    path: '*',
    element: <AppShell><NotFound /></AppShell>,
  },
]);
