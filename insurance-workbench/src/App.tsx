import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import ClaimsMainLayout from './claims/components/layout/ClaimsMainLayout';
import ClaimsDashboard from './claims/pages/ClaimsDashboard';
import ClaimsWorkQueue from './claims/pages/ClaimsWorkQueue';
import IncidentsList from './claims/pages/IncidentsList';
import ClaimsPaymentsReview from './claims/pages/ClaimsPaymentsReview';
import ClaimsTeamPerformance from './claims/pages/ClaimsTeamPerformance';
import ClaimsDetail from './claims/pages/ClaimsDetail';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewSubmissions from './pages/NewSubmissions';
import SubmissionDetail from './pages/SubmissionDetail';
import Renewals from './pages/Renewals';
import PolicyReview from './pages/PolicyReview';
import TeamPerformance from './pages/TeamPerformance';
import LandingPage from './pages/LandingPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="dashboard" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="submissions" element={<NewSubmissions />} />
          <Route path="submissions/:id" element={<SubmissionDetail id={''} />} />
          <Route path="renewals" element={<Renewals />} />
          <Route path="review" element={<PolicyReview />} />
          <Route path="team" element={<TeamPerformance />} />
        </Route>
        {/* Claims Workbench routes */}
        <Route path="claims" element={<ClaimsMainLayout />}>
          <Route path="dashboard" element={<ClaimsDashboard />} />
          <Route path="workqueue" element={<ClaimsWorkQueue />} />
          <Route path="incidents" element={<IncidentsList />} />
          <Route path="payments" element={<ClaimsPaymentsReview />} />
          <Route path="team" element={<ClaimsTeamPerformance />} />
          <Route path=":id" element={<ClaimsDetail />} />
          {/* Add more nested claims routes here as needed */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
