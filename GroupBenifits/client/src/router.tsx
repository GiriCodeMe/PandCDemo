import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/dashboard/Dashboard';
import EmployerDirectory from './pages/employers/EmployerDirectory';
import EmployerDetail from './pages/employers/EmployerDetail';
import EmployeeDirectory from './pages/employees/EmployeeDirectory';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import ProductCatalog from './pages/catalog/ProductCatalog';
import RequirementsStudio from './pages/requirements/RequirementsStudio';
import PlansHub from './pages/plans/PlansHub';

const ComingSoon = ({ page }: { page: string }) => (
  <div className="flex flex-col items-center justify-center h-64">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">{page}</h1>
    <p className="text-gray-400 text-sm">Coming in a future phase</p>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-64">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">404</h1>
    <p className="text-gray-400">Page not found</p>
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
    element: <AppShell><EmployeeDirectory /></AppShell>,
  },
  {
    path: '/employees/:employeeId',
    element: <AppShell><EmployeeDetail /></AppShell>,
  },
  {
    path: '/products',
    element: <AppShell><ProductCatalog /></AppShell>,
  },
  {
    path: '/plans',
    element: <AppShell><PlansHub /></AppShell>,
  },
  {
    path: '/enrollment',
    element: <AppShell><ComingSoon page="Enrollment" /></AppShell>,
  },
  {
    path: '/requirements',
    element: <AppShell><RequirementsStudio /></AppShell>,
  },
  {
    path: '*',
    element: <AppShell><NotFound /></AppShell>,
  },
]);
