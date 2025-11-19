import { useState } from 'react';
import { Upload, FileText, Download, Check, AlertCircle, Eye } from 'lucide-react';

interface PolicyUploadProps {
  businessCategory: string;
  onComplete: (policyData: {
    doc_content: string;
    doc_name: string;
    is_certified: boolean;
    source: 'upload' | 'template' | 'default';
  }) => void;
  onBack: () => void;
}

interface BusinessCategory {
  id: string;
  label: string;
  icon: string;
  description: string;
  templatePath: string;
}

const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'ecommerce',
    label: 'Retail / Business Sales & E-Commerce',
    icon: '🛒',
    description: 'Online stores, retail websites, business-to-business sales',
    templatePath: '/templates/Ecommerce/ECommerce_Svc_Template.md'
  },
  {
    id: 'home_services',
    label: 'Home Services',
    icon: '🔧',
    description: 'Plumbing, HVAC, landscaping, repairs, contractors',
    templatePath: '/templates/Home&Repair_Services/Home_Repair_Svcs_Cancellation&Scheduling_Template.md'
  },
  {
    id: 'hospitality',
    label: 'Hospitality & Recreation',
    icon: '🍽️',
    description: 'Restaurants, hotels, golf clubs, event venues',
    templatePath: '/templates/Hospitality/Restaurant_Reservation_&_Cancellation_Policy_Template.md'
  },
  {
    id: 'professional_services',
    label: 'Professional Services & SaaS',
    icon: '💼',
    description: 'Consulting, agencies, software services, B2B services',
    templatePath: '/templates/Professional_Svcs/Professional_Services _Contract _& _Scope _Change_Policy_Template.md'
  },
  {
    id: 'healthcare',
    label: 'Healthcare, Wellness & Beauty',
    icon: '💆',
    description: 'Medical offices, salons, spas, fitness centers',
    templatePath: '/templates/Healthcare_Wellness_Beauty/Appointment&Cancellation_Policy_Template.md'
  },
  {
    id: 'other',
    label: 'Other / General Business',
    icon: '🏢',
    description: 'General professional services policy',
    templatePath: '/templates/Professional_Svcs/SaaS_Subscription&Cancellation_Policy.md'
  }
];

