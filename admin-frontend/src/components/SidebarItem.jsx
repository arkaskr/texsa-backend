import React from 'react';
import { ChevronRight } from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-[#FF6600]/10 text-[#FF6600] ring-1 ring-[#FF6600]/20'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <Icon size={20} className={active ? 'text-[#FF6600]' : 'group-hover:scale-110 transition-transform'} />
        {!collapsed && <span className="font-semibold text-sm tracking-tight">{label}</span>}
        {active && !collapsed && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
);

export default SidebarItem;
