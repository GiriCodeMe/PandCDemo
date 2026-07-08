import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import PawspectChat from './PawspectChat';

export default function Layout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="app-shell">
      <TopNav onOpenChat={() => setChatOpen(true)} />
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <PawspectChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