export default function PolicyUpload({ businessCategory, onComplete, onBack }: PolicyUploadProps) {
  const [step, setStep] = useState<'choice' | 'upload' | 'template' | 'default'>('choice');
  const [policyText, setPolicyText] = useState('');
  const [certifiedAccurate, setCertifiedAccurate] = useState(false);
  const [certifiedDisclaimer, setCertifiedDisclaimer] = useState(false);
  const [certifiedPrivacy, setCertifiedPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const category = BUSINESS_CATEGORIES.find(c => c.id === businessCategory) || BUSINESS_CATEGORIES[5];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf',
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.txt', '.md', '.pdf', '.docx'];

    const hasValidType = allowedTypes.includes(file.type) ||
                        allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType) {
      setError('Only TXT, MD, PDF, and DOCX files are allowed');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') ||
          file.type === 'text/markdown' || file.name.endsWith('.md')) {
        const text = await file.text();
        setPolicyText(text);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setError('PDF parsing not yet implemented. Please copy and paste your policy text instead.');
        setLoading(false);
        return;
      } else if (file.name.endsWith('.docx')) {
        setError('DOCX parsing not yet implemented. Please copy and paste your policy text instead.');
        setLoading(false);
        return;
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to read file. Please try again.');
      setLoading(false);
    }
  };

  const loadTemplate = async (templatePath: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(templatePath);
      if (!response.ok) throw new Error('Template not found');
      const text = await response.text();
      setPolicyText(text);
      setStep('template');
      setLoading(false);
    } catch (err) {
      setError('Failed to load template. Please try again or upload your own policy.');
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(category.templatePath);
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${category.id}_policy_template.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handleSubmit = () => {
    if (!policyText.trim()) {
      setError('Policy content is required');
      return;
    }

    if (!certifiedAccurate || !certifiedDisclaimer || !certifiedPrivacy) {
      setError('Please accept all certifications to continue');
      return;
    }

    onComplete({
      doc_content: policyText,
      doc_name: 'customer_service_policy',
      is_certified: true,
      source: step === 'upload' ? 'upload' : step === 'template' ? 'template' : 'default'
    });
  };

  const useDefaultPolicy = async () => {
    await loadTemplate(category.templatePath);
    setStep('default');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Customer Service Policy</h3>
        <p className="text-slate-600">
          Your AI agent needs a customer service policy to provide accurate information to customers.
        </p>
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Business Category:</strong> {category.label}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {step === 'choice' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            <button
              onClick={() => setStep('upload')}
              className="p-6 border-2 border-slate-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                  <Upload className="text-cyan-600" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">I Have My Own Policy</h4>
                  <p className="text-sm text-slate-600">Upload or paste your existing customer service policy</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => loadTemplate(category.templatePath)}
              className="p-6 border-2 border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FileText className="text-green-600" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">Use & Customize a Template</h4>
                  <p className="text-sm text-slate-600">Start with our professional template for {category.label}</p>
                </div>
              </div>
            </button>

            <button
              onClick={useDefaultPolicy}
              className="p-6 border-2 border-amber-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <Check className="text-amber-600" size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">Use Default Template (For Now)</h4>
                  <p className="text-sm text-slate-600">Use our standard template - you can customize it later in your dashboard</p>
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {step === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-cyan-500 transition-colors">
            <Upload className="mx-auto mb-4 text-slate-400" size={48} />
            <h4 className="font-bold text-slate-900 mb-2">Upload Policy Document</h4>
            <p className="text-sm text-slate-600 mb-4">TXT, MD, PDF, or DOCX (Max 5MB)</p>
            <input
              type="file"
              accept=".txt,.md,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="policy-upload"
            />
            <label
              htmlFor="policy-upload"
              className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-cyan-700 transition-colors"
            >
              Choose File
            </label>
          </div>

          <div className="text-center text-slate-500 font-semibold">OR</div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Paste Your Policy
            </label>
            <textarea
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              className="w-full h-64 px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors resize-none font-mono text-sm"
              placeholder="Paste your customer service policy here..."
            />
            <p className="mt-1 text-sm text-slate-500">
              {policyText.length} characters
            </p>
          </div>

          {policyText && (
            <>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certifiedAccurate}
                    onChange={(e) => setCertifiedAccurate(e.target.checked)}
                    className="mt-1 w-4 h-4 text-cyan-600"
                  />
                  <span className="text-sm text-slate-700">
                    I certify that this customer service policy accurately reflects my business's practices (guarantees, cancellations, refunds, etc.)
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certifiedDisclaimer}
                    onChange={(e) => setCertifiedDisclaimer(e.target.checked)}
                    className="mt-1 w-4 h-4 text-cyan-600"
                  />
                  <span className="text-sm text-slate-700">
                    I understand that the AI agent will use this policy to answer my customers' questions, and I am responsible for keeping it accurate and up-to-date
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={certifiedPrivacy}
                    onChange={(e) => setCertifiedPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 text-cyan-600"
                  />
                  <span className="text-sm text-slate-700">
                    I can download a copy of this policy and may update it anytime from my dashboard
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choice')}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!certifiedAccurate || !certifiedDisclaimer || !certifiedPrivacy || loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {(step === 'template' || step === 'default') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900">
              {step === 'default' ? 'Default Policy Template' : 'Customize Your Policy'}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Eye size={16} />
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>

          {step === 'default' && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-1">
                    Using Default Generic Template
                  </p>
                  <p className="text-sm text-amber-800">
                    This is a standard template that does not contain specific information about your business policies. You should customize it as soon as possible from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!showPreview ? (
            <textarea
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              className="w-full h-96 px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-cyan-500 focus:outline-none transition-colors resize-none font-mono text-sm"
              placeholder="Loading template..."
            />
          ) : (
            <div className="h-96 overflow-y-auto px-4 py-3 border-2 border-slate-200 rounded-lg bg-white prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans">{policyText}</pre>
            </div>
          )}

          <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
            {step === 'default' ? (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certifiedAccurate}
                  onChange={(e) => setCertifiedAccurate(e.target.checked)}
                  className="mt-1 w-4 h-4 text-amber-600"
                />
                <span className="text-sm text-slate-700">
                  I acknowledge this is a <strong>generic template</strong> that does not contain information specific to my business, and I will customize it to reflect my actual policies as soon as possible
                </span>
              </label>
            ) : (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={certifiedAccurate}
                  onChange={(e) => setCertifiedAccurate(e.target.checked)}
                  className="mt-1 w-4 h-4 text-cyan-600"
                />
                <span className="text-sm text-slate-700">
                  I certify that this customer service policy accurately reflects my business's practices (guarantees, cancellations, refunds, etc.)
                </span>
              </label>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={certifiedDisclaimer}
                onChange={(e) => setCertifiedDisclaimer(e.target.checked)}
                className="mt-1 w-4 h-4 text-cyan-600"
              />
              <span className="text-sm text-slate-700">
                I understand that the AI agent will use this policy to answer my customers' questions, and I am responsible for keeping it accurate and up-to-date
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={certifiedPrivacy}
                onChange={(e) => setCertifiedPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 text-cyan-600"
              />
              <span className="text-sm text-slate-700">
                I can download a copy of this policy and may update it anytime from my dashboard
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep('choice'); setPolicyText(''); }}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!certifiedAccurate || !certifiedDisclaimer || !certifiedPrivacy || loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      )}
    </div>
  );
}
