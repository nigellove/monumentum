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
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center tracking-wider" style={{ fontFamily: 'Audiowide, sans-serif' }}>
          <span className="text-3xl font-light text-slate-900">MONUMENTUM</span>
          <span className="text-3xl font-normal text-teal-500">.ai</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="text-slate-600 hover:text-slate-900 transition font-medium"
            >
              {item.label}
            </button>
          ))}
          {user ? (
            <button
              onClick={onOpenDashboard}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition shadow-sm flex items-center gap-2"
            >
              <User size={18} />
              My Portal
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition shadow-sm"
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
            <X className="w-6 h-6 text-slate-900" />
          ) : (
            <Menu className="w-6 h-6 text-slate-900" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 py-4">
          <div className="flex flex-col space-y-2 px-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className="block w-full text-left px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors font-medium"
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
                className="flex items-center justify-center gap-2 w-full text-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition shadow-sm"
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
                className="block w-full text-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-semibold transition shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}