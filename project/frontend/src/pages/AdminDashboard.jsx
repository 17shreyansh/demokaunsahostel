import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { message } from 'antd'; // Retained strictly for imperative logic (toast side-effects)
import { 
  Home, MessageSquare, Eye, Activity, 
  TrendingUp, CheckCircle, Clock, Star, RefreshCw, Loader2
} from 'lucide-react';
import { hostelAPI, enquiryAPI, leadAPI } from '../services/api';
import { stateManager, invalidateData } from '../utils/stateManager';
import MapStatsWidget from '../components/MapStatsWidget';

/* -------------------------------------------------------------------------- */
/* MEMOIZED MICRO-COMPONENTS                                                  */
/* -------------------------------------------------------------------------- */

const MiniBarChart = memo(({ data, color = '#3b82f6' }) => {
  const maxValue = Math.max(...data.map(d => d.value || 0), 1);
  
  return (
    <div className="flex items-end justify-between h-28 mt-4 pt-4 gap-1.5 w-full">
      {data.map((item, index) => {
        const height = Math.max(((item.value || 0) / maxValue) * 100, 4);
        return (
          <div key={index} className="flex flex-col items-center flex-1 group relative w-full">
            {/* Vercel-style Tooltip on hover */}
            <div className="absolute -top-10 bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 whitespace-nowrap shadow-lg shadow-black/10 transform translate-y-1 group-hover:translate-y-0">
              {item.value} {item.label}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
            
            <div 
              className="w-full max-w-[16px] rounded-t-sm transition-all duration-300 group-hover:opacity-80 group-hover:brightness-110"
              style={{ 
                height: `${height}%`, 
                backgroundColor: item.value > 0 ? color : '#f1f5f9'
              }}
            />
            <span className="text-[10px] font-medium text-gray-400 mt-2 uppercase tracking-wider hidden sm:block">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
});
MiniBarChart.displayName = 'MiniBarChart';

/* -------------------------------------------------------------------------- */
/* MAIN DASHBOARD COMPONENT                                                   */
/* -------------------------------------------------------------------------- */

const AdminDashboard = () => {
  const [hostels, setHostels] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Network Fetching (Logic retained completely)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [hostelsRes, enquiriesRes, leadsRes] = await Promise.all([
        hostelAPI.getAll().catch(() => ({ data: { hostels: [] } })),
        enquiryAPI.getAll().catch(() => ({ data: [] })),
        leadAPI.getAll().catch(() => ({ data: [] }))
      ]);
      
      setHostels(hostelsRes.data?.hostels || hostelsRes.data || []);
      setEnquiries(enquiriesRes.data || []);
      setLeads(leadsRes.data || []);
    } catch (error) {
      message.error('Failed to sync dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    return stateManager.subscribe('dashboard', fetchData);
  }, [fetchData]);

  // Heavy Math Memoization (Zero layout thrashing on re-renders)
  const { stats, charts, topViewed, featuredList } = useMemo(() => {
    const now = new Date();
    
    // Growth Math
    const thisMonth = enquiries.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = enquiries.filter(e => {
      const d = new Date(e.createdAt);
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    const allInteractions = [...enquiries, ...(Array.isArray(leads) ? leads : [])];

    // Chart Generation Helpers
    const getLast7Days = (dataset, multiplier = 1) => Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const count = dataset.filter(item => new Date(item.createdAt).toDateString() === d.toDateString()).length;
      return { label: d.toLocaleDateString('en', { weekday: 'short' }), value: count * multiplier };
    });

    const getLast6Months = (dataset) => Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const count = dataset.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === d.getMonth() && itemDate.getFullYear() === d.getFullYear();
      }).length;
      return { label: d.toLocaleDateString('en', { month: 'short' }), value: count };
    });

    return {
      stats: {
        totalProperties: hostels.length,
        totalEnquiries: enquiries.length,
        totalViews: hostels.reduce((sum, h) => sum + (h.views || 0), 0),
        pendingRequests: enquiries.filter(e => e.status === 'Pending').length,
        responseRate: enquiries.length > 0 
          ? Math.round((enquiries.filter(e => e.status !== 'Pending').length / enquiries.length) * 100) 
          : 0,
        monthlyGrowth: lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : 0
      },
      charts: {
        traffic: getLast7Days(allInteractions, 2),
        bookings: getLast7Days(enquiries),
        growth: getLast6Months(enquiries)
      },
      topViewed: [...hostels].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
      featuredList: hostels.filter(h => h.featured === true)
    };
  }, [hostels, enquiries, leads]);

  // Actions (Logic retained completely)
  const toggleFeaturedHostel = useCallback(async (hostelId, currentStatus) => {
    const newStatus = !currentStatus;
    
    if (newStatus && featuredList.length >= 6) {
      message.warning('Maximum 6 featured properties allowed.');
      return;
    }

    // Optimistic UI Update
    setHostels(prev => prev.map(h => h._id === hostelId ? { ...h, featured: newStatus } : h));

    try {
      const response = await hostelAPI.updateFeatured(hostelId, newStatus);
      if (response.data.success) {
        message.success(newStatus ? 'Property featured' : 'Property removed from featured');
        invalidateData('homepage');
      } else {
        throw new Error();
      }
    } catch (error) {
      setHostels(prev => prev.map(h => h._id === hostelId ? { ...h, featured: currentStatus } : h));
      message.error('Failed to update featured status');
    }
  }, [featuredList.length]);

  const handleRefresh = useCallback(() => {
    invalidateData();
    fetchData();
  }, [fetchData]);

  // Helpers for UI
  const getProgressColor = (rate) => {
    if (rate >= 80) return 'bg-emerald-500';
    if (rate >= 50) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Available': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      'Limited': 'bg-amber-50 text-amber-700 ring-amber-600/20',
      'Pending': 'bg-amber-50 text-amber-700 ring-amber-600/20',
      'Contacted': 'bg-blue-50 text-blue-700 ring-blue-600/20',
      'success': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      'error': 'bg-rose-50 text-rose-700 ring-rose-600/20',
    };
    const defaultStyle = 'bg-gray-50 text-gray-700 ring-gray-600/20';
    return `inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${styles[status] || defaultStyle}`;
  };

  return (
    <div className="relative pb-8 min-h-[80vh] font-sans text-gray-900">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium text-gray-600">Syncing Data...</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Monitor your properties, lead generation, and system analytics.</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm gap-2"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Sync Data
        </button>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {/* Stat 1 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
            <Home className="w-4 h-4 text-blue-500 mr-2" />
            Total Properties
          </div>
          <div className="text-3xl font-semibold tracking-tight text-gray-900">
            {stats.totalProperties}
          </div>
          <div className="mt-3 text-xs font-medium text-emerald-600 bg-emerald-50 inline-flex px-2 py-1 rounded-md">
            Active listings
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
            <MessageSquare className="w-4 h-4 text-indigo-500 mr-2" />
            Total Enquiries
          </div>
          <div className="text-3xl font-semibold tracking-tight text-gray-900">
            {stats.totalEnquiries}
          </div>
          <div className={`mt-3 text-xs font-medium inline-flex items-center px-2 py-1 rounded-md gap-1 ${stats.monthlyGrowth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
            {stats.monthlyGrowth >= 0 ? <TrendingUp size={14} /> : <Activity size={14} />}
            {Math.abs(stats.monthlyGrowth)}% vs last month
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
            <Eye className="w-4 h-4 text-purple-500 mr-2" />
            Property Views
          </div>
          <div className="text-3xl font-semibold tracking-tight text-gray-900">
            {stats.totalViews.toLocaleString()}
          </div>
          <div className="mt-3 text-xs font-medium text-gray-500 bg-gray-50 inline-flex px-2 py-1 rounded-md">
            Across all listings
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
            Response Rate
          </div>
          <div className="flex items-end gap-1 text-3xl font-semibold tracking-tight text-gray-900">
            {stats.responseRate}<span className="text-lg font-medium text-gray-500 mb-1">%</span>
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor(stats.responseRate)}`}
              style={{ width: `${stats.responseRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* MINI CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Traffic (7 Days)</h3>
          <MiniBarChart data={charts.traffic} color="#8b5cf6" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Enquiries (7 Days)</h3>
          <MiniBarChart data={charts.bookings} color="#3b82f6" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Growth (6 Months)</h3>
          <MiniBarChart data={charts.growth} color="#10b981" />
        </div>
      </div>

      {/* MIDDLE SECTION: MAP & LISTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Geographic Distribution</h3>
          </div>
          <div className="flex-1 p-2 bg-gray-50/30">
            <MapStatsWidget />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Top Viewed Properties</h3>
          </div>
          <div className="p-4 flex-1">
            <ul className="space-y-4">
              {topViewed.map((item, index) => {
                const maxViews = Math.max(...topViewed.map(h => h.views || 0), 1);
                const percent = Math.round(((item.views || 0) / maxViews) * 100);
                
                return (
                  <li key={item._id || index} className="flex items-center gap-4 group">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${index < 3 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 bg-gray-100 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{item.views} views</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: DATA TABLES/LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Recent Properties List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Recent Properties</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
              {hostels.length} Total
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {hostels.slice(0, 5).map(item => (
              <li key={item._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex flex-col min-w-0 flex-1 mr-4">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{item.location}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">₹{item.price}/mo</p>
                    <div className="mt-1">
                      <span className={getStatusBadge(item.availability)}>{item.availability}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeaturedHostel(item._id, item.featured)}
                    className={`inline-flex items-center justify-center p-2 rounded-lg text-sm font-medium transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      item.featured 
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 focus:ring-rose-500' 
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-300'
                    }`}
                    title={item.featured ? 'Unfeature Property' : 'Feature Property'}
                    aria-label={item.featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star size={16} className={item.featured ? 'fill-rose-600' : ''} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pending Enquiries List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Pending Enquiries</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
              {stats.pendingRequests} New
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {enquiries.slice(0, 5).map(item => (
              <li key={item._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition-colors">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Clock size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString()} • {item.phone}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className={getStatusBadge(item.status)}>{item.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;