import { LayoutDashboard, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminHeader() {
  const navigate = useNavigate();

  async function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut();
      navigate('/auth/login');
    }
  }

  function goToMainApp() {
    navigate('/');
  }

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Monumentum</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={goToMainApp}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              <Home className="w-4 h-4" />
              Go to App
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
