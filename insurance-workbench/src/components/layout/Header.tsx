import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 sticky top-0 z-50">
      <div className="text-lg font-semibold text-gray-800">UW Workbench</div>
      <nav className="ml-8 flex gap-6">
        {/* Add navigation items */}
      </nav>
    </header>
  );
};
