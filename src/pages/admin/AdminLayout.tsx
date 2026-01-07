import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import Dashboard from './Dashboard';
import Users from './Users';
import UsageMonitoring from './UsageMonitoring';
import AuditLog from './AuditLog';

export default function AdminLayout() {
  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <AdminHeader />

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="usage" element={<UsageMonitoring />} />
            <Route path="audit" element={<AuditLog />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
