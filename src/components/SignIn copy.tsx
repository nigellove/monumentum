import { useState } from 'react';
import { X, Mail, Lock, Loader2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCTS, type Product } from '../lib/products';
import { supabase } from '../lib/supabase';

interface SignInProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignIn({ onClose, onSwitchToSignUp }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const { signIn } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const { error } = await signIn(email, password);

  if (error) {
    setError(error.message);
    setLoading(false);
  } else {
    if (selectedProduct) {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if returning customer
          const { data: existingProfiles, error: profileError } = await supabase
            .from('business_profiles')
            .select('customer_id')
            .eq('user_id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error checking existing profile:', profileError);
            setError('Failed to check account status. Please try again.');
            setLoading(false);
            return;
          }

          const existingCustomerId = existingProfiles?.customer_id || null;

          // Store pending signup with customer_id
          const { error: pendingError } = await supabase
            .from('pending_signups')
            .insert({
              user_id: user.id,
              email: email,
              product_id: selectedProduct.id,
              product_name: selectedProduct.name,
              customer_id: existingCustomerId
            });

          if (pendingError) {
            console.error('Failed to store pending signup:', pendingError);
            setError('Failed to store signup data. Please try again.');
            setLoading(false);
            return;
          }

          localStorage.setItem(
            'pending_signup',
            JSON.stringify({
              userId: user.id,
              email,
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              productPrice: selectedProduct.price,
              customerId: existingCustomerId,
              timestamp: new Date().toISOString(),
            })
          );


        
const checkoutUrl = `${selectedProduct.stripeLink}?prefilled_email=${encodeURIComponent(email)}`;
window.location.href = checkoutUrl;        

          //window.location.href = selectedProduct.stripeLink;
        }
      } catch (err: any) {
        console.error('Purchase error:', err);
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    } else {
      onClose();
    }
  }
};

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setResetSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        {!showResetPassword ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-600">Sign in to access your portal or purchase products</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              {error && (
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(true);
                    setResetEmail(email);
                    setError('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="product" className="block text-sm font-semibold text-slate-700 mb-2">
              Purchase Product (Optional)
            </label>
            <div className="relative">
              <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={20} />
              <select
                id="product"
                value={selectedProduct?.id || ''}
                onChange={(e) => setSelectedProduct(PRODUCTS.find(p => p.id === e.target.value) || null)}
                className="w-full pl-11 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors appearance-none bg-white text-slate-900 cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="" className="text-slate-900">No purchase (just sign in)</option>
                {PRODUCTS.map((product) => (
                  <option key={product.id} value={product.id} className="text-slate-900">
                    {product.name} - ${product.price.toFixed(2)}/{product.billingCycle}
                  </option>
                ))}
              </select>
            </div>
            {selectedProduct && (
              <p className="mt-2 text-sm text-slate-500">{selectedProduct.description}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing In...
              </>
            ) : (
              selectedProduct ? 'Sign In & Purchase' : 'Sign In'
            )}
          </button>
        </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
             {/* <button
                type="button"
                onClick={async () => {
                  setError('');
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}`,
                    },
                  });
                  if (error) {
                    setError(error.message);
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-semibold text-slate-700">Google</span>
              </button>*/}
              {/*<button
                type="button"
                onClick={async () => {
                  setError('');
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'azure',
                    options: {
                      redirectTo: `${window.location.origin}`,
                      scopes: 'email',
                    },
                  });
                  if (error) {
                    setError(error.message);
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                  <path d="M0 0h10.857v10.857H0V0z" fill="#f25022"/>
                  <path d="M12.143 0H23v10.857H12.143V0z" fill="#00a4ef"/>
                  <path d="M0 12.143h10.857V23H0V12.143z" fill="#7fba00"/>
                  <path d="M12.143 12.143H23V23H12.143V12.143z" fill="#ffb900"/>
                </svg>
                <span className="text-sm font-semibold text-slate-700">Microsoft</span>
              </button>*/}
            </div>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(false);
                  setResetSuccess(false);
                  setError('');
                }}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-2 text-sm font-semibold"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </button>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset Password</h2>
              <p className="text-slate-600">
                {resetSuccess
                  ? "Check your email for a password reset link"
                  : "Enter your email to receive a reset link"}
              </p>
            </div>

            {!resetSuccess ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending Reset Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
                <p className="font-semibold mb-2">Reset link sent!</p>
                <p className="text-sm">
                  Check your email inbox for a password reset link. The link will expire in 1 hour.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
