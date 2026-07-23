import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Quote from './pages/Quote';
import Policies from './pages/Policies';
import Claims from './pages/Claims';
import MedicalCoding from './pages/MedicalCoding';
import FraudBreed from './pages/FraudBreed';
import MedicalHistory from './pages/MedicalHistory';
import Underwriting from './pages/Underwriting';
import Billing from './pages/Billing';
import FNOL from './pages/FNOL';
import Reports from './pages/Reports';
import ClinicPortal from './pages/ClinicPortal';
import HotelPortal from './pages/HotelPortal';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="quote" element={<Quote />} />
          <Route path="policies" element={<Policies />} />
          <Route path="claims" element={<Claims />} />
          <Route path="coding" element={<MedicalCoding />} />
          <Route path="fraud" element={<FraudBreed />} />
          <Route path="history" element={<MedicalHistory />} />
          <Route path="underwriting" element={<Underwriting />} />
          <Route path="billing" element={<Billing />} />
          <Route path="fnol" element={<FNOL />} />
          <Route path="clinic" element={<ClinicPortal />} />
          <Route path="hotel-portal" element={<HotelPortal />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
