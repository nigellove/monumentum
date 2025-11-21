import { useState } from 'react';
import { X, Mail, Lock, Loader2, ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PRODUCTS, type Product } from '../lib/products';
import { supabase } from '../lib/supabase';

interface SignUpProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignUp({ onClose, onSwitchToSignIn }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState(''); // added business name
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return 'Password must contain at least one special character';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    if (!acceptedTerms) {
      setError('You must accept the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
          },
        },
      });

      if (signUpError) {
        if (
          signUpError.message.includes('already registered') ||
          signUpError.message.includes('already exists')
        ) {
          setError('Already a member? Sign in to purchase additional products');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          // Check if returning customer using maybeSingle (no error if no row)
          const { data: existingProfiles, error: profileError } = await supabase
            .from('business_profiles')
            .select('customer_id')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error checking existing profile:', profileError);
            setError('Failed to check account status. Please try again.');
            setLoading(false);
            return;
          }

          const existingCustomerId = existingProfiles?.customer_id || null;
          console.log('Existing customer_id:', existingCustomerId);

          // For NEW customers: Create placeholder business profile with pending status
          if (!existingCustomerId) {
            const { error: insertError } = await supabase
              .from('business_profiles')
              .insert({
                user_id: data.user.id,
                business_email: email,
                business_name: businessName || 'Pending Setup',
                payment_status: 'pending',
              });

            if (insertError) {
              console.error('Failed to create business profile:', insertError);
              setError('Failed to create profile. Please try again.');
              setLoading(false);
              return;
            }
          }

          // Store pending signup WITHOUT customer_id
          const { error: pendingError } = await supabase
            .from('pending_signups')
            .insert({
              user_id: data.user.id,
              email: email,
              product_id: selectedProduct.id,
              product_name: selectedProduct.name,
              business_name: businessName,
            });

          if (pendingError) {
            console.error('Failed to store pending signup:', pendingError);
            setError('Failed to store signup data. Please try again.');
            setLoading(false);
            return;
          }

          // Local pending signup (no customerId – n8n owns that)
          localStorage.setItem(
            'pending_signup',
            JSON.stringify({
              userId: data.user.id,
              email,
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              productPrice: selectedProduct.price,
              timestamp: new Date().toISOString(),
            })
          );

          console.log(
            '✅ Pending signup stored. Redirecting to Stripe:',
            selectedProduct.stripeLink
          );
          const checkoutUrl = `${selectedProduct.stripeLink}?prefilled_email=${encodeURIComponent(
            email
          )}`;
          window.location.href = checkoutUrl;
        } catch (err: any) {
          console.error('Signup error:', err);
          setError(err.message || 'An unexpected error occurred');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Get Started</h2>
            <p className="text-slate-600">Create your account in 30 seconds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700 mb-2">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Your company name"
                required
              />
            </div>

            {/* Email */}
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
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                8+ characters, 1 uppercase, 1 number, 1 special character
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Choose Your Plan
              </label>
              <div className="space-y-3">
                {PRODUCTS.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-start p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                  >
                    <input
                      type="radio"
                      name="product"
                      value={product.id}
                      checked={selectedProduct?.id === product.id}
                      onChange={() => setSelectedProduct(product)}
                      className="mt-1 mr-3 w-4 h-4 text-blue-600"
                      required
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="text-sm text-slate-600 mb-2">{product.description}</div>
                      <div className="text-lg font-bold text-blue-600">
                        ${product.price}/{product.billingCycle}
                      </div>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <Check className="text-blue-600 flex-shrink-0" size={20} />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 flex-shrink-0"
                  required
                />
                <span className="text-sm text-slate-700">
                  I agree to NeuroIQ&apos;s{' '}
                  <a
                    href="/docs/termsofservice.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a
                    href="/docs/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Privacy Policy
                  </a>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin inline mr-2" size={20} />
                  Creating Account...
                </>
              ) : (
                'Continue to Payment →'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <button 
              onClick={onSwitchToSignIn} 
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              🔒 Secured by Stripe • Your information is encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
