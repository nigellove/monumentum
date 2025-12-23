import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getProspects,
  getProspectStats,
  bulkApproveProspects,
  OutboundProspect,
  ProspectStatus
} from '../../lib/outbound';
import ProspectCard from './ProspectCard';
import { CheckCircle, Filter, Mail, TrendingUp, Clock, Users } from 'lucide-react';

export default function ReviewQueue() {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<OutboundProspect[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ProspectStatus>('pending_review');
  const [productFilter, setProductFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [statusFilter, productFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      const filters: any = {
        review_status: statusFilter,
      };

      if (productFilter) {
        filters.matched_product = productFilter;
      }

      const [prospectsData, statsData] = await Promise.all([
        getProspects(filters),
        getProspectStats()
      ]);

      setProspects(prospectsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      alert('No prospects selected');
      return;
    }

    if (!confirm(`Approve ${selectedIds.length} prospects for sending?`)) {
      return;
    }

    try {
      await bulkApproveProspects(selectedIds);
      setSelectedIds([]);
      await loadData();
    } catch (error) {
      console.error('Error bulk approving:', error);
      alert('Failed to approve prospects');
    }
  };

  const handleProspectUpdate = async () => {
    await loadData();
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === prospects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(prospects.map(p => p.id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Review Queue</h1>
        <p className="text-slate-600">
          Review and approve AI-generated outreach messages before sending
        </p>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-blue-900">{stats.pending_review}</p>
              </div>
              <Clock className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-1">Sent</p>
                <p className="text-3xl font-bold text-purple-900">{stats.sent}</p>
              </div>
              <Mail className="w-12 h-12 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-600 mb-1">Reply Rate</p>
                <p className="text-3xl font-bold text-amber-900">{stats.reply_rate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-amber-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Bulk Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProspectStatus)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="sent">Sent</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
              <option value="replied">Replied</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Products</option>
              <option value="HarveyHR">HarveyHR</option>
              <option value="NeuroIQ">NeuroIQ</option>
              <option value="Monumentum">Monumentum</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <>
              <div className="flex-1" />
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-600">
                  {selectedIds.length} selected
                </span>
                <button
                  onClick={handleBulkApprove}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Selected
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Prospects List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading prospects...</p>
        </div>
      ) : prospects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No prospects found</h3>
          <p className="text-slate-500">
            Try adjusting your filters or check back later for new prospects
          </p>
        </div>
      ) : (
        <>
          {/* Select All */}
          {prospects.length > 0 && statusFilter === 'pending_review' && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === prospects.length}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">
                  Select All ({prospects.length})
                </span>
              </label>
            </div>
          )}

          {/* Prospect Cards */}
          <div className="space-y-6">
            {prospects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                onUpdate={handleProspectUpdate}
                selected={selectedIds.includes(prospect.id)}
                onToggleSelect={() => toggleSelection(prospect.id)}
                showCheckbox={statusFilter === 'pending_review'}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
