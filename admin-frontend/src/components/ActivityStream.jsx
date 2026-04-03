import React from 'react';
import { TrendingUp } from 'lucide-react';

const ActivityStream = ({ activities }) => {
    return (
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF6600]">
                        <TrendingUp size={18} />
                    </div>
                    Live Activity Stream
                </h3>
                <button className="text-[#FF6600] text-sm font-bold hover:underline">View History</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            <th className="pb-4 border-b border-slate-50 px-4">Subject</th>
                            <th className="pb-4 border-b border-slate-50">Action</th>
                            <th className="pb-4 border-b border-slate-50">Timestamp</th>
                            <th className="pb-4 border-b border-slate-50">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {activities.map((act) => (
                            <tr key={act.id} className="group hover:bg-slate-50/80 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-[#FF6600] group-hover:text-white transition-all">
                                            {act.user[0]}
                                        </div>
                                        <span className="text-slate-900 font-bold text-sm tracking-tight">{act.user}</span>
                                    </div>
                                </td>
                                <td className="py-4 text-sm text-slate-500 font-medium group-hover:text-slate-700 transition-colors">{act.action}</td>
                                <td className="py-4 text-[10px] font-bold text-slate-400 tracking-wider uppercase">{act.time}</td>
                                <td className="py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight ${act.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                        act.status === 'Failed' ? 'bg-rose-50 text-rose-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {act.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ActivityStream;
