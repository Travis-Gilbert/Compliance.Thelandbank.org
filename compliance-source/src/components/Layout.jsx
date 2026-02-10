import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Mail,
  MessageSquare,
  Upload,
} from 'lucide-react';

export default function Layout() {
  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
    },
    {
      label: 'Properties',
      icon: Building2,
      path: '/properties',
    },
    {
      label: 'Batch Email',
      icon: Mail,
      path: '/batch-email',
    },
    {
      label: 'Communication Log',
      icon: MessageSquare,
      path: '/communications',
    },
    {
      label: 'Buyer Submission',
      icon: Upload,
      path: '/submit',
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-white flex flex-col shadow-lg">
        {/* Logo Section */}
        <div className="px-6 py-8 border-b border-slate-700">
          <h1 className="text-3xl font-bold text-emerald-400">GCLBA</h1>
          <p className="text-sm text-slate-400 mt-1">Compliance Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-emerald-500 bg-opacity-20 text-emerald-300'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
                    )}
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-400">
          <p>© 2024 GCLBA</p>
          <p className="mt-1">Compliance Management</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
