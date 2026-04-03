import React from 'react';
import { IndianRupee, ArrowUpRight } from 'lucide-react';

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

const SalesActivity = ({ sales, onViewAll }) => {
  // Only show last 20 entries for the dashboard
  const displaySales = sales.slice(0, 20);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[500px] hover:border-slate-300 transition-colors">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-outfit">Sales Activity</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Recent Transactions</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
          <IndianRupee size={20} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-slate-50">
          {displaySales.map((sale, i) => (
            <div key={i} className="p-4 hover:bg-slate-50 transition-all group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-slate-900 font-outfit truncate">{sale.product}</span>
                <span className="text-sm font-bold text-[#FF6600] whitespace-nowrap ml-2">{sale.amount}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {(sale.customer && sale.customer[0]) || 'C'}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Customer: {sale.customer}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6600]">
                    By: {sale.employee}
                 </span>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{formatTimeAgo(sale.time)}</span>
              </div>
            </div>
          ))}
          {displaySales.length === 0 && (
            <div className="py-12 p-4 text-center text-slate-400 text-sm font-medium italic">
                No recent sales recorded.
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <button 
          onClick={onViewAll}
          className="w-full py-2.5 text-xs font-bold text-[#FF6600] uppercase tracking-widest hover:bg-white rounded-xl border border-transparent hover:border-orange-100 transition-all flex items-center justify-center gap-2"
        >
          View All Sales
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default SalesActivity;
