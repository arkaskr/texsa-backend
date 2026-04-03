import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Tag, User, Calendar, IndianRupee, Hash, Package, ExternalLink } from 'lucide-react';
import axios from 'axios';

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

const SoldProducts = () => {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [soldProducts, setSoldProducts] = useState([]);

    const fetchSoldProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/inventory/sold');
            setSoldProducts(data);
        } catch (err) {
            console.error('Error fetching sold products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSoldProducts();
    }, []);

    const filteredSales = soldProducts.filter(sale => 
        sale.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.productSku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Sold Products</h1>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Sales History & Revenue Tracking</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search sales..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                                <th className="py-4 px-6 border-b border-slate-50">Product</th>
                                <th className="py-4 px-6 border-b border-slate-50">Sold To</th>
                                <th className="py-4 px-6 border-b border-slate-50">Sold By</th>
                                <th className="py-4 px-6 border-b border-slate-50">Sold Date</th>
                                <th className="py-4 px-6 border-b border-slate-50">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-medium">Loading sales history...</td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-slate-400 text-sm font-medium">No sold products found.</td>
                                </tr>
                            ) : filteredSales.map((sale) => (
                                <tr key={sale._id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                <ShoppingBag size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 font-outfit uppercase tracking-wide">{sale.productName}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter italic">
                                                    SKU: {sale.productSku || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-slate-700">{sale.customerName}</p>
                                            {sale.customerPhone && (
                                                <p className="text-[10px] text-slate-400">{sale.customerPhone}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <User size={12} className="text-orange-500/50" />
                                            {sale.soldToType === 'EMPLOYEE' ? `EE: ${sale.employeeName}` : 'Admin'}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <Calendar size={12} className="text-slate-400" />
                                            {sale.date}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-emerald-600">
                                        ₹{sale.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SoldProducts;
