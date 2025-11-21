import { useState, useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Solutions from './components/Solutions'
import Services from './components/Services'
import Pricing from './components/Pricing'
import About from './components/About'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import EmailModal from './components/EmailModal'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import UserDashboard from './components/UserDashboard'
import AccessGate from './components/AccessGate'
import FloatingBadge from './components/FloatingBadge'
import Documentation from './components/Documentation'
import PrivacyPolicy from './components/PrivacyPolicy'
import ResetPassword from './components/ResetPassword'
import TermsOfService from './components/TermsOfService'
import CookieBanner from './components/CookieBanner'
import PaymentSuccess from './components/PaymentSuccess'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'

function AppContent() {
  const { user, loading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [docsSection, setDocsSection] = useState<'installation' | 'customization' | 'integration'>('installation');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);

  // PRIORITY 1: Check for password recovery token FIRST (before anything else)
  useEffect(() => {
    const checkForRecoveryToken = () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        console.log('Recovery token detected in URL, opening reset password modal');
        setIsResetPasswordOpen(true);
        // Skip beta access check when resetting password
        setHasAccess(true);
      }
      
      // Done checking
      setIsCheckingRecovery(false);
    };

    // Check immediately on mount
    checkForRecoveryToken();

    // Also listen for auth state changes (backup detection method)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event detected');
        setIsResetPasswordOpen(true);
        setHasAccess(true); // Bypass beta gate for password reset
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // PRIORITY 2: Check for payment success AFTER recovery check
useEffect(() => {
  // Only process Stripe success *after auth session exists*
  if (loading) return;
  if (!user) return;
  if (isResetPasswordOpen) return;

  const params = new URLSearchParams(window.location.search);
  const paymentSuccess = params.get('payment_success');
  const sessionId = params.get('session_id');
  
  if (paymentSuccess === 'true' && sessionId) {
    console.log('Payment success detected, opening PaymentSuccess modal');
    setIsPaymentSuccessOpen(true);
    setHasAccess(true);
  }
}, [loading, user, isResetPasswordOpen]);

  // PRIORITY 3: Check for beta access (only if NOT doing password reset or payment success)
useEffect(() => {
  if (loading) return;
  if (isResetPasswordOpen || isPaymentSuccessOpen) return;

  const access = localStorage.getItem('beta_access');
  if (access === 'granted') {
    setHasAccess(true);
  }
}, [loading, isResetPasswordOpen, isPaymentSuccessOpen]);


  const handleGetStarted = () => {
    setIsChatOpen(true);
  };

  const handleContactUs = () => {
    setIsEmailModalOpen(true);
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const handleNavigate = (section: string) => {
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignIn = () => {
    if (user) {
      setIsDashboardOpen(true);
    } else {
      setIsSignInOpen(true);
    }
  };

  const handleOpenDashboard = () => {
    setIsDashboardOpen(true);
  };

  const handleResetPasswordClose = () => {
    setIsResetPasswordOpen(false);
    // Clean up URL hash after closing
    if (window.location.hash.includes('type=recovery')) {
      window.location.hash = '';
    }
  };

  const handlePaymentSuccessClose = () => {
    setIsPaymentSuccessOpen(false);
    // Clean up URL params after closing
    const url = new URL(window.location.href);
    url.searchParams.delete('payment_success');
    url.searchParams.delete('session_id');
    window.history.replaceState({}, '', url.toString());
  };

  const handleAccessGranted = () => {
    setHasAccess(true);
  };

  // Show loading while checking for recovery token
  if (loading || isCheckingRecovery){
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // HIGHEST PRIORITY: If reset password modal is open, show it (even without beta access)
  if (isResetPasswordOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ResetPassword onClose={handleResetPasswordClose} />
      </div>
    );
  }

  // SECOND HIGHEST PRIORITY: If payment success modal is open, show it (even without beta access)
  if (isPaymentSuccessOpen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <PaymentSuccess onClose={handlePaymentSuccessClose} />
      </div>
    );
  }

  // THIRD PRIORITY: Show beta access gate if needed
  if (!loading && !hasAccess) {
  return <AccessGate onAccessGranted={handleAccessGranted} />;
}

  // NORMAL APP: Show full site after beta access granted
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation
        onNavigate={handleNavigate}
        onGetStarted={handleGetStarted}
        onContactUs={handleContactUs}
        onSignIn={handleSignIn}
        onOpenDashboard={handleOpenDashboard}
      />
      <FloatingBadge onOpenChat={handleOpenChat} />
      <Hero onGetStarted={handleGetStarted} onSignUp={() => setIsSignUpOpen(true)} 
        onOpenChat={() => setIsChatOpen(true)}/>
      <Solutions
        onContactUs={handleContactUs}
        onOpenChat={handleOpenChat}
        onSignUp={() => setIsSignUpOpen(true)}
        //onOpenChat={() => setIsChatOpen(true)}
      />
      <Services onContactUs={handleContactUs} onOpenChat={handleOpenChat} />
      <Pricing onSignUp={() => setIsSignUpOpen(true)} onContactUs={handleContactUs} />
      <About />
      <FAQ />
      <Contact onOpenChat={handleOpenChat} />
      <Footer
        onOpenChat={handleOpenChat}
        onOpenDocs={(section) => {
          setDocsSection(section || 'installation');
          setIsDocsOpen(true);
        }}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />
 <CookieBanner />
      <ChatWidget isOpen={isChatOpen} onClose={handleCloseChat} />
      <EmailModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} />

      {isDocsOpen && (
        <Documentation
          onClose={() => setIsDocsOpen(false)}
          initialSection={docsSection}
        />
      )}

      {isSignInOpen && (
        <SignIn
          onClose={() => setIsSignInOpen(false)}
          onSwitchToSignUp={() => {
            setIsSignInOpen(false);
            setIsSignUpOpen(true);
          }}
        />
      )}

      {isSignUpOpen && (
        <SignUp
          onClose={() => setIsSignUpOpen(false)}
          onSwitchToSignIn={() => {
            setIsSignUpOpen(false);
            setIsSignInOpen(true);
          }}
        />
      )}

      {isDashboardOpen && user && (
        <UserDashboard onClose={() => setIsDashboardOpen(false)} />
      )}

      {isPrivacyOpen && (
        <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App