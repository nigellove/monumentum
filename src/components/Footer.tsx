import { MessageCircle, Mail } from 'lucide-react';

interface FooterProps {
  onOpenChat: () => void;
  onOpenDocs?: (section?: 'installation' | 'customization' | 'integration') => void;
  onOpenPrivacy?: () => void;
}

export default function Footer({ onOpenChat, onOpenDocs, onOpenPrivacy }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-600 py-12 px-6 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold mb-4" style={{ fontFamily: 'Audiowide, sans-serif' }}>
              <span className="text-slate-900">monumentum</span><span className="text-teal-500">.ai</span>
            </div>
            <p className="text-sm text-slate-600">
              AI-Native Sales & Service Platform transforming how businesses engage customers and capture leads.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="hover:text-teal-500 transition-colors">About Us</a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-teal-500 transition-colors">Solutions</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-teal-500 transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-teal-500 transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/docs/installation.html" className="hover:text-teal-500 transition-colors">
                  Installation Guide
                </a>
              </li>
              <li>
                <a href="/docs/customization.html" className="hover:text-teal-500 transition-colors">
                  Customization Guide
                </a>
              </li>
              <li>
                <a href="/docs/integration.html" className="hover:text-teal-500 transition-colors">
                  Integration Guide
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={onOpenChat}
                  className="flex items-center space-x-2 hover:text-teal-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>24/7 Chat - Click Here</span>
                </button>
              </li>
              <li>
                <a href="mailto:info@monumentum.ai" className="flex items-center space-x-2 hover:text-teal-500 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>info@monumentum.ai</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-500">
              &copy; {currentYear} Monumentum.ai All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              
              <a href="/docs/privacy.html" className="hover:text-teal-500 transition-colors">Privacy Policy</a>
              <a href="/docs/termsofservice.html" className="hover:text-teal-500 transition-colors">Terms of Service</a>
              <a href="/docs/cookie.html" className="hover:text-teal-500 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}