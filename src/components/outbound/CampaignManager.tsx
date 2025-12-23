import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  OutboundCampaign
} from '../../lib/outbound';
import { Plus, Edit2, Trash2, Play, Pause, CheckCircle, Sparkles } from 'lucide-react';

export default function CampaignManager() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<OutboundCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<OutboundCampaign | null>(null);
  const [generatingProspects, setGeneratingProspects] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, campaignName: string) => {
    if (!confirm(`Delete campaign "${campaignName}"? This cannot be undone.`)) {
      return;
    }

    try {
      await deleteCampaign(id);
      await loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  const handleStatusToggle = async (campaign: OutboundCampaign) => {
    try {
      const newStatus = campaign.status === 'active' ? 'paused' : 'active';
      await updateCampaign(campaign.id, { status: newStatus });
      await loadCampaigns();
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert('Failed to update campaign status');
    }
  };

  const handleGenerateProspects = async (campaign: OutboundCampaign, limit: number = 25) => {
    if (!user?.id || !campaign.target_icp) {
      alert('Campaign must have ICP targeting configured');
      return;
    }

    setGeneratingProspects(campaign.id);

    try {
      const webhookUrl = import.meta.env.VITE_N8N_GENERATE_PROSPECTS_URL;
      if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
      }

      // Get customer_id from profile
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('customer_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.customer_id) {
        throw new Error('No customer profile found');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id: campaign.id,
          user_id: user.id,
          customer_id: profile.customer_id,
          target_icp: campaign.target_icp,
          prospect_limit: limit
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate prospects');
      }

      const result = await response.json();
      alert(`Success! Generated ${result.prospects_generated} prospects. Check the Review Queue to approve them.`);
    } catch (error) {
      console.error('Error generating prospects:', error);
      alert('Failed to generate prospects. Please try again.');
    } finally {
      setGeneratingProspects(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit2 },
      active: { color: 'bg-green-100 text-green-800', icon: Play },
      paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    };

    const { color, icon: Icon } = config[status] || config.draft;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Campaign Management</h1>
          <p className="text-slate-600">Create and manage your outbound sales campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Plus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No campaigns yet</h3>
          <p className="text-slate-500 mb-6">
            Create your first campaign to start generating personalized outreach messages
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
            >
              {/* Campaign Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {campaign.campaign_name}
                  </h3>
                  {getStatusBadge(campaign.status)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCampaign(campaign)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit campaign"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id, campaign.campaign_name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete campaign"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Campaign Details */}
              <div className="space-y-3 text-sm text-slate-600">
                {campaign.target_product && (
                  <div>
                    <span className="font-semibold">Target Product:</span>{' '}
                    {campaign.target_product}
                  </div>
                )}

                {campaign.target_icp && Object.keys(campaign.target_icp).length > 0 && (
                  <div>
                    <span className="font-semibold">Target ICP:</span>
                    <ul className="ml-4 mt-1 space-y-1">
                      {campaign.target_icp.industries && (
                        <li>Industries: {campaign.target_icp.industries.join(', ')}</li>
                      )}
                      {campaign.target_icp.company_size && (
                        <li>
                          Company Size: {campaign.target_icp.company_size[0]} - {campaign.target_icp.company_size[1]} employees
                        </li>
                      )}
                      {campaign.target_icp.job_titles && (
                        <li>Job Titles: {campaign.target_icp.job_titles.join(', ')}</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-slate-400 mt-4">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col gap-2">
                <div className="flex gap-2">
                  {[5, 10, 25, 50].map((limit) => (
                    <button
                      key={limit}
                      onClick={() => handleGenerateProspects(campaign, limit)}
                      disabled={generatingProspects === campaign.id}
                      className="flex-1 py-2 px-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold transition hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {generatingProspects === campaign.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          {limit}
                        </>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Generate prospects matching your ICP
                </p>
                <button
                  onClick={() => handleStatusToggle(campaign)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                    campaign.status === 'active'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {campaign.status === 'active' ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCampaign) && (
        <CampaignModal
          campaign={editingCampaign}
          onClose={() => {
            setShowCreateModal(false);
            setEditingCampaign(null);
          }}
          onSave={async () => {
            await loadCampaigns();
            setShowCreateModal(false);
            setEditingCampaign(null);
          }}
        />
      )}
    </div>
  );
}

// Campaign Creation/Edit Modal Component
interface CampaignModalProps {
  campaign: OutboundCampaign | null;
  onClose: () => void;
  onSave: () => void;
}

function CampaignModal({ campaign, onClose, onSave }: CampaignModalProps) {
  const [formData, setFormData] = useState({
    campaign_name: campaign?.campaign_name || '',
    target_product: campaign?.target_product || '',
    industries: campaign?.target_icp?.industries?.join(', ') || '',
    company_size_min: campaign?.target_icp?.company_size?.[0] || 50,
    company_size_max: campaign?.target_icp?.company_size?.[1] || 10000,
    job_titles: campaign?.target_icp?.job_titles?.join(', ') || '',
    status: campaign?.status || 'draft',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const campaignData = {
        campaign_name: formData.campaign_name,
        target_product: formData.target_product || null,
        target_icp: {
          industries: formData.industries.split(',').map(s => s.trim()).filter(Boolean),
          company_size: [formData.company_size_min, formData.company_size_max],
          job_titles: formData.job_titles.split(',').map(s => s.trim()).filter(Boolean),
        },
        status: formData.status as 'draft' | 'active' | 'paused' | 'completed',
      };

      if (campaign) {
        await updateCampaign(campaign.id, campaignData);
      } else {
        await createCampaign(campaignData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {campaign ? 'Edit Campaign' : 'Create New Campaign'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.campaign_name}
              onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Q1 2025 Enterprise Outreach"
              required
            />
          </div>

          {/* Target Product */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Target Product (Optional)
            </label>
            <input
              type="text"
              value={formData.target_product}
              onChange={(e) => setFormData({ ...formData, target_product: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Product Name"
            />
          </div>

          {/* Target ICP */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-slate-900">Target ICP (Ideal Customer Profile)</h3>

            {/* Industries */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Industries (comma-separated)
              </label>
              <input
                type="text"
                value={formData.industries}
                onChange={(e) => setFormData({ ...formData, industries: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="technology, finance, healthcare"
              />
            </div>

            {/* Company Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Min Company Size
                </label>
                <input
                  type="number"
                  value={formData.company_size_min}
                  onChange={(e) => setFormData({ ...formData, company_size_min: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Max Company Size
                </label>
                <input
                  type="number"
                  value={formData.company_size_max}
                  onChange={(e) => setFormData({ ...formData, company_size_max: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>

            {/* Job Titles */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Job Titles (comma-separated)
              </label>
              <input
                type="text"
                value={formData.job_titles}
                onChange={(e) => setFormData({ ...formData, job_titles: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="VP of HR, Chief People Officer, HR Director"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : campaign ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
