import { useState } from 'react';
import { Lock, Loader2, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResetPasswordProps {
  onClose: () => void;
}

export default function ResetPassword({ onClose }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 z-50 overflow-auto">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Monumentum</span>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {!success ? (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="px-8 py-12 text-center border-b border-slate-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-50 to-blue-50 mb-6">
                  <Lock className="text-cyan-600" size={36} />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Reset Your Password
                </h1>
                <p className="text-slate-600 text-lg">
                  Choose a strong new password for your account
                </p>
              </div>

              <div className="px-8 py-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Error</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-bold text-slate-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-slate-400" size={20} />
                      </div>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-lg"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">Must be at least 6 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-slate-400" size={20} />
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-lg"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-3 py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock size={24} />
                        Update Password
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 p-5 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-100">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
                      <Lock className="text-white" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">Security Tip</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Choose a strong password that you don't use elsewhere. Consider using a password manager for better security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
                <p className="text-center text-sm text-slate-600">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-semibold text-cyan-600 hover:text-cyan-700 transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-8 py-16 text-center border-b border-green-100">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500 mb-6 shadow-xl animate-bounce">
                  <CheckCircle className="text-white" size={56} />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-3">
                  Password Updated!
                </h1>
                <p className="text-slate-600 text-lg mb-6">
                  Your password has been successfully changed
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
                  <Loader2 className="animate-spin text-cyan-600" size={20} />
                  <span className="text-slate-700 font-semibold">Redirecting to sign in...</span>
                </div>
              </div>

              <div className="px-8 py-10 text-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <Lock className="text-green-600" size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    You can now sign in
                  </h3>
                  <p className="text-slate-600 max-w-sm mx-auto">
                    Use your new password to access your Monumentum account and continue where you left off.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
