import { useState } from 'react';
import { X, Book, Code, Puzzle } from 'lucide-react';

interface DocumentationProps {
  onClose: () => void;
  initialSection?: 'installation' | 'customization' | 'integration';
}

export default function Documentation({ onClose, initialSection = 'installation' }: DocumentationProps) {
  const [currentSection, setCurrentSection] = useState(initialSection);

  const sections = [
    { id: 'installation', label: 'Installation', icon: Code },
    { id: 'customization', label: 'Customization', icon: Puzzle },
    { id: 'integration', label: 'Integration', icon: Book },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-2xl max-w-4xl w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 bg-slate-50 p-6 rounded-tl-2xl md:rounded-bl-2xl border-b md:border-b-0 md:border-r border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Documentation</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(section.id as typeof currentSection)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        currentSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex-1 p-8">
              {currentSection === 'installation' && <InstallationGuide />}
              {currentSection === 'customization' && <CustomizationGuide />}
              {currentSection === 'integration' && <IntegrationGuide />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstallationGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Installation Guide</h1>
      <p className="text-lg text-slate-600 mb-6">
        Get your AI Sales Agent up and running in minutes with our simple installation process.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 1: Get Your Widget Code</h2>
      <p className="text-slate-700 mb-4">
        After signing up, you'll receive a unique customer ID in your welcome email. Your widget code will look like this:
      </p>
      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-6">
        <pre className="text-sm">
{`<!-- Monumentum Sales Agent -->
<script src="https://cdn.monumentum.ai/chat-widget.js"></script>
<script>
  MonumentumChat.init({
    customerId: 'YOUR_CUSTOMER_ID',
    primaryColor: '#0066cc',
    position: 'bottom-right'
  });
</script>`}
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 2: Add to Your Website</h2>
      <p className="text-slate-700 mb-4">
        Copy the widget code and paste it just before the closing <code className="bg-slate-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag of your website.
      </p>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">For WordPress:</h3>
      <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-6">
        <li>Go to Appearance → Theme File Editor</li>
        <li>Select your theme's footer.php file</li>
        <li>Paste the code before <code className="bg-slate-100 px-2 py-1 rounded">&lt;/body&gt;</code></li>
        <li>Click "Update File"</li>
      </ol>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">For Shopify:</h3>
      <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-6">
        <li>Go to Online Store → Themes</li>
        <li>Click Actions → Edit code</li>
        <li>Open theme.liquid file</li>
        <li>Paste the code before <code className="bg-slate-100 px-2 py-1 rounded">&lt;/body&gt;</code></li>
        <li>Click "Save"</li>
      </ol>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">For Custom HTML Sites:</h3>
      <p className="text-slate-700 mb-6">
        Simply paste the code before the closing <code className="bg-slate-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag in your HTML files.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Step 3: Test Your Widget</h2>
      <p className="text-slate-700 mb-4">
        Visit your website and look for the chat widget in the bottom-right corner. Click it to test the conversation flow.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-blue-900 font-semibold">Need help?</p>
        <p className="text-blue-800">
          Contact us at <a href="mailto:info@monumentum.ai" className="text-blue-600 hover:underline">info@monumentum.ai</a> and we'll assist you with installation.
        </p>
      </div>
    </div>
  );
}

function CustomizationGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Customization Guide</h1>
      <p className="text-lg text-slate-600 mb-6">
        Customize your AI Sales Agent to match your brand and business needs.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Widget Appearance</h2>
      <p className="text-slate-700 mb-4">
        Customize the look and feel of your chat widget through the initialization options:
      </p>
      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-6">
        <pre className="text-sm">
{`MonumentumChat.init({
  customerId: 'YOUR_CUSTOMER_ID',
  primaryColor: '#0066cc',     // Your brand color
  position: 'bottom-right',     // or 'bottom-left'
  greeting: 'Hi! How can I help?',
  avatar: 'https://your-site.com/avatar.png'
});`}
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Conversation Flow</h2>
      <p className="text-slate-700 mb-4">
        Access your dashboard to customize what information your AI agent collects:
      </p>
      <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
        <li>Custom greeting messages</li>
        <li>Lead qualification questions</li>
        <li>Required vs. optional fields</li>
        <li>Follow-up questions based on responses</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Branding</h2>
      <p className="text-slate-700 mb-4">
        Match the AI agent to your brand identity:
      </p>
      <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
        <li>Upload your company logo</li>
        <li>Set brand colors for buttons and headers</li>
        <li>Customize font styles</li>
        <li>Add your business name and tagline</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">AI Personality</h2>
      <p className="text-slate-700 mb-4">
        Configure how your AI agent communicates:
      </p>
      <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
        <li>Tone of voice (professional, friendly, casual)</li>
        <li>Response length preferences</li>
        <li>Industry-specific terminology</li>
        <li>Multilingual support</li>
      </ul>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <p className="text-green-900 font-semibold">Pro Tip:</p>
        <p className="text-green-800">
          Test different greeting messages and conversation flows to see what resonates best with your visitors.
        </p>
      </div>
    </div>
  );
}

