import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden group hover:border-[#FF6600]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 blur-3xl ${color}`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-500 text-sm font-semibold tracking-tight mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">{value}</h3>
        {subtitle && (
          <p className="text-[12px] text-[#FF6600]/80 font-medium tracking-widest uppercase mt-1 transition-all group-hover:text-[#FF6600] font-inter">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl bg-slate-50 text-[#FF6600] group-hover:bg-[#FF6600] group-hover:text-white transition-all duration-300`}>
        <Icon size={24} className="opacity-90 group-hover:scale-110 transition-transform" />
      </div>
    </div>
  </div>
);

export default StatCard;
