import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle2, XCircle, Search, MessageSquare } from 'lucide-react';
import api from '../api/api';



const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leaves/all');
      setRequests(data);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
    
    try {
      await api.patch(`/leaves/${id}/status`, { status });
      fetchRequests(); // Refresh
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update request status.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || req.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Leave Requests</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Absence & Leave Management</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-slate-600 focus:outline-none focus:border-[#FF6600] transition-all"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending Only</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
            />
          </div>
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Displaying: {filteredRequests.length} requests
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                <th className="py-4 px-6 border-b border-slate-50">Employee</th>
                <th className="py-4 px-6 border-b border-slate-50">Leave Dates</th>
                <th className="py-4 px-6 border-b border-slate-50">Reason</th>
                <th className="py-4 px-6 border-b border-slate-50">Status</th>
                <th className="py-4 px-6 border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-semibold animate-pulse">
                    Filtering requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-semibold">
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="group hover:bg-slate-50/80 transition-colors border-l-2 border-transparent hover:border-l-[#FF6600]">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6600] font-bold uppercase">
                          {req.user?.name ? req.user.name.split(' ').map(n => n[0]).join('') : 'E'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 font-outfit uppercase tracking-wide">
                            {req.user?.name || 'Unknown'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">
                          {Math.ceil((new Date(req.endDate) - new Date(req.startDate)) / (1000 * 60 * 60 * 24)) + 1} Days
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-sm">
                      <div className="flex items-start gap-2">
                        <MessageSquare size={14} className="text-slate-300 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2">
                          {req.reason}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold tracking-tight ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusUpdate(req._id, 'APPROVED')}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Approve"
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req._id, 'REJECTED')}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                          Decision Taken
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequests;
