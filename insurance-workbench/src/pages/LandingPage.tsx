
import { BriefcaseIcon, ShieldCheckIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { NavLink } from 'react-router-dom';

const gradientBg = "bg-gradient-to-br from-blue-100 via-white to-green-100";
const glassCard = "bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-blue-100";
const tileBase = "group flex flex-col items-center justify-center p-8 rounded-2xl transition shadow hover:shadow-2xl border cursor-pointer transform hover:-translate-y-1 hover:scale-105 duration-200";

const tiles = [
   {
    href: "https://business.deps.epam.com/documents",
    icon: <DocumentTextIcon className="h-12 w-12 text-yellow-500 group-hover:text-yellow-700 mb-3" />,
    title: "Document Ingestion",
    desc: "Connect to external system for document processing and ingestion.",
    bg: "bg-yellow-100 hover:bg-yellow-200 border-yellow-200",
    text: "text-yellow-900"
  },
  {
    href: "/dashboard",
    icon: <ShieldCheckIcon className="h-12 w-12 text-blue-500 group-hover:text-blue-700 mb-3" />,
    title: "Underwriting Workbench",
    desc: "For Underwriters to manage new business, renewals, and policy reviews.",
    bg: "bg-blue-100 hover:bg-blue-200 border-blue-200",
    text: "text-blue-900"
  },
  {
    href: "/claims/dashboard",
    icon: <BriefcaseIcon className="h-12 w-12 text-green-500 group-hover:text-green-700 mb-3" />,
    title: "Claims Workbench",
    desc: "For Claims Adjusters to process incidents and manage claims efficiently.",
    bg: "bg-green-100 hover:bg-green-200 border-green-200",
    text: "text-green-900"
  }

];

const LandingPage: React.FC = () => {
  return (
    <div className={`min-h-screen flex flex-col ${gradientBg}`}>
      {/* Topbar */}
      <header className="w-full h-16 bg-gradient-to-r from-blue-800 to-green-600 flex items-center px-8 shadow z-10">
        <img src="/epamlogo.png" alt="EPAM Logo" className="h-7 mr-4 drop-shadow-lg" />
        <img src="/workbenchlogo2.png" alt="Workbench Logo" className="h-10 cursor-pointer hover:opacity-80 transition-opacity" />
        
      </header>
      <div className="flex flex-1 items-center justify-center">
        <div className={`${glassCard} p-12 max-w-3xl w-full relative overflow-hidden`}>
          <SparklesIcon className="absolute text-blue-200 opacity-30 w-40 h-40 -top-16 -right-16 rotate-12 pointer-events-none" />
          <div className="flex flex-col items-center mb-8">
            <img src="/workbenchlogo2.png" alt="Workbench Logo" className="h-20 mb-3 drop-shadow-xl" />
            <h1 className="text-5xl font-extrabold text-blue-800 mb-2 tracking-tight text-center drop-shadow-lg">Welcome to the Insurance Workbench</h1>
            <p className="text-lg text-gray-600 text-center font-medium">Choose your workspace to get started</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {tiles.map(tile => (
              tile.title === "Document Ingestion" ? (
                <a
                  key={tile.title}
                  href={tile.href}
                  className={`${tileBase} ${tile.bg} ${tile.text}`}
                  style={{ minHeight: 220 }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tile.icon}
                  <span className="text-xl font-bold mb-1 text-center w-full">{tile.title}</span>
                  <span className="text-sm text-center opacity-80 w-full">{tile.desc}</span>
                </a>
              ) : (
                <NavLink
                  key={tile.title}
                  to={tile.href}
                  className={({ isActive }) => `${tileBase} ${tile.bg} ${tile.text} ${isActive ? 'ring-2 ring-blue-400' : ''}`}
                  style={{ minHeight: 220 }}
                >
                  {tile.icon}
                  <span className="text-xl font-bold mb-1 text-center w-full">{tile.title}</span>
                  <span className="text-sm text-center opacity-80 w-full">{tile.desc}</span>
                </NavLink>
              )
            ))}
          </div>
        </div>
      </div>
      <footer className="w-full text-center py-4 text-xs text-gray-400 mt-4">
        &copy; {new Date().getFullYear()} Insurance Workbench. Powered by EPAM.
      </footer>
    </div>
  );
};

export default LandingPage;
