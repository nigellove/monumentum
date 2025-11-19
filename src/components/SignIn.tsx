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
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
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
              <p className="text-slate-600">Sign in to access your account or purchase products</p>
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
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
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
                      className="text-sm text-teal-600 hover:text-teal-700 font-semibold transition-colors"
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
                    className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
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
                    className="w-full pl-11 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors appearance-none bg-white text-slate-900 cursor-pointer"
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
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToSignUp}
                  className="text-teal-600 font-semibold hover:text-teal-700 transition-colors"
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
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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