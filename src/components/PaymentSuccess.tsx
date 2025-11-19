import { useEffect, useState } from 'react'
import { CheckCircle, Mail, FileText, Loader2, Building, MapPin, Code, AlertCircle, FileCheck } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { generateAiPrompt } from '../lib/generateAiPrompt.ts'

interface PaymentSuccessProps {
  onClose?: () => void
}

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Policy template options
const POLICY_TEMPLATES = [
  {
    value: 'ecommerce',
    label: 'E-Commerce Service Policy',
    path: '/templates/Ecommerce/ECommerce_Svc_Template.md'
  },
  {
    value: 'healthcare_appointment',
    label: 'Appointment & Cancellation Policy (Healthcare)',
    path: '/templates/Healthcare_Wellness_Beauty/Appointment&Cancellation_Policy_Template.md'
  },
  {
    value: 'spa_salon',
    label: 'Spa/Salon Appointment Policy',
    path: '/templates/Healthcare_Wellness_Beauty/Spa_Salon_Appointment_Policy.md'
  },
  {
    value: 'home_repair',
    label: 'Home Repair Services Policy',
    path: '/templates/Home&Repair_Services/Home_Repair_Svcs_Cancellation&Scheduling_Template.md'
  },
  {
    value: 'golf_club',
    label: 'Golf Club Booking Policy',
    path: '/templates/Hospitality/Golf_Club_Booking Policy.md'
  },
  {
    value: 'hotel',
    label: 'Hotel Reservation & Cancellation',
    path: '/templates/Hospitality/Hotel_Reservation_and_Cancellation_Policy_Template.md'
  },
  {
    value: 'restaurant',
    label: 'Restaurant Reservation Policy',
    path: '/templates/Hospitality/Restaurant_Reservation_&_Cancellation_Policy_Template.md'
  },
  {
    value: 'professional_services',
    label: 'Professional Services Contract Policy',
    path: '/templates/Professional_Svcs/Professional_Services _Contract _& _Scope _Change_Policy_Template.md'
  },
  {
    value: 'saas',
    label: 'SaaS Subscription & Cancellation',
    path: '/templates/Professional_Svcs/SaaS_Subscription&Cancellation_Policy.md'
  }
]

