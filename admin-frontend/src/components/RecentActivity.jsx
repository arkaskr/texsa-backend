import React from 'react';
import { Clock, UserPlus, ClipboardList, Package, ArrowUpRight, ShoppingBag, CheckCircle } from 'lucide-react';

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

const RecentActivity = ({ activities, onViewAll }) => {
    // Only show last 20 entries for the dashboard
    const displayActivities = activities.slice(0, 20);

    const getIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'user': return <UserPlus size={16} />;
            case 'service': return <ClipboardList size={16} />;
            case 'inventory': return <Package size={16} />;
            case 'sale': return <ShoppingBag size={16} />;
            case 'job': return <CheckCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getIconBg = (type) => {
        switch (type.toLowerCase()) {
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

    return (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[500px] hover:border-slate-300 transition-colors">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white z-10">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 font-outfit">Recent Activity</h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Live system logs</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Clock size={20} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-sm z-10 shadow-sm">
                        <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            <th className="py-3 px-6">Event Type</th>
                            <th className="py-3 px-6">Action / Subject</th>
                            <th className="py-3 px-6">Time</th>
                            <th className="py-3 px-6">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {displayActivities.map((act, i) => (
                            <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getIconBg(act.type)}`}>
                                            {getIcon(act.type)}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{act.type}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900 font-outfit">{act.subject}</span>
                                        <span className="text-[11px] text-slate-500">{act.action}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-[11px] text-slate-400 font-semibold uppercase">{formatTimeAgo(act.time)}</td>
                                <td className="py-4 px-6">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${getStatusColor(act.status)}`}>
                                        {act.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {displayActivities.length === 0 && (
                            <tr>
                                <td colSpan="4" className="py-12 text-center text-slate-400 text-sm font-medium italic">
                                    No recent activities recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                <button 
                    onClick={onViewAll}
                    className="w-full py-2.5 text-xs font-bold text-[#FF6600] uppercase tracking-widest hover:bg-white rounded-xl border border-transparent hover:border-orange-100 transition-all flex items-center justify-center gap-2"
                >
                    View All Activities
                    <ArrowUpRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default RecentActivity;
