import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    IndianRupee, 
    Search, 
    Filter, 
    TrendingUp, 
    User,
    Calendar,
    ArrowUpRight
} from 'lucide-react';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

const AllSalesActivity = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState('All Personnel');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const { data } = await api.get('/dashboard/sales');
            setSales(data);
        } catch (err) {
            console.error('Error fetching sales:', err);
        } finally {
            setLoading(false);
        }
    };

    const employees = ['All Personnel', ...new Set(sales.map(s => s.employee))];

    const filteredSales = sales.filter(sale => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = sale.product?.toLowerCase().includes(searchLower) || 
                             sale.customer?.toLowerCase().includes(searchLower) ||
                             sale.employee?.toLowerCase().includes(searchLower);
        const matchesEmployee = employeeFilter === 'All Personnel' || sale.employee === employeeFilter;
        
        return matchesSearch && matchesEmployee;
    });

    const totalAmount = filteredSales.reduce((acc, s) => acc + (parseFloat(s.amount.toString().replace('₹', '').replace(',', '')) || 0), 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Detailed Sales Log</h1>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Transaction Audit & Performance</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-3 flex items-center gap-4 group hover:bg-emerald-100 transition-colors">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Calculated Revenue</p>
                        <p className="text-lg font-black text-emerald-900 font-outfit tracking-tight">₹{totalAmount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/30">
                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search product, customer, or employee..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 w-full lg:w-auto">
                            <User size={16} className="text-slate-400" />
                            <select 
                                value={employeeFilter}
                                onChange={(e) => setEmployeeFilter(e.target.value)}
                                className="text-sm font-bold text-slate-600 focus:outline-none bg-transparent w-full"
                            >
                                {employees.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                                <th className="py-4 px-6 border-b border-slate-50">Transaction Details</th>
                                <th className="py-4 px-6 border-b border-slate-50">Customer Info</th>
                                <th className="py-4 px-6 border-b border-slate-50">Sales Personnel</th>
                                <th className="py-4 px-6 border-b border-slate-50">Time</th>
                                <th className="py-4 px-6 border-b border-slate-50 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="py-6 px-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : (
                                filteredSales.map((sale, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6600] flex items-center justify-center font-bold shadow-sm group-hover:bg-[#FF6600] group-hover:text-white transition-all active:scale-110">
                                                    <IndianRupee size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wide group-hover:text-[#FF6600] transition-colors">{sale.product}</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                                                    {sale.customer?.[0] || 'C'}
                                                </div>
                                                <span className="text-xs font-semibold text-slate-700">{sale.customer}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-[10px] font-bold text-[#FF6600] uppercase">
                                                    {sale.employee?.[0] || 'E'}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{sale.employee}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                            {formatTimeAgo(sale.time)}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="text-sm font-black text-[#FF6600] font-outfit">
                                                {sale.amount}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && filteredSales.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-medium italic">
                                        No sales records found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Audit complete • {filteredSales.length} records retrieved</span>
                    <button className="flex items-center gap-1.5 text-[#FF6600] hover:text-orange-600 transition-colors group">
                        Export Report <ArrowUpRight size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AllSalesActivity;