function IntegrationGuide() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Integration Guide</h1>
      <p className="text-lg text-slate-600 mb-6">
        Connect your AI Sales Agent with your existing tools and workflows.
      </p>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">CRM Integrations</h2>
      <p className="text-slate-700 mb-4">
        Automatically sync captured leads to your CRM:
      </p>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">HubSpot</h3>
      <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-6">
        <li>Go to Dashboard → Integrations</li>
        <li>Click "Connect HubSpot"</li>
        <li>Authorize Monumentum to access your HubSpot account</li>
        <li>Map fields from AI conversations to HubSpot properties</li>
        <li>Enable automatic contact creation</li>
      </ol>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Salesforce</h3>
      <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-6">
        <li>Navigate to Dashboard → Integrations</li>
        <li>Select "Connect Salesforce"</li>
        <li>Enter your Salesforce credentials</li>
        <li>Configure lead assignment rules</li>
        <li>Set up custom field mapping</li>
      </ol>

      <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">Pipedrive</h3>
      <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-6">
        <li>Access Dashboard → Integrations</li>
        <li>Choose "Connect Pipedrive"</li>
        <li>Authenticate with your Pipedrive account</li>
        <li>Select the pipeline for new leads</li>
        <li>Define deal stages for qualified leads</li>
      </ol>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Email Notifications</h2>
      <p className="text-slate-700 mb-4">
        Receive instant notifications when leads are captured:
      </p>
      <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
        <li>Real-time email alerts for new conversations</li>
        <li>Daily/weekly lead summary reports</li>
        <li>Custom notification rules based on lead quality</li>
        <li>Team member assignments</li>
      </ul>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Webhook Integration</h2>
      <p className="text-slate-700 mb-4">
        For custom integrations, use our webhook API:
      </p>
      <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-6">
        <pre className="text-sm">
{`// Webhook payload example
{
  "event": "lead_captured",
  "customer_id": "your_customer_id",
  "timestamp": "2025-01-15T10:30:00Z",
  "lead": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Inc",
    "message": "Interested in your services"
  }
}`}
        </pre>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">API Access</h2>
      <p className="text-slate-700 mb-4">
        Access your data programmatically through our REST API:
      </p>
      <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6">
        <li>Retrieve conversation history</li>
        <li>Export lead data</li>
        <li>Update AI agent settings</li>
        <li>Generate analytics reports</li>
      </ul>

      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mt-6">
        <p className="text-cyan-900 font-semibold">API Documentation:</p>
        <p className="text-cyan-800">
          Full API documentation coming soon. Contact <a href="mailto:info@monumentum.ai" className="text-cyan-600 hover:underline">info@monumentum.ai</a> for early access.
        </p>
      </div>
    </div>
  );
}
