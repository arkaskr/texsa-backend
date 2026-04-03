import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, User, Calendar, IndianRupee, Tag, AlertCircle, Filter, Search, MoreVertical, ArrowUpRight, Truck, AlertTriangle } from 'lucide-react';
import api from '../api/api';

const InventoryRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/inventory-requests');
            setRequests(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;
        try {
            await api.put(`/inventory-requests/${id}`, { status });
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'All') return true;
        if (['Low', 'Medium', 'High'].includes(filter)) return req.priority === filter;
        return req.status === filter;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Inventory Requests</h1>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Field Orders & Fulfillment</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
                        <Filter size={16} className="text-slate-400" />
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="text-xs font-bold text-slate-600 focus:outline-none cursor-pointer uppercase tracking-wider bg-transparent"
                        >
                            <option value="All">All Requests</option>
                            <option value="Pending">Pending Approval</option>
                            <option value="Approved">Approved / In-Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Failed">Failed</option>
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                        </select>
                    </div>
                    <button onClick={fetchRequests} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#FF6600] transition-all">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Summary Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-[#FF6600]/20 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF6600] group-hover:scale-110 transition-transform">
                        <Clock size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Approval</p>
                        <h3 className="text-2xl font-bold text-slate-900 font-outfit">{requests.filter(r => r.status === 'Pending').length} Requests</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-blue-500/20 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <CheckCircle size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approved</p>
                        <h3 className="text-2xl font-bold text-slate-900 font-outfit">{requests.filter(r => r.status === 'Approved').length} Units</h3>
                    </div>
                </div>
                <div className="bg-[#FF6600] p-6 rounded-3xl shadow-xl shadow-orange-600/20 flex items-center gap-4 transform hover:-translate-y-1 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Priority</p>
                        <h3 className="text-2xl font-bold text-white font-outfit">Active Queue</h3>
                    </div>
                </div>
            </div>

            {/* Main Request Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Product/Requester..."
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold border-b border-slate-50">
                                <th className="py-4 px-6">Requester</th>
                                <th className="py-4 px-6">Product & Qty</th>
                                <th className="py-4 px-6">Required By</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredRequests.map((req) => (
                                <tr key={req._id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold shadow-sm group-hover:bg-[#FF6600] group-hover:text-white transition-all">
                                                {(req.requesterName || 'R')[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-tight">
                                                    {req.requesterName || 'Unknown'}
                                                </p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium font-outfit uppercase">
                                                    <User size={10} />
                                                    Account: <span className="text-slate-600 font-bold">{req.employeeName || req.user?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF6600]">
                                                <Package size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700">{req.productName}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-[#FF6600]">{req.quantity} Units</p>
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter shadow-sm ${
                                                        req.priority === 'High' ? 'bg-rose-500 text-white animate-pulse' :
                                                        req.priority === 'Medium' ? 'bg-amber-500 text-white' :
                                                        'bg-slate-400 text-white'
                                                    }`}>
                                                        {req.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                                {new Date(req.requiredDate).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex flex-col gap-1">
                                            <span className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${
                                                req.status === 'Approved' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                req.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                                req.status === 'Failed' ? 'bg-rose-50 text-rose-600' :
                                                'bg-orange-50 text-orange-600'
                                            }`}>
                                                {req.status === 'Approved' ? 'Approved (Pending Fulfillment)' : req.status}
                                            </span>
                                            {req.status === 'Approved' && req.priority === 'High' && (
                                                <span className="text-[9px] text-rose-500 font-bold uppercase tracking-widest animate-pulse ml-1">
                                                    CRITICAL FULFILLMENT
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {req.status === 'Pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(req._id, 'Approved')}
                                                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-md"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(req._id, 'Failed')}
                                                        className="px-3 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:text-rose-600 hover:border-rose-100 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {req.status === 'Approved' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(req._id, 'Completed')}
                                                        className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/10"
                                                    >
                                                        Completed
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(req._id, 'Failed')}
                                                        className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/10"
                                                    >
                                                        Failed
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-10 text-center text-slate-400 text-sm font-medium">
                                        No inventory requests found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryRequests;
