import { useState } from 'react';
import {
  approveProspect,
  rejectProspect,
  deleteProspect,
  OutboundProspect
} from '../../lib/outbound';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  CheckCircle,
  XCircle,
  Edit2,
  Mail,
  Linkedin,
  Phone,
  Building2,
  User,
  MapPin,
  Trash2,
  ExternalLink,
  Target,
  TrendingUp,
  Send
} from 'lucide-react';

interface ProspectCardProps {
  prospect: OutboundProspect;
  onUpdate: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
  showCheckbox?: boolean;
}

export default function ProspectCard({
  prospect,
  onUpdate,
  selected = false,
  onToggleSelect,
  showCheckbox = false
}: ProspectCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(prospect.draft_subject || '');
  const [editedMessage, setEditedMessage] = useState(prospect.draft_message || '');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sending, setSending] = useState(false);

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await approveProspect(
        prospect.id,
        isEditing ? editedMessage : undefined,
        isEditing ? editedSubject : undefined
      );
      onUpdate();
    } catch (error) {
      console.error('Error approving prospect:', error);
      alert('Failed to approve prospect');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      await rejectProspect(prospect.id, rejectionReason);
      setShowRejectModal(false);
      onUpdate();
    } catch (error) {
      console.error('Error rejecting prospect:', error);
      alert('Failed to reject prospect');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Permanently delete this prospect? This cannot be undone.')) {
      return;
    }

    try {
      setProcessing(true);
      await deleteProspect(prospect.id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting prospect:', error);
      alert('Failed to delete prospect');
    } finally {
      setProcessing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!user?.id) {
      alert('You must be logged in to send emails');
      return;
    }

    // Show confirmation with content reminder
    const confirmMessage = `Send email to ${prospect.prospect_email}?\n\nPlease make sure you are comfortable with the email content before sending.\n\nSubject: ${editedSubject}\n\nClick OK to send.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setSending(true);

      // If edited, save edits first
      if (isEditing && (editedSubject !== prospect.draft_subject || editedMessage !== prospect.draft_message)) {
        await approveProspect(prospect.id, editedSubject, editedMessage);
      }

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-outbound-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prospect_id: prospect.id,
            campaign_id: prospect.campaign_id,
            user_id: user.id
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Email sent successfully!\n\nThe email has been sent to ${prospect.prospect_email}.`);
        onUpdate();
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.error || error.message}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const getChannelIcon = () => {
    switch (prospect.channel) {
      case 'email':
        return <Mail className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'phone':
        return <Phone className="w-5 h-5" />;
      default:
        return <Mail className="w-5 h-5" />;
    }
  };

  const getChannelColor = () => {
    switch (prospect.channel) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'linkedin':
        return 'bg-purple-100 text-purple-800';
      case 'phone':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusBadge = () => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending_review: { color: 'bg-slate-100 text-slate-800', label: 'Draft' },
      approved: { color: 'bg-slate-100 text-slate-800', label: 'Draft' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      sent: { color: 'bg-blue-100 text-blue-800', label: 'Sent' },
      opened: { color: 'bg-purple-100 text-purple-800', label: 'Opened' },
      clicked: { color: 'bg-indigo-100 text-indigo-800', label: 'Clicked' },
      replied: { color: 'bg-emerald-100 text-emerald-800', label: 'Replied' },
      bounced: { color: 'bg-orange-100 text-orange-800', label: 'Bounced' },
      unsubscribed: { color: 'bg-gray-100 text-gray-800', label: 'Unsubscribed' },
    };

    const config = statusConfig[prospect.review_status] || statusConfig.pending_review;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {showCheckbox && onToggleSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
            />
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {prospect.prospect_name || 'Unknown Prospect'}
                </h3>
                <p className="text-slate-600 text-sm">
                  {prospect.prospect_title && `${prospect.prospect_title} at `}
                  {prospect.company_name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getChannelColor()}`}>
                  {getChannelIcon()}
                  {prospect.channel?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Company & Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600 mb-4">
              {prospect.prospect_email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${prospect.prospect_email}`} className="hover:text-blue-600">
                    {prospect.prospect_email}
                  </a>
                </div>
              )}

              {prospect.prospect_linkedin_url && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-slate-400" />
                  <a
                    href={prospect.prospect_linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 flex items-center gap-1"
                  >
                    LinkedIn Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {prospect.company_website && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <a
                    href={prospect.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600"
                  >
                    {prospect.company_website}
                  </a>
                </div>
              )}

              {prospect.company_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {prospect.company_location}
                </div>
              )}

              {prospect.company_size && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  {prospect.company_size.toLocaleString()} employees
                </div>
              )}

              {prospect.company_industry && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {prospect.company_industry}
                </div>
              )}
            </div>

            {/* Match Score & Product */}
            {(prospect.matched_product || prospect.match_score) && (
              <div className="flex items-center gap-4 mb-4 text-sm">
                {prospect.matched_product && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-semibold">
                    <Target className="w-4 h-4" />
                    {prospect.matched_product}
                  </div>
                )}
                {prospect.match_score && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    {Math.round(prospect.match_score * 100)}% Match
                  </div>
                )}
              </div>
            )}

            {/* Personalization Notes */}
            {prospect.personalization_notes && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm font-semibold text-amber-800 mb-1">Personalization Notes:</p>
                <p className="text-sm text-amber-700">{prospect.personalization_notes}</p>
              </div>
            )}

            {/* Message Content */}
            <div className="border-t border-slate-200 pt-4">
              {isEditing ? (
                <div className="space-y-4">
                  {prospect.channel === 'email' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {prospect.draft_subject && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-slate-700 mb-1">Subject:</p>
                      <p className="text-slate-900 font-medium">{prospect.draft_subject}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Message:</p>
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {prospect.draft_message}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Rejection Reason (if rejected) */}
            {prospect.review_status === 'rejected' && prospect.rejection_reason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-700">{prospect.rejection_reason}</p>
              </div>
            )}

            {/* Actions */}
            {(prospect.review_status === 'pending_review' || prospect.review_status === 'approved') && (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-semibold flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditing ? 'Cancel Edit' : 'Edit Message'}
                </button>

                <button
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {sending ? 'Sending...' : 'Send Email'}
                </button>

                <div className="flex-1" />

                <button
                  onClick={handleDelete}
                  disabled={processing || sending}
                  className="px-4 py-2 bg-slate-100 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}

            {/* Tracking Info (if sent) */}
            {prospect.review_status !== 'pending_review' && prospect.review_status !== 'approved' && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {prospect.sent_at && (
                  <div>
                    <p className="text-slate-500 font-semibold">Sent:</p>
                    <p className="text-slate-700">{new Date(prospect.sent_at).toLocaleString()}</p>
                  </div>
                )}
                {prospect.opened_at && (
                  <div>
                    <p className="text-slate-500 font-semibold">Opened:</p>
                    <p className="text-slate-700">{new Date(prospect.opened_at).toLocaleString()}</p>
                  </div>
                )}
                {prospect.clicked_at && (
                  <div>
                    <p className="text-slate-500 font-semibold">Clicked:</p>
                    <p className="text-slate-700">{new Date(prospect.clicked_at).toLocaleString()}</p>
                  </div>
                )}
                {prospect.replied_at && (
                  <div>
                    <p className="text-slate-500 font-semibold">Replied:</p>
                    <p className="text-slate-700">{new Date(prospect.replied_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Reject Prospect</h2>
            <p className="text-slate-600 mb-4">
              Please provide a reason for rejecting this prospect. This will help improve future AI recommendations.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              placeholder="e.g., Not in target industry, wrong job title, message not relevant..."
            />

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50"
              >
                {processing ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
