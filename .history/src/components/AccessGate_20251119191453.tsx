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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Glass morphism background blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
      
      {/* Modal with glass effect - 75% transparent */}
      <div className="relative bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 max-w-md w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mb-4">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Beta Access</h1>
          <p className="text-white/80">
            This site is currently in private beta testing. Please enter your access code to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="accessCode" className="block text-sm font-semibold text-white/90 mb-2">
              Access Code
            </label>
            <input
              id="accessCode"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-lg focus:border-teal-400 focus:outline-none transition-colors text-center text-lg font-semibold tracking-wider uppercase text-white placeholder-white/50"
              placeholder="Enter code"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-2xl hover:from-teal-300 hover:to-blue-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <p className="text-sm text-white/70">
            Don't have an access code?{' '}
            <a href="mailto:contact@monumentum.ai" className="text-teal-300 hover:text-teal-200 font-semibold">
              Request Access
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}