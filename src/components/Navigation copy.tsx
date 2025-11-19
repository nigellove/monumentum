import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  onNavigate: (section: string) => void;
  onGetStarted?: () => void;
  onContactUs?: () => void;
  onSignIn: () => void;
  onOpenDashboard: () => void;
}

export default function Navigation({ onNavigate, onSignIn, onOpenDashboard }: NavigationProps) {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Solutions', id: 'solutions' },
    { label: 'Services', id: 'services' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'About', id: 'about' },
    { label: 'FAQ', id: 'faq' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleClick = (id: string) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-bold text-slate-900">Neuro</span>
            <div className="px-1.5 py-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded">
              <span className="text-2xl font-bold text-white">IQ</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className="text-slate-700 hover:text-cyan-600 transition-colors font-medium"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={onOpenDashboard}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                <User size={18} />
                My Portal
              </button>
            ) : (
              <button
                onClick={onSignIn}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Sign In
              </button>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <button
                onClick={() => {
                  onOpenDashboard();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full text-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <User size={18} />
                My Portal
              </button>
            ) : (
              <button
                onClick={() => {
                  onSignIn();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
