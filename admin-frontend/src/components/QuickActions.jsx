import React from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';

const QuickActions = () => {
    return (
        <div className="space-y-6">
            <div className="bg-[#FF6600] rounded-2xl p-6 text-white relative overflow-hidden group shadow-xl shadow-orange-500/30 transition-transform hover:scale-[1.02] duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                    <TrendingUp size={64} />
                </div>
                <h4 className="font-bold text-xl mb-2 tracking-tight">Performance Spike!</h4>
                <p className="text-orange-50 text-sm mb-4 leading-relaxed font-medium">The system detected a 24% increase in sales activity. Review logs for inventory sync.</p>
                <button className="w-full bg-white text-[#FF6600] py-2.5 rounded-xl font-bold text-sm shadow-xl hover:bg-orange-50 transition-colors">
                    Analyze Spike
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-slate-900 font-bold mb-4 tracking-tight">Quick Links</h3>
                <div className="space-y-2">
                    {['Add Member', 'Upload CSV', 'Global Settings', 'API Documentation'].map((link) => (
                        <button key={link} className="w-full text-left px-4 py-2.5 border border-slate-100 rounded-xl text-slate-500 hover:text-[#FF6600] hover:border-[#FF6600]/30 hover:bg-orange-50 transition-all text-sm font-bold group flex items-center justify-between">
                            {link}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickActions;