export default function PaymentSuccess({ onClose }: PaymentSuccessProps) {
  const [email, setEmail] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [productId, setProductId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [showSetupForm, setShowSetupForm] = useState(true)
  const [setupComplete, setSetupComplete] = useState(false)
  
  // Form fields
  const [businessName, setBusinessName] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [platform, setPlatform] = useState('html')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  // Optional config fields (collected at signup)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [businessHours, setBusinessHours] = useState('')
  const [personalizedGreeting, setPersonalizedGreeting] = useState('')
  const [tone, setTone] = useState('friendly')
  const [language, setLanguage] = useState('en')
  const [additionalFields, setAdditionalFields] = useState('')
  const [followUpType, setFollowUpType] = useState('email_summary')
  const [followUpData, setFollowUpData] = useState('')
  
  // Policy fields (for CS/Integrated only)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [policyContent, setPolicyContent] = useState('')
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [acceptedLiability, setAcceptedLiability] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if product requires policy
  const needsPolicySection = productId === 'customer_service_agent' || productId === 'integrated_agent'

  /*cuseEffect(() => {
    // Get session ID from URL
    onst params = new URLSearchParams(window.location.search)
    const stripeSessionId = params.get('session_id')
    
    if (stripeSessionId) {
      console.log('Stripe session ID:', stripeSessionId)
      setSessionId(stripeSessionId)
    }

    // Get pending signup data
    const pendingData = localStorage.getItem('pending_signup')
    if (pendingData) {
      const data = JSON.parse(pendingData)
      setEmail(data.email)
      setUserId(data.userId)
      setBusinessEmail(data.email) // Pre-fill business email with signup email
      setProductId(data.productId || '')
    }
  }, [])*/

useEffect(() => {
  const checkPending = async () => {
    const pendingData = localStorage.getItem('pending_signup')
    if (!pendingData) return

    try {
      const data = JSON.parse(pendingData)
      setEmail(data.email)
      setUserId(data.userId)
      setBusinessEmail(data.email)
      setProductId(data.productId || '')

      const { data: profile } = await supabase
        .from('business_profiles')
        .select('customer_id')
        .eq('user_id', data.userId)
        .single()

      if (profile?.customer_id) {
        if (data.productId === 'integrated_agent' || data.productId === 'customer_service_agent') {
          setShowSetupForm(true)
        } else {
          window.location.href = '/dashboard'
        }
      } else {
        setShowSetupForm(true)
      }
    } catch (err) {
      setShowSetupForm(true)
    }
  }

  checkPending()
}, [])

  // Load template content when selected
  useEffect(() => {
    if (selectedTemplate && needsPolicySection) {
      const template = POLICY_TEMPLATES.find(t => t.value === selectedTemplate)
      if (template) {
        setLoadingTemplate(true)
        fetch(template.path)
          .then(response => {
            if (!response.ok) throw new Error('Template not found')
            return response.text()
          })
          .then(content => {
            setPolicyContent(content)
            setLoadingTemplate(false)
          })
          .catch(err => {
            console.error('Error loading template:', err)
            setPolicyContent('# Policy Template\n\nPlease add your customer service policy here.')
            setLoadingTemplate(false)
          })
      }
    }
  }, [selectedTemplate, needsPolicySection])

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    /*if (!businessName.trim()) {
      setError('Business name is required')
      return
    }*/

    if (!businessAddress.trim()) {
      setError('Business address is required')
      return
    }

    // Validate policy section for CS/Integrated products
    if (needsPolicySection) {
      if (!selectedTemplate) {
        setError('Please select a policy template')
        return
      }
      
      if (!policyContent.trim()) {
        setError('Policy content cannot be empty')
        return
      }
      
      if (!acceptedLiability) {
        setError('You must acknowledge the AI liability disclaimer')
        return
      }
    }

    if (!acceptedTerms) {
      setError('You must accept the terms to continue')
      return
    }

  setLoading(true)

    try {
      // Get pending signup data
      const pendingData = localStorage.getItem('pending_signup')
      if (!pendingData) {
        throw new Error('Signup data not found. Please contact support.')
      }

      const signupData = JSON.parse(pendingData)
      const userId = signupData.userId

            // STEP 0: Fetch business_name from pending_signups (stored at signup)
      const { data: pendingSignupData, error: pendingError } = await supabase
        .from('pending_signups')
        .select('business_name')
        .eq('user_id', userId)
        .single()

      const pendingBusinessName = pendingSignupData?.business_name || null

      // Platform instructions
      const platformInstructions = platform === 'html'
        ? 'Add the script to your website before the closing </body> tag'
        : platform === 'shopify'
        ? 'Install via Shopify App Store and configure in your admin panel - Coming Soon'
        : platform === 'woocommerce' 
        ? 'Install the WooCommerce plugin and activate in WordPress admin - Coming Soon'
        : platform === 'wordpress'
        ? 'Install our WordPress plugin for the easiest setup - Coming Soon'
        : platform === 'wix'
        ? 'Add via Custom Code in your Wix dashboard - Coming Soon'
        : platform === 'squarespace'
        ? 'Add via Code Injection in your Squarespace settings - Coming Soon'
        : platform === 'webflow'
        ? 'Add to your site-wide footer code in Webflow Project Settings - Coming Soon'
        : 'See our installation guide for detailed instructions'

      // STEP 1: Lookup customer_id from business_profiles table
      // (n8n already created this record via webhook)
      const { data: profileData, error: lookupError } = await supabase
        .from('business_profiles')
        .select('customer_id')
        .eq('user_id', userId)
        .single()

      if (lookupError || !profileData?.customer_id) {
        console.error('Error fetching customer_id:', lookupError)
        throw new Error('Account not fully provisioned. Please wait 30 seconds and refresh the page, or contact support.')
      }

      const customerId = profileData.customer_id


      // STEP 2: Update business_profiles table with enriched data
      const { error: profileError } = await supabase
        .from('business_profiles')
        .update({
          business_name: businessName.trim() || pendingBusinessName || 'Your Business',
          business_address: businessAddress.trim(),
          business_email: businessEmail.trim() || email,
          business_description: businessDescription.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (profileError) {
        console.error('Error updating business profile:', profileError)
        throw new Error('Failed to save business profile. Please contact support.')
      }

      // STEP 3: Update user_products table with platform selection
      // (n8n already created the record, we're just updating platform)
      
      // Build config object for this product
      const configObject: Record<string, any> = {
        platform_instructions: platformInstructions,
        setup_completed: true,
        setup_completed_at: new Date().toISOString(),
        website_url: websiteUrl.trim() || null,
        contact_phone: contactPhone.trim() || null,
        business_overview: businessDescription.trim(),
        business_hours: businessHours.trim() || null,
        personalized_greeting: personalizedGreeting.trim() || null,
        tone: tone,
        language: language,
        additional_fields: additionalFields.trim() ? additionalFields.split(',').map(f => f.trim()).filter(f => f) : [],
        follow_up_type: followUpType,
        follow_up_data: followUpData.trim() || null
      };

      // Generate ai_prompt and nest it in config_data
      const businessProfile = {
        business_name: businessName.trim(),
        business_description: businessDescription.trim(),
        business_email: businessEmail.trim() || email
      };
      const generatedPrompt = generateAiPrompt(configObject, businessProfile, productId);
      configObject.ai_prompt = generatedPrompt;

      const { error: productError } = await supabase
        .from('user_products')
        .update({
          platform: platform,
          config_data: configObject,
          ai_prompt: generatedPrompt
        })
        .eq('user_id', userId)

      if (productError) {
        console.error('Error updating product platform:', productError)
        // Don't fail completely - platform can be updated later
      }

   // STEP 3.5: Write Stripe customer record for subscription cancellation
      const stripeCustomerId = signupData.stripeCustomerId;
      
      if (stripeCustomerId) {
        const { error: stripeCustomerError } = await supabase
          .from('stripe_customers')
          .upsert({
            user_id: userId,
            customer_id: stripeCustomerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (stripeCustomerError) {
          console.error('Error saving Stripe customer:', stripeCustomerError);
        }
      }

      // STEP 4: If CS/Integrated product, save policy to customer_knowledge_base
      if (needsPolicySection && policyContent.trim()) {
        const { error: policyError } = await supabase
          .from('customer_knowledge_base')
          .insert({
            user_id: userId,              // ✅ Required for RLS and queries
            customer_id: customerId,       // ✅ Required for widget lookups
            doc_type: 'policy',
            doc_name: selectedTemplate || 'customer_service_policy',
            doc_content: policyContent.trim(),
            is_certified: acceptedLiability, // Track if they accepted liability
            certified_at: acceptedLiability ? new Date().toISOString() : null
          })

        if (policyError) {
          console.error('Error saving policy:', policyError)
          // Don't fail completely - policy can be added later via dashboard
        }
      }

      console.log('Setup completed successfully!')
      
      // Clear pending signup data
      localStorage.removeItem('pending_signup')
      
      // Mark setup as complete
      setSetupComplete(true)
      setShowSetupForm(false)

    } catch (err) {
      console.error('Error completing setup:', err)
      setError(err instanceof Error ? err.message : 'An error occurred. Please contact support.')
    } finally {
      setLoading(false)
    }

  }

  const handleSkipForNow = () => {
    // Clear pending signup data
    localStorage.removeItem('pending_signup')
    
    // Redirect to dashboard
    window.location.href = '/dashboard'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Payment Successful!</h1>
            </div>
            <p className="text-purple-100 text-lg">
              Your account is being set up automatically
            </p>
          </div>

          {/* Setup Form */}
          {showSetupForm && !setupComplete && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Complete Your Business Profile
                </h2>
                <p className="text-gray-600">
                  Help us personalize your AI agent by providing your business details.
                  You can skip this and complete it later in your dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCompleteSetup} className="space-y-6">
                {/* Business Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4" />
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Acme Home Services"
                    required
                  />
                </div>

                {/* Business Address */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Business Address *
                  </label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="123 Main St, City, State 12345"
                    required
                  />
                </div>

                {/* Business Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="contact@acmehomeservices.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email where leads will be sent (defaults to your account email)
                  </p>
                </div>

                {/* Business Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Business Description
                  </label>
                  <textarea
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors resize-none"
                    placeholder="Describe your business, services, and what makes you unique..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This helps your AI agent understand your business and provide better responses
                  </p>
                </div>

                {/* Optional Configuration Fields Section */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-4">Optional: AI Agent Configuration</h4>
                  <p className="text-xs text-blue-700 mb-4">These fields help customize your AI agent's behavior. You can update them later in your dashboard.</p>
                  
                  {/* Website URL */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  {/* Business Hours */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Hours
                    </label>
                    <input
                      type="text"
                      value={businessHours}
                      onChange={(e) => setBusinessHours(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                      placeholder="Mon-Fri 9AM-5PM, Sat 10AM-2PM"
                    />
                  </div>

                  {/* Personalized Greeting */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personalized Greeting
                    </label>
                    <input
                      type="text"
                      value={personalizedGreeting}
                      onChange={(e) => setPersonalizedGreeting(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                      placeholder="Welcome to our business!"
                    />
                  </div>

                  {/* Tone */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agent Tone
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                    >
                      <option value="friendly">Friendly</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="empathetic">Empathetic</option>
                      <option value="persuasive">Persuasive</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                    </select>
                  </div>

                  {/* Additional Fields */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Info Fields
                    </label>
                    <input
                      type="text"
                      value={additionalFields}
                      onChange={(e) => setAdditionalFields(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                      placeholder="Company size, Industry, Timeline (comma-separated)"
                    />
                  </div>

                  {/* Follow-Up Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lead Follow-Up Method
                    </label>
                    <select
                      value={followUpType}
                      onChange={(e) => setFollowUpType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                    >
                      <option value="email_summary">Email Summary</option>
                      <option value="calendly_link">Calendly Link</option>
                      <option value="booking_form">Booking Form</option>
                      <option value="phone_call">Phone Call</option>
                      <option value="google_meets">Google Meet Link</option>
                      <option value="zoom_link">Zoom Link</option>
                      <option value="microsoft_teams">Microsoft Teams Link</option>
                      <option value="custom_message">Custom Message</option>
                    </select>
                  </div>

                  {/* Follow-Up Data */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {followUpType?.includes('link') || followUpType?.includes('calendly') || followUpType?.includes('zoom') || followUpType?.includes('meets') || followUpType?.includes('teams') ? 'Link URL' : 'Follow-Up Message/Data'}
                    </label>
                    <input
                      type="text"
                      value={followUpData}
                      onChange={(e) => setFollowUpData(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
                      placeholder={followUpType?.includes('link') || followUpType?.includes('calendly') || followUpType?.includes('zoom') || followUpType?.includes('meets') || followUpType?.includes('teams') ? 'https://...' : 'Your custom message or data'}
                    />
                  </div>
                </div>

                {/* Platform Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Code className="w-4 h-4" />
                    Website Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="html">HTML/Custom Website</option>
                    {/*<option value="shopify">Shopify</option>
                    <option value="wordpress">WordPress/WooCommerce</option>*/}
                  </select>
                </div>

                {/* Policy Section (CS/Integrated only) */}
                {needsPolicySection && (
                  <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-purple-600" />
                      Customer Service Policy
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Policy Template
                        </label>
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                          required={needsPolicySection}
                        >
                          <option value="">Choose a template...</option>
                          {POLICY_TEMPLATES.map(template => (
                            <option key={template.value} value={template.value}>
                              {template.label}
                            </option>
                          ))}
                        </select>
                      </div>

                     {selectedTemplate && (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      Review & Edit Policy
    </label>
    {loadingTemplate ? (
      <div className="flex items-center justify-center py-8 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading template...
      </div>
    ) : (
      <textarea
        value={policyContent}
        onChange={(e) => setPolicyContent(e.target.value)}
        className="w-full h-48 p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
        placeholder="Edit your policy here..."
      />
    )}
  </div>
)}
{/* Shopify & WooCommerce - Coming Soon */}
{!selectedTemplate && (
  <div className="mt-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
    <p className="text-sm text-slate-600 mb-3 font-semibold">
      Shopify & WooCommerce integrations coming soon
    </p>
    <a 
      href="mailto:support@monumentum.ai?subject=Custom Integration Request"
      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
    >
      Contact Us for Custom Build
    </a>
  </div>
)}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={acceptedLiability}
                            onChange={(e) => setAcceptedLiability(e.target.checked)}
                            className="mt-1 w-4 h-4 text-purple-600 flex-shrink-0"
                            required={needsPolicySection}
                          />
                          <span className="text-sm text-gray-700">
                            <strong className="text-gray-900">AI Liability Disclaimer:</strong> I understand that the AI agent provides information based on the policy I upload, but I remain responsible for ensuring accuracy and compliance with applicable laws. Monumentum is not liable for policy interpretation errors.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms Checkbox */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-purple-600 flex-shrink-0"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      I confirm that the information provided is accurate and I agree to Monumentum's{' '}
                      <a
                        href="/docs/termsofservice.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline font-semibold"
                      >
                        Terms of Service
                      </a>
                    </span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin inline mr-2" size={20} />
                        Saving...
                      </>
                    ) : (
                      'Save Business Profile'
                    )}
                  </button>
                  {/*<button
                    type="button"
                    onClick={handleSkipForNow}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Skip for Now
                  </button>*/}
                </div>
              </form>

              <p className="mt-4 text-center text-sm text-gray-500">
                Don't worry, you can update these details anytime in your dashboard
              </p>
            </div>
          )}

          {/* Completion View */}
          {setupComplete && (
            <div className="p-8">
              {/* What's Happening Now */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Profile Saved Successfully
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-700">
                    Your business profile has been updated. Your AI agent now has all the information it needs to provide personalized responses.
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Next Steps
                </h2>
                
                <div className="space-y-4">
                  {/* Step 1: Check Email */}
                  <div className="flex gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Check Your Email</h3>
                      </div>
                      <p className="text-gray-700 mb-2">
                        We've sent a welcome email to <strong>{email}</strong> with:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Your unique Customer ID</li>
                        <li>• Widget installation code (ready to copy/paste)</li>
                        <li>• Step-by-step setup instructions</li>
                        <li>• Dashboard access link</li>
                      </ul>
                      <p className="text-sm text-gray-500 mt-2">
                        📧 Email should arrive within 1-2 minutes
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Install Widget */}
                  <div className="flex gap-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="w-5 h-5 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Install Your Widget</h3>
                      </div>
                      <p className="text-gray-700 mb-2">
                        Copy the code from your email and paste it into your website before the <code className="bg-gray-100 px-2 py-1 rounded text-sm">&lt;/body&gt;</code> tag.
                      </p>
                      <p className="text-sm text-gray-500">
                        ⏱️ Takes about 2 minutes • Works on any platform
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Access Dashboard */}
                  <div className="flex gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Access Your Dashboard
                      </h3>
                      <p className="text-gray-700 mb-3">
                        View real-time analytics, captured leads, and customize your AI agent.
                      </p>
                      <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                      >
                        Go to Dashboard →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 text-sm mb-3">
                  We're here to help you get started successfully.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => window.location.href = '/docs'}
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-white transition-colors"
                  >
                    📚 View Documentation
                  </button>
                  <button
                    onClick={() => window.location.href = 'mailto:support@monumentum.ai'}
                    className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-white transition-colors"
                  >
                    📧 Email Support
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {!setupComplete && 'Complete setup to personalize your experience'}
              {setupComplete && (
                <>
                  Didn't receive the email? Check your spam folder or{' '}
                  <button className="text-purple-600 hover:underline">
                    resend it
                  </button>
                </>
              )}
            </p>
            {onClose && setupComplete && (
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}