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
import EnrollmentHub from './pages/enrollment/EnrollmentHub';
import LifeEventsHub from './pages/life-events/LifeEventsHub';
import IntegrationsHub from './pages/integrations/IntegrationsHub';
import CobraHub from './pages/cobra/CobraHub';
import NotificationsHub from './pages/notifications/NotificationsHub';
import ReportsHub from './pages/reports/ReportsHub';
import PlanDetail from './pages/plans/PlanDetail';
import DemoControlCenter from './pages/demo/DemoControlCenter';
import AuditTrail from './pages/audit/AuditTrail';
import SmallBusinessWizard from './pages/small-business/SmallBusinessWizard';
import SmallBusinessPortfolio from './pages/small-business/SmallBusinessPortfolio';

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
    path: '/plans/:planId',
    element: <AppShell><PlanDetail /></AppShell>,
  },
  {
    path: '/enrollment',
    element: <AppShell><EnrollmentHub /></AppShell>,
  },
  {
    path: '/life-events',
    element: <AppShell><LifeEventsHub /></AppShell>,
  },
  {
    path: '/integrations',
    element: <AppShell><IntegrationsHub /></AppShell>,
  },
  {
    path: '/cobra',
    element: <AppShell><CobraHub /></AppShell>,
  },
  {
    path: '/notifications',
    element: <AppShell><NotificationsHub /></AppShell>,
  },
  {
    path: '/reports',
    element: <AppShell><ReportsHub /></AppShell>,
  },
  {
    path: '/requirements',
    element: <AppShell><RequirementsStudio /></AppShell>,
  },
  {
    path: '/audit',
    element: <AppShell><AuditTrail /></AppShell>,
  },
  {
    path: '/demo',
    element: <AppShell><DemoControlCenter /></AppShell>,
  },
  {
    path: '/small-business',
    element: <AppShell><SmallBusinessWizard /></AppShell>,
  },
  {
    path: '/small-business/portfolio',
    element: <AppShell><SmallBusinessPortfolio /></AppShell>,
  },
  {
    path: '*',
    element: <AppShell><NotFound /></AppShell>,
  },
]);
