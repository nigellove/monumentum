import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface AccessGateProps {
  onAccessGranted: () => void;
}

const ACCESS_CODE = 'BETA2024';

export default function AccessGate({ onAccessGranted }: AccessGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (code.trim().toUpperCase() === ACCESS_CODE) {
        localStorage.setItem('beta_access', 'granted');
        onAccessGranted();
      } else {
        setError('Invalid access code. Please try again.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Beta Access</h1>
          <p className="text-slate-600">
            This site is currently in private beta testing. Please enter your access code to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="accessCode" className="block text-sm font-semibold text-slate-700 mb-2">
              Access Code
            </label>
            <input
              id="accessCode"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-center text-lg font-semibold tracking-wider uppercase"
              placeholder="Enter code"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Verifying...
              </>
            ) : (
              'Access Site'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Don't have an access code?{' '}
            <a href="mailto:contact@example.com" className="text-blue-600 hover:text-blue-700 font-semibold">
              Request Access
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
