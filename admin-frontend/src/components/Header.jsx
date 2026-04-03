import React from 'react';
import { Search, Bell } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="relative group max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Search data, users, activities..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 transition-all placeholder:text-slate-400 text-sm"
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900">Admin Workspace</p>
                        <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Super Admin</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6600] to-orange-400 border border-orange-200 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform cursor-pointer">
                        AD
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
