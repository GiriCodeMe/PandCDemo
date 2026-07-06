import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StellaProvider } from './context/StellaContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import ClaimsPage from './pages/ClaimsPage';
import ReportClaimPage from './pages/ReportClaimPage';
import ReviewClaimPage from './pages/ReviewClaimPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <StellaProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/claims/new" element={<ReportClaimPage />} />
            <Route path="/claims/:id/review" element={<ReviewClaimPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </Layout>
      </StellaProvider>
    </BrowserRouter>
  );
}
