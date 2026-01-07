import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, FileText } from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/usage', icon: BarChart3, label: 'Usage' },
    { path: '/admin/audit', icon: FileText, label: 'Audit Log' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white p-6 flex-shrink-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-slate-400 text-sm mt-1">Monumentum</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
