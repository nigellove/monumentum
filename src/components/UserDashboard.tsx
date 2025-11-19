import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, UserFile, UserProduct } from '../lib/supabase';
import { generateAiPrompt } from '../lib/generateAiPrompt.ts'
import { Settings, FileText, BarChart3, Book, Package, LogOut, Download, Calendar, X, ShoppingCart, Save, Link as LinkIcon, Globe, Clock } from 'lucide-react';
import WidgetCode from '../components/WidgetCode.tsx'


interface UserDashboardProps {
  onClose: () => void;
}

interface BusinessProfile {
  business_name: string;
  business_email: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_zip: string;
  business_description: string;
  customer_id: string;
}

interface ConversationStats {
  date: string;
  count: number;
}

export default function UserDashboard({ onClose }: UserDashboardProps) {
  const { user, signOut } = useAuth();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [configData, setConfigData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'configure' | 'reports' | 'insights' | 'resources' | 'products' | 'AIWidget' |'subscriptions'>('configure');
  const [conversationStats, setConversationStats] = useState<ConversationStats[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const CUSTOMER_PORTAL_URL = 'https://billing.stripe.com/p/login/test_7sY5kFbhz1VP9mQ29Y4gg00';

  useEffect(() => {
    loadUserData();
  }, [user]);

  //New URL SIGN CODE Begin
const generateSignedUrl = async (filePath: string): Promise<string> => {
  if (!filePath) return '';

  let storagePath = filePath;

  // 1️⃣ Strip full Supabase domain if present
  const supabaseBase = 'https://nkwmfqbuhvtloihbrwef.supabase.co/storage/v1/object/';
  if (storagePath.startsWith(supabaseBase)) {
    storagePath = storagePath.substring(supabaseBase.length);
  }

  // 2️⃣ Remove optional 'public/users/' or 'users/' prefix
  if (storagePath.startsWith('public/users/')) {
    storagePath = storagePath.replace('public/users/', '');
  } else if (storagePath.startsWith('users/')) {
    storagePath = storagePath.replace('users/', '');
  }

  // 3️⃣ Generate signed URL for private bucket
  const { data, error } = await supabase.storage
    .from('users')
    .createSignedUrl(storagePath, 3600);

  if (error) {
    console.error('Error generating signed URL:', error, { storagePath, filePath });
    return filePath; // fallback
  }

  return data?.signedUrl || filePath;
};

    /*const generateSignedUrl = async (filePath: string): Promise<string> => {
    if (!filePath) return '';
    
    // Handle both old public URLs and new file paths
    const storagePath = filePath.includes('/storage/v1/object/public/')
      ? filePath.split('/storage/v1/object/public/').pop() || filePath
      : filePath;
    
    const { data, error } = await supabase.storage
      .from('users')
      .createSignedUrl(storagePath, 3600);
    
    if (error) {
      console.error('Error generating signed URL:', error);
      return filePath; // Fallback to original
    }
    
    return data?.signedUrl || filePath;
  };*/

  //const loadUserData = async () => { //Duplicated

    //End USER URL SIGN CODE End

  const loadUserData = async () => {
    if (!user) return;

    setLoading(true);

    const [filesResult, productsResult, profileResult, conversationsResult] = await Promise.all([
      supabase.from('user_files').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false }),
      supabase.from('user_products').select('*').eq('user_id', user.id).order('started_at', { ascending: false }),
      supabase.from('business_profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('conversations').select('customer_id, created_at').order('created_at', { ascending: false }).limit(100)
    ]);

    //if (filesResult.data) setFiles(filesResult.data); //Edit out old code replace with following


   
  // Generate signed URLs for each file
  /*const filesWithSignedUrls = await Promise.all(
    filesResult.data.map(async (file) => ({
      ...file,
      file_url: await generateSignedUrl(file.file_path || file.file_url.replace('https://nkwmfqbuhvtloihbrwef.supabase.co/storage/v1/object/public/', ''))
    }))
  );
  setFiles(filesWithSignedUrls);*/
if (filesResult.data) {

const filesWithSignedUrls = await Promise.all(
  filesResult.data.map(async (file) => ({
    ...file,
    file_url: await generateSignedUrl(file.file_path || file.file_url)
  }))
);
setFiles(filesWithSignedUrls);
}
// End of replacement

    if (productsResult.data) {
      setProducts(productsResult.data);
      if (productsResult.data[0]?.config_data) {
        setConfigData(productsResult.data[0].config_data);
      }
    }
    if (profileResult.data) setBusinessProfile(profileResult.data);

    if (conversationsResult.data && profileResult.data) {
      const customerConvos = conversationsResult.data.filter(
        c => c.customer_id === profileResult.data.customer_id
      );

      const statsMap = new Map<string, number>();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();

      last7Days.forEach(date => statsMap.set(date, 0));

      customerConvos.forEach(conv => {
        const date = new Date(conv.created_at).toISOString().split('T')[0];
        if (statsMap.has(date)) {
          statsMap.set(date, statsMap.get(date)! + 1);
        }
      });

      setConversationStats(
        Array.from(statsMap.entries()).map(([date, count]) => ({ date, count }))
      );
    }

    setLoading(false);
  };

  const handleSaveConfig = async () => {
    if (!user || !products[0] || !businessProfile) return;

    setSaving(true);
    
    try {
      // Parse additional_fields from comma-separated string to array
      const additionalFieldsArray = configData.additional_fields
        ? (typeof configData.additional_fields === 'string' 
          ? configData.additional_fields.split(',').map((f: string) => f.trim()).filter((f: string) => f)
          : configData.additional_fields)
        : [];

      // Build complete config_data object
      const updatedConfigData: Record<string, any> = {
        website_url: configData.website_url || null,
        contact_phone: configData.contact_phone || null,
        business_overview: configData.business_overview || null,
        business_hours: configData.business_hours || null,
        personalized_greeting: configData.personalized_greeting || null,
        tone: configData.tone || 'friendly',
        language: configData.language || 'en',
        additional_fields: additionalFieldsArray,
        follow_up_type: configData.follow_up_type || 'email_summary',
        follow_up_data: configData.follow_up_data || null,
        platform_instructions: configData.platform_instructions || null,
        setup_completed: configData.setup_completed !== undefined ? configData.setup_completed : true,
        setup_completed_at: configData.setup_completed_at || new Date().toISOString()
      };

      // Generate ai_prompt based on product type
      const productName = products[0].product_name || products[0].product_id || '';
      const newAiPrompt = generateAiPrompt(updatedConfigData, businessProfile, productName);

      // Nest ai_prompt inside config_data so n8n has everything in one place
      updatedConfigData.ai_prompt = newAiPrompt;

      // Update user_products with both config_data and ai_prompt
      const { error: productError } = await supabase
        .from('user_products')
        .update({ 
          config_data: updatedConfigData,
          ai_prompt: newAiPrompt
        })
        .eq('id', products[0].id);

      if (productError) {
        alert('Error saving configuration. Please try again.');
        setSaving(false);
        return;
      }

      // Update business_profiles if business_name changed
      const { error: profileError } = await supabase
        .from('business_profiles')
        .update({ business_name: configData.business_name })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error updating business name:', profileError);
        // Don't fail completely - config was saved
      }

      alert('Configuration saved successfully! Your AI agent will use these settings on the next chat.');
    } catch (err: any) {
      console.error('Save error:', err);
      alert('Error saving configuration. Please try again.');
    }
    setSaving(false);
  };



  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const cancelSubscription = async () => {
    setCancelling(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { immediate: false }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      if (!data || !data.success) {
        throw new Error(data?.message || 'Cancellation request was not processed successfully');
      }

      setShowCancelModal(false);
      alert('✓ Subscription cancelled successfully!\n\nYour subscription will remain active until the end of your current billing period. You can reactivate anytime before then.');
      loadUserData();
    } catch (err: any) {
      console.error('Cancellation error:', err);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Error cancelling subscription: ';
      
      if (err.message?.includes('401') || err.message?.includes('auth')) {
        errorMessage += 'Your session may have expired. Please sign in again and try again.';
      } else if (err.message?.includes('Stripe')) {
        errorMessage += 'There was an issue with your billing service. Please try again in a moment, or contact support@monumentum.ai if the problem persists.';
      } else if (err.message?.includes('network')) {
        errorMessage += 'Network connection issue. Please check your connection and try again.';
      } else {
        errorMessage += err.message || 'An unexpected error occurred. Please try again.';
      }
      
      alert(errorMessage + '\n\nIf this continues, please email support@monumentum.ai for help, or manage your subscription directly in Stripe customer portal.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const tabs = [
    { id: 'configure', label: 'Configure My Agent', icon: Settings },
    { id: 'reports', label: 'My Reports', icon: FileText },
    { id: 'insights', label: 'My Insights', icon: BarChart3 },
    { id: 'resources', label: 'Resources', icon: Book },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'AIWidget', label: 'Widget Code', icon: FileText },
    { id: 'subscriptions', label: 'Subscriptions', icon: ShoppingCart },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl max-w-6xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-t-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">My Portal</h2>
          <p className="text-white/90">{user?.email}</p>
        </div>

        <div className="p-8">
          <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 font-semibold transition-colors relative whitespace-nowrap rounded-t-lg ${
                    activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading your data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'configure' && (
                <ConfigureAgent
                  configData={configData}
                  setConfigData={setConfigData}
                  businessProfile={businessProfile}
                  onSave={handleSaveConfig}
                  saving={saving}
                  productId={products[0]?.product_name}
                />
              )}

              {activeTab === 'reports' && (
                <MyReports files={files} formatDate={formatDate} formatFileSize={formatFileSize} />
              )}

              {activeTab === 'insights' && (
                <MyInsights
                  stats={conversationStats}
                  customerId={businessProfile?.customer_id || ''}
                />
              )}

              {activeTab === 'resources' && <Resources />}

              {activeTab === 'products' && (
                <MyProducts products={products} formatDate={formatDate} getStatusColor={getStatusColor} />
              )}

              {activeTab === 'AIWidget' && (
  <WidgetCode 
  userId={user?.id || ''}  
  customerId={businessProfile?.customer_id || ''}
  />
)}



              {activeTab === 'subscriptions' && (
                <Subscriptions onCancelSubscription={handleCancelClick} />
              )}
            </>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Need help? <a href="mailto:info@monumentum.ai" className="text-blue-600 hover:underline">Contact Support</a>
            </p>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>

        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cancel Subscription?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel your subscription? It will remain active until the end of your current billing period.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={cancelSubscription}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

function ConfigureAgent({ configData, setConfigData, businessProfile, onSave, saving }: any) {
  const updateConfig = (key: string, value: any) => {
    setConfigData({ ...configData, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Configure Your AI Agent</h3>
        <p className="text-blue-800 text-sm">
          Customize how your AI agent interacts with visitors and collects information.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Globe size={18} className="text-blue-600" />
            Business Information
          </h4>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
            <input
              type="text"
              value={configData.business_name || businessProfile?.business_name || ''}
              onChange={(e) => updateConfig('business_name', e.target.value)}
              placeholder="Your Business Name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">Set at signup, can be updated here</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Website URL</label>
            <input
              type="url"
              value={configData.website_url || ''}
              onChange={(e) => updateConfig('website_url', e.target.value)}
              placeholder="https://yourbusiness.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Contact Phone</label>
            <input
              type="tel"
              value={configData.contact_phone || ''}
              onChange={(e) => updateConfig('contact_phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Business Overview</label>
            <textarea
              value={configData.business_overview || businessProfile?.business_description || ''}
              onChange={(e) => updateConfig('business_overview', e.target.value)}
              placeholder="Brief description of your business and what you offer..."
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Business Hours
            </label>
            <input
              type="text"
              value={configData.business_hours || ''}
              onChange={(e) => updateConfig('business_hours', e.target.value)}
              placeholder="Mon-Fri: 9am-5pm, Sat: 10am-2pm"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Settings size={18} className="text-blue-600" />
            Agent Behavior
          </h4>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Personalized Greeting</label>
            <input
              type="text"
              value={configData.personalized_greeting || ''}
              onChange={(e) => updateConfig('personalized_greeting', e.target.value)}
              placeholder="Hi! How can I help you today?"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
            <select
              value={configData.tone || 'friendly'}
              onChange={(e) => updateConfig('tone', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="formal">Formal</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="empathetic">Empathetic</option>
              <option value="persuasive">Persuasive</option>
              <option value="technical">Technical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
            <select
              value={configData.language || 'en'}
              onChange={(e) => updateConfig('language', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Fields to Collect</label>
            <input
              type="text"
              value={configData.additional_fields?.join(', ') || ''}
              onChange={(e) => updateConfig('additional_fields', e.target.value.split(',').map(f => f.trim()).filter(Boolean))}
              placeholder="phone, company, message"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">Comma-separated (name and email are collected by default)</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-slate-200 pt-6">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <LinkIcon size={18} className="text-blue-600" />
          Follow-Up Actions
        </h4>


        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Follow-Up Type</label>
            <select
              value={configData.follow_up_type || 'email_summary'}
              onChange={(e) => updateConfig('follow_up_type', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="email_summary">Email Summary</option>
              <option value="calendly_link">Calendly Booking</option>
              <option value="booking_form">Booking Form</option>
              <option value="phone_call">Phone Call</option>
              <option value="google_meets">Google Meet</option>
              <option value="zoom_link">Zoom Link</option>
              <option value="microsoft_teams">Microsoft Teams</option>
              <option value="custom_message">Custom Message</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {configData.follow_up_type?.includes('link') || configData.follow_up_type?.includes('calendly') || configData.follow_up_type?.includes('zoom') || configData.follow_up_type?.includes('meets') || configData.follow_up_type?.includes('teams') ? 'Link URL' : 'Follow-Up Data'}
            </label>
            <input
              type="text"
              value={configData.follow_up_data || ''}
              onChange={(e) => updateConfig('follow_up_data', e.target.value)}
              placeholder={
                configData.follow_up_type?.includes('link') || configData.follow_up_type?.includes('calendly')
                  ? 'https://calendly.com/your-link'
                  : configData.follow_up_type?.includes('zoom')
                  ? 'https://zoom.us/j/your-meeting'
                  : 'Custom message or link'
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-700">
            <strong>Examples:</strong>
          </p>
          <ul className="text-sm text-slate-600 mt-2 space-y-1">
            <li>• <strong>Calendly:</strong> https://calendly.com/yourbusiness/consultation</li>
            <li>• <strong>OpenTable:</strong> https://www.opentable.com/your-restaurant</li>
            <li>• <strong>Custom Message:</strong> "We'll call you within 24 hours"</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
  <p className="text-sm text-slate-700 m-0">
    <strong>💡 Updates to Service Templates & Custom Configuration:</strong> Your agent is configured and ready to use. Please Note: Currently custom templates and policy adjustments require our updates from our support team. 
    <a href="mailto:support@monumentum.ai" className="text-blue-600 hover:underline"> Contact support@monumentum.ai</a> to get support on making detailed configuration changes.
  </p>
</div>

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

function MyReports({ files, formatDate, formatFileSize }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
        <h3 className="font-semibold text-cyan-900 mb-2">Weekly Analytics Reports</h3>
        <p className="text-cyan-800 text-sm">
          Access your weekly lead summaries, conversation insights, and performance reports sent to your email.
        </p>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <FileText className="mx-auto mb-4 text-slate-400" size={48} />
          <p className="text-slate-600 text-lg">No reports yet</p>
          <p className="text-slate-500 text-sm mt-2">Your first weekly report will arrive this Monday</p>
        </div>
      ) : (
        files.map((file: any) => (
          <div
            key={file.id}
            className="border-2 border-slate-100 rounded-xl p-6 hover:border-blue-200 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-lg mb-2">
                  {file.file_name}
                </h3>
                {file.description && (
                  <p className="text-slate-600 mb-3">{file.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {formatDate(file.uploaded_at)}
                  </span>
                  <span>{formatFileSize(file.file_size)}</span>
                </div>
              </div>
              <a
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={18} />
                Download
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function MyInsights({ stats, customerId }: { stats: ConversationStats[]; customerId: string }) {
  const totalConversations = stats.reduce((sum, s) => sum + s.count, 0);
  const maxCount = Math.max(...stats.map(s => s.count), 1);

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-semibold text-green-900 mb-2">Conversation Analytics</h3>
        <p className="text-green-800 text-sm">
          Track your AI agent's conversations and lead capture performance over the last 7 days.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">{totalConversations}</div>
          <div className="text-sm text-slate-600">Total Conversations</div>
          <div className="text-xs text-slate-500 mt-1">Last 7 days</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.length > 0 ? Math.round(totalConversations / 7) : 0}
          </div>
          <div className="text-sm text-slate-600">Avg. Per Day</div>
          <div className="text-xs text-slate-500 mt-1">Daily average</div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <div className="text-3xl font-bold text-cyan-600 mb-2">{Math.max(...stats.map(s => s.count), 0)}</div>
          <div className="text-sm text-slate-600">Peak Day</div>
          <div className="text-xs text-slate-500 mt-1">Highest activity</div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <h4 className="font-semibold text-slate-900 mb-4">Conversations by Day</h4>
        <div className="space-y-3">
          {stats.map((stat) => (
            <div key={stat.date} className="flex items-center gap-3">
              <div className="text-sm text-slate-600 w-24">
                {new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full flex items-center justify-end px-3"
                  style={{ width: `${(stat.count / maxCount) * 100}%` }}
                >
                  {stat.count > 0 && (
                    <span className="text-white text-sm font-semibold">{stat.count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {customerId && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-2">Lead Data Export</h4>
          <p className="text-slate-600 text-sm mb-4">
            Download detailed conversation data and captured lead information from your database.
          </p>
          <a
            href={`mailto:info@monumentum.ai?subject=Lead Data Export Request&body=Customer ID: ${customerId}%0A%0APlease export my lead data.`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Request Lead Export
          </a>
        </div>
      )}
    </div>
  );
}

function Resources() {
  const resources = [
    {
      title: 'Installation Guide',
      description: 'Step-by-step instructions for installing your AI agent on any platform',
      topics: ['WordPress Setup', 'Shopify Integration', 'Custom HTML', 'Testing Your Widget'],
      url: 'https://monumentum.ai/docs/installation'
    },
    {
      title: 'Customization Guide',
      description: 'Learn how to customize your agent\'s appearance and behavior',
      topics: ['Brand Colors', 'Widget Position', 'Greeting Messages', 'AI Personality'],
      url: 'https://monumentum.ai/docs/customization'
    },
    {
      title: 'Integration Guide',
      description: 'Connect your AI agent with CRMs and other tools',
      topics: ['HubSpot Integration', 'Salesforce Setup', 'Pipedrive Connection', 'Webhook API'],
      url: 'https://monumentum.ai/docs/integration'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">Documentation & Guides</h3>
        <p className="text-purple-800 text-sm">
          Everything you need to get the most out of your AI Sales Agent.
        </p>
      </div>

      {resources.map((resource, idx) => (
        <div key={idx} className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-blue-200 transition-all">
          <h4 className="font-semibold text-slate-900 text-lg mb-2">{resource.title}</h4>
          <p className="text-slate-600 mb-4">{resource.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.topics.map((topic, i) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                {topic}
              </span>
            ))}
          </div>
          
            <a href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <Book size={18} />
            View Guide
          </a>
        </div>
      ))}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h4 className="font-semibold text-slate-900 mb-2">Need More Help?</h4>
        <p className="text-slate-600 text-sm mb-4">
          Our support team is here to help you succeed with your AI Sales Agent.
        </p>
        
         <a href="mailto:info@monumentum.ai"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}

function MyProducts({ products, formatDate, getStatusColor }: any) {
  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <Package className="mx-auto mb-4 text-slate-400" size={48} />
          <p className="text-slate-600 text-lg">No active products</p>
        </div>
      ) : (
        products.map((product: any) => (
          <div key={product.id} className="border-2 border-slate-100 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">{product.product_name}</h3>
                {product.description && (
                  <p className="text-slate-600 mt-1">{product.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(product.status)}`}>
                {product.status}
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Price:</span>
                <span className="ml-2 font-semibold text-slate-900">{product.price}</span>
              </div>
              <div>
                <span className="text-slate-500">Started:</span>
                <span className="ml-2 font-semibold text-slate-900">{formatDate(product.started_at)}</span>
              </div>
              {product.expires_at && (
                <div>
                  <span className="text-slate-500">Expires:</span>
                  <span className="ml-2 font-semibold text-slate-900">{formatDate(product.expires_at)}</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}


function Subscriptions({ onCancelSubscription }: { onCancelSubscription: () => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 text-lg mb-4">Manage Your Subscription</h3>
        <p className="text-slate-600 mb-6">
          Cancel your subscription at any time. It will remain active until the end of your current billing period.
        </p>
        <button
          onClick={onCancelSubscription}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <X size={18} />
          Cancel Subscription
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <h4 className="font-semibold text-slate-900 mb-2">Need to Make Changes?</h4>
        <p className="text-slate-600 text-sm mb-4">
          Contact our team if you need help with your subscription or have questions about billing.
        </p>
        <a
          href="mailto:info@monumentum.ai?subject=Subscription Support"
          className="text-blue-600 hover:text-blue-700 font-semibold"
        >
          Contact Billing Support →
        </a>
      </div>
    </div>
  );
}