import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, FileText, ClipboardCheck, BookOpen, Layers, Heart, Link2, ShieldCheck, Bell } from 'lucide-react';
import clsx from 'clsx';
import { useUiStore } from '../../stores/uiStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Employers', href: '/employers', icon: Building2 },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Products', href: '/products', icon: Layers },
  { label: 'Plans', href: '/plans', icon: FileText },
  { label: 'Enrollment', href: '/enrollment', icon: ClipboardCheck },
  { label: 'Life Events', href: '/life-events', icon: Heart },
  { label: 'Integrations', href: '/integrations', icon: Link2 },
  { label: 'COBRA', href: '/cobra', icon: ShieldCheck },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Requirements', href: '/requirements', icon: BookOpen },
];

export default function Sidebar() {
  const { sidebarOpen } = useUiStore();

  return (
    <aside
      className={clsx(
        'bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden transition-all duration-200',
        sidebarOpen ? 'w-56' : 'w-0',
      )}
      aria-hidden={!sidebarOpen}
    >
      <nav className="py-3 px-2 w-56">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    item.soon && 'opacity-60',
                  )
                }
                onClick={item.soon ? (e) => e.preventDefault() : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.soon && (
                  <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
