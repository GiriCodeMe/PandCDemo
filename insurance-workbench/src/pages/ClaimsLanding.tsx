
import { BriefcaseIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const ClaimsLanding: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Topbar */}
      <header className="w-full h-16 bg-gray-800 flex items-center px-8 shadow z-10">
        <img src="/epamlogo.png" alt="EPAM Logo" className="h-7 mr-4" />
        <span className="text-white text-xl font-bold tracking-wide">Insurance Workbench</span>
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-12 max-w-2xl w-full border border-blue-100">
          <div className="flex flex-col items-center mb-8">
            <img src="/workbenchlogo2.png" alt="Workbench Logo" className="h-16 mb-2" />
            <h1 className="text-4xl font-extrabold text-blue-800 mb-2 tracking-tight text-center drop-shadow">Welcome to the Insurance Workbench</h1>
            <p className="text-lg text-gray-600 text-center">Choose your workspace to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <a href="/dashboard" className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-blue-100 hover:bg-blue-200 transition shadow hover:shadow-lg border border-blue-200">
              <ShieldCheckIcon className="h-12 w-12 text-blue-500 group-hover:text-blue-700 mb-3" />
              <span className="text-xl font-semibold text-blue-900 mb-1">Underwriting Workbench</span>
              <span className="text-sm text-blue-700 text-center">For Underwriters to manage new business, renewals, and policy reviews.</span>
            </a>
            <a href="/claims/dashboard" className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-green-100 hover:bg-green-200 transition shadow hover:shadow-lg border border-green-200">
              <BriefcaseIcon className="h-12 w-12 text-green-500 group-hover:text-green-700 mb-3" />
              <span className="text-xl font-semibold text-green-900 mb-1">Claims Workbench</span>
              <span className="text-sm text-green-700 text-center">For Claims Adjusters to process incidents and manage claims efficiently.</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimsLanding;
