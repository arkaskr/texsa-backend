import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
    Clock, 
    UserPlus, 
    ClipboardList, 
    Package, 
    ShoppingBag, 
    CheckCircle,
    Search,
    Filter,
    Calendar
} from 'lucide-react';



const formatTimeAgo = (dateString) => {
    if (!dateString) return 'JUST NOW';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} SECS AGO`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} MINS AGO`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} HOURS AGO`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} DAYS AGO`;
};

const AllRecentActivities = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [statusFilter, setStatusFilter] = useState('All Status');

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const { data } = await api.get('/dashboard/activities');
            setActivities(data);
        } catch (err) {
            console.error('Error fetching activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'user': return <UserPlus size={16} />;
            case 'service': return <ClipboardList size={16} />;
            case 'inventory': return <Package size={16} />;
            case 'sale': return <ShoppingBag size={16} />;
            case 'job': return <CheckCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getIconBg = (type) => {
        switch (type?.toLowerCase()) {
            case 'user': return 'bg-blue-50 text-blue-500';
            case 'service': return 'bg-purple-50 text-purple-500';
            case 'inventory': return 'bg-orange-50 text-[#FF6600]';
            case 'sale': return 'bg-emerald-50 text-emerald-500';
            case 'job': return 'bg-indigo-50 text-indigo-500';
            default: return 'bg-slate-50 text-slate-500';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-50 text-emerald-600';
            case 'Verified': return 'bg-emerald-50 text-emerald-600';
            case 'Active': return 'bg-emerald-50 text-emerald-600';
            case 'Approved': return 'bg-emerald-50 text-emerald-600';
            case 'Accepted': return 'bg-emerald-50 text-emerald-600';
            case 'Pending': return 'bg-amber-50 text-amber-600';
            case 'Under Review': return 'bg-amber-50 text-amber-600';
            case 'In Progress': return 'bg-[#FF6600]/10 text-[#FF6600]';
            case 'Rejected': return 'bg-rose-50 text-rose-600';
            case 'Employee Rejected': return 'bg-rose-50 text-rose-600';
            case 'Failed': return 'bg-rose-50 text-rose-600';
            case 'Inactive': return 'bg-slate-50 text-slate-600';
            default: return 'bg-slate-50 text-slate-500';
        }
    };

    const filteredActivities = activities.filter(act => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = act.subject?.toLowerCase().includes(searchLower) || 
                             act.action?.toLowerCase().includes(searchLower);
        const matchesType = typeFilter === 'All Types' || act.type?.toLowerCase() === typeFilter.toLowerCase();
        const matchesStatus = statusFilter === 'All Status' || act.status === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
    });

    const activityTypes = ['All Types', 'User', 'Service', 'Inventory', 'Sale', 'Job'];
    const statuses = ['All Status', 'Pending', 'Verified', 'Completed', 'Rejected', 'Approved'];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">All Recent Activities</h1>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Complete System Audit Logs</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/30">
                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by subject or action..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                            <Filter size={16} className="text-slate-400" />
                            <select 
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="text-sm font-bold text-slate-600 focus:outline-none bg-transparent"
                            >
                                {activityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                            <Calendar size={16} className="text-slate-400" />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm font-bold text-slate-600 focus:outline-none bg-transparent"
                            >
                                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                                <th className="py-4 px-6 border-b border-slate-50">Event Type</th>
                                <th className="py-4 px-6 border-b border-slate-50">Action Details</th>
                                <th className="py-4 px-6 border-b border-slate-50">Time</th>
                                <th className="py-4 px-6 border-b border-slate-50">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="py-6 px-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : (
                                filteredActivities.map((act, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getIconBg(act.type)} shadow-sm group-hover:scale-110 transition-transform`}>
                                                    {getIcon(act.type)}
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{act.type}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wide group-hover:text-[#FF6600] transition-colors">{act.subject}</span>
                                                <span className="text-[11px] text-slate-500 font-medium">{act.action}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                            {formatTimeAgo(act.time)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight shadow-sm ${getStatusColor(act.status)}`}>
                                                {act.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && filteredActivities.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-400 text-sm font-medium italic">
                                        No matching activities found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Showing {filteredActivities.length} logs</span>
                </div>
            </div>
        </div>
    );
};

export default AllRecentActivities;
