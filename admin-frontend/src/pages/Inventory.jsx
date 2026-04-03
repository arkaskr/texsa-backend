import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, Edit2, Trash2, Tag, Box, ArrowDownLeft, X, IndianRupee, Hash, ListOrdered, ShoppingCart, User, Calendar, MapPin, Phone } from 'lucide-react';
import api from '../api/api';



const Inventory = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [addMode, setAddMode] = useState('single'); // 'single' or 'bulk'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: 'Hardware',
        price: '',
        quantity: '1'
    });

    const [categories, setCategories] = useState([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [isSoldModalOpen, setIsSoldModalOpen] = useState(false);
    const [selectedProductForSale, setSelectedProductForSale] = useState(null);
    const [salesEmployees, setSalesEmployees] = useState([]);
    const [saleToType, setSaleToType] = useState('CUSTOM'); // 'CUSTOM' or 'EMPLOYEE'
    const [saleFormData, setSaleFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        employeeId: '',
        employeeName: '',
        employeePhone: '',
        soldDate: new Date().toISOString().split('T')[0],
        price: '',
        selectedId: '',
        selectedIds: []
    });

    const [inventory, setInventory] = useState([]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            if (data.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: data[0].name }));
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchSalesEmployees = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setSalesEmployees(data.filter(u => u.role === 'SALES_EMPLOYEE'));
        } catch (err) {
            console.error('Error fetching sales employees:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchSalesEmployees();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name: newCategoryName });
            setNewCategoryName('');
            setIsCategoryModalOpen(false);
            fetchCategories();
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding category');
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/inventory');
            setInventory(data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError('Error fetching inventory. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const endpoint = addMode === 'bulk' ? '/inventory/bulk' : '/inventory';

        try {
            await api.post(endpoint, formData);
            setMessage(`Successfully added stock in ${addMode} mode`);
            setIsModalOpen(false);
            setFormData({ name: '', sku: '', category: 'Hardware', price: '', quantity: '1' });
            fetchProducts();
        } catch (err) {
            console.error('Error adding stock:', err);
            setError(err.response?.data?.message || 'Error occurred during stock addition');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/inventory/${id}`);
            fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Error deleting product');
        }
    };

    const handleMarkAsSold = async (e) => {
        e.preventDefault();
        
        const idsToSold = saleFormData.selectedIds.length > 0 ? saleFormData.selectedIds : [saleFormData.selectedId];
        
        if (idsToSold.length === 0 || !idsToSold[0]) {
            alert('Please select at least one SKU to sell.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...saleFormData,
                ids: idsToSold,
                soldToType: saleToType,
                date: saleFormData.soldDate,
            };

            // Use bulk endpoint if multiple, or just use bulk for everything now it's more flexible
            await api.post('/inventory/sold-bulk', payload);
            
            setIsSoldModalOpen(false);
            setSaleFormData({
                customerName: '', customerPhone: '', customerAddress: '',
                employeeId: '', employeeName: '', employeePhone: '',
                soldDate: new Date().toISOString().split('T')[0],
                price: '',
                selectedId: '',
                selectedIds: []
            });
            fetchProducts();
            alert(`Successfully sold ${idsToSold.length} product(s)!`);
        } catch (err) {
            console.error('Error marking as sold:', err);
            setError(err.response?.data?.message || 'Error occurred while marking as sold');
        } finally {
            setLoading(false);
        }
    };

    const groupedInventory = inventory.reduce((acc, item) => {
        const key = `${item.name}-${item.category}-${item.price}`;
        if (!acc[key]) {
            acc[key] = { 
                ...item, 
                totalStock: item.stock, 
                skuList: [item.sku],
                ids: [item._id]
            };
        } else {
            acc[key].totalStock += item.stock;
            acc[key].skuList.push(item.sku);
            acc[key].ids.push(item._id);
        }
        return acc;
    }, {});

    const inventoryList = Object.values(groupedInventory);

    const filteredInventory = inventoryList.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.skuList.some(sku => sku.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getSkuDisplay = (skuList) => {
        if (skuList.length === 1) return `${skuList[0]}`;
        const sorted = [...skuList].sort();
        return `${sorted[0]} - ${sorted[sorted.length - 1]} (${skuList.length} items)`;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Inventory</h1>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Stock Control & Logistics</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="bg-slate-100 text-slate-600 py-2.5 px-4 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Add Category
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2.5 bg-[#FF6600] text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        Add Product
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-[#FF6600] transition-all shadow-sm">
                            <Filter size={18} />
                        </button>
                        <select 
                            className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm text-slate-600 focus:outline-none focus:border-[#FF6600] font-bold shadow-sm"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option>All Categories</option>
                            {categories.map(cat => (
                                <option key={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                                <th className="py-4 px-6 border-b border-slate-50">Product Details</th>
                                <th className="py-4 px-6 border-b border-slate-50">Category</th>
                                <th className="py-4 px-6 border-b border-slate-50">Stock Level</th>
                                <th className="py-4 px-6 border-b border-slate-50">Unit Price</th>
                                <th className="py-4 px-6 border-b border-slate-50 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredInventory.map((item) => (
                                <tr key={item._id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3 group/item">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover/item:bg-orange-50 group-hover/item:text-[#FF6600] transition-all">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 group-hover/item:text-[#FF6600] transition-colors font-outfit uppercase tracking-wide">{item.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter italic opacity-70">
                                                    {getSkuDisplay(item.skuList)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <Tag size={12} className="text-orange-500/50" />
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="space-y-1.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                                item.totalStock >= 15 ? 'bg-emerald-50 text-emerald-600' :
                                                item.totalStock >= 5 ? 'bg-blue-50 text-blue-600' :
                                                item.totalStock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
                                                }`}>
                                                {item.totalStock} Units • {
                                                    item.totalStock >= 15 ? 'High Stock' : 
                                                    item.totalStock >= 5 ? 'Medium Stock' : 
                                                    item.totalStock > 0 ? 'Low Stock' : 'Out of Stock'
                                                }
                                            </span>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <div className={`h-full transition-all duration-1000 ${
                                                    item.totalStock >= 15 ? 'bg-emerald-500 w-full' :
                                                    item.totalStock >= 10 ? 'bg-blue-500 w-3/4' :
                                                    item.totalStock >= 5 ? 'bg-sky-400 w-1/2' :
                                                    item.totalStock > 0 ? 'bg-orange-500 w-1/4' : 'bg-rose-500 w-[5%]'
                                                    }`}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm font-bold text-slate-900">
                                        ₹{item.price.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button 
                                                onClick={() => {
                                                    setSelectedProductForSale(item);
                                                    setSaleFormData(prev => ({ 
                                                        ...prev, 
                                                        price: item.price,
                                                        selectedId: item.ids.length === 1 ? item.ids[0] : '',
                                                        selectedIds: item.ids.length === 1 ? [item.ids[0]] : []
                                                    }));
                                                    setIsSoldModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                                                title="Mark as Sold"
                                            >
                                                <ShoppingCart size={16} />
                                            </button>
                                            {/* Removed Edit Button */}
                                            <button 
                                                onClick={() => {
                                                    if (item.ids.length > 1) {
                                                        if (window.confirm(`This will delete ALL ${item.ids.length} items in this group. Continue?`)) {
                                                            Promise.all(item.ids.map(id => api.delete(`/inventory/${id}`))).then(fetchProducts);
                                                        }
                                                    } else {
                                                        handleDelete(item._id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mark as Sold Modal */}
            {isSoldModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 font-outfit uppercase tracking-tight">Mark as Sold</h2>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-0.5">{selectedProductForSale?.name} • SKU: {selectedProductForSale?.sku}</p>
                            </div>
                            <button
                                onClick={() => setIsSoldModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleMarkAsSold} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold">
                                    {error}
                                </div>
                            )}

                            {/* Multi SKU Selection for Bulk Items */}
                            {selectedProductForSale?.ids.length > 1 && (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between pl-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Select SKUs to Sell</label>
                                        <span className="text-[10px] bg-[#FF6600]/10 text-[#FF6600] px-2 py-0.5 rounded-full font-bold">
                                            {saleFormData.selectedIds.length} Selected
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                                        {selectedProductForSale.skuList.map((sku, index) => {
                                            const itemId = selectedProductForSale.ids[index];
                                            const isChecked = saleFormData.selectedIds.includes(itemId);
                                            return (
                                                <label 
                                                    key={itemId} 
                                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                                        isChecked ? 'bg-white border-[#FF6600] shadow-sm' : 'bg-transparent border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <input 
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            const newSelection = isChecked 
                                                                ? saleFormData.selectedIds.filter(id => id !== itemId)
                                                                : [...saleFormData.selectedIds, itemId];
                                                            setSaleFormData({
                                                                ...saleFormData, 
                                                                selectedIds: newSelection,
                                                                // If multiple selected, we update price accordingly maybe? 
                                                                // User will likely want to enter a TOTAL price for the selection.
                                                                price: (newSelection.length * (selectedProductForSale.price)).toString()
                                                            });
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                        isChecked ? 'bg-[#FF6600] border-[#FF6600]' : 'bg-white border-slate-300'
                                                    }`}>
                                                        {isChecked && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={`text-xs font-bold ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {sku}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[9px] text-orange-500 font-bold uppercase mt-1 px-1 italic">Select one or more SKUs from this group.</p>
                                </div>
                            )}
                            
                            {/* Sold To Option */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Sold To</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSaleToType('CUSTOM')}
                                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${saleToType === 'CUSTOM'
                                                ? 'bg-[#FF6600] border-[#FF6600] text-white shadow-lg shadow-orange-600/20'
                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                            }`}
                                    >
                                        <ArrowDownLeft size={16} />
                                        Custom Customer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSaleToType('EMPLOYEE')}
                                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${saleToType === 'EMPLOYEE'
                                                ? 'bg-[#FF6600] border-[#FF6600] text-white shadow-lg shadow-orange-600/20'
                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                            }`}
                                    >
                                        <User size={16} />
                                        Sales Employee
                                    </button>
                                </div>
                            </div>

                            {/* Customer Fields (Only if CUSTOM) */}
                            {saleToType === 'CUSTOM' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Customer Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600]" size={16} />
                                            <input
                                                type="text"
                                                required
                                                value={saleFormData.customerName}
                                                onChange={(e) => setSaleFormData({...saleFormData, customerName: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Phone Number</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600]" size={16} />
                                            <input
                                                type="text"
                                                value={saleFormData.customerPhone}
                                                onChange={(e) => setSaleFormData({...saleFormData, customerPhone: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Address</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600]" size={16} />
                                            <input
                                                type="text"
                                                value={saleFormData.customerAddress}
                                                onChange={(e) => setSaleFormData({...saleFormData, customerAddress: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Choose Sales Employee</label>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600]" size={16} />
                                        <select
                                            required
                                            value={saleFormData.employeeId}
                                            onChange={(e) => {
                                                const emp = salesEmployees.find(u => u._id === e.target.value);
                                                setSaleFormData({
                                                    ...saleFormData, 
                                                    employeeId: e.target.value,
                                                    employeeName: emp?.name || '',
                                                    employeePhone: emp?.phone || '',
                                                    customerName: emp?.name || '',
                                                    customerAddress: emp?.address || ''
                                                });
                                            }}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] text-sm appearance-none font-bold"
                                        >
                                            <option value="">Select Employee</option>
                                            {salesEmployees.map(emp => (
                                                <option key={emp._id} value={emp._id}>{emp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {saleFormData.employeeId && (
                                        <div className="mt-4 p-4 bg-orange-50/50 border border-orange-100 rounded-xl space-y-2 animate-in slide-in-from-top-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Employee Details</span>
                                                <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold rounded-full uppercase">Verified</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Full Name</p>
                                                    <p className="text-xs font-bold text-slate-700">{saleFormData.employeeName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Phone Number</p>
                                                    <p className="text-xs font-bold text-slate-700">{saleFormData.employeePhone || 'Not Available'}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-[9px] text-slate-400 uppercase font-bold">Stored Address</p>
                                                    <p className="text-xs font-bold text-slate-700 italic">{saleFormData.customerAddress || 'No address on file'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Common Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Sold Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600]" size={16} />
                                        <input
                                            type="date"
                                            required
                                            value={saleFormData.soldDate}
                                            onChange={(e) => setSaleFormData({...saleFormData, soldDate: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Final Sale Amount (₹)</label>
                                    <div className="relative group">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600]" size={16} />
                                        <input
                                            type="number"
                                            required
                                            value={saleFormData.price}
                                            onChange={(e) => setSaleFormData({...saleFormData, price: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#FF6600] text-white py-4 rounded-2xl font-bold text-sm hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={18} />
                                {loading ? 'Processing...' : 'Complete Sale'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 font-outfit uppercase tracking-tight">Add New Stock</h2>
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-0.5">Inventory Intake System</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                    {message}
                                </div>
                            )}
                            {/* Mode Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Intake Mode</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAddMode('single')}
                                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${addMode === 'single'
                                                ? 'bg-[#FF6600] border-[#FF6600] text-white shadow-lg shadow-orange-600/20'
                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                            }`}
                                    >
                                        <Box size={16} />
                                        Single Product
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddMode('bulk')}
                                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${addMode === 'bulk'
                                                ? 'bg-[#FF6600] border-[#FF6600] text-white shadow-lg shadow-orange-600/20'
                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                                            }`}
                                    >
                                        <ListOrdered size={16} />
                                        Bulk Addition
                                    </button>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Product Name</label>
                                    <div className="relative group">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Product Number (SKU)</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                                        <input
                                            type="text"
                                            name="sku"
                                            required
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 px-1">Example: TX001</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Category</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all appearance-none font-bold"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Unit Price (₹)</label>
                                    <div className="relative group">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                                        />
                                    </div>
                                </div>

                                {addMode === 'bulk' && (
                                    <div className="space-y-1.5 animate-in slide-in-from-left-4 duration-300">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Total Items (Quantity)</label>
                                        <div className="relative group">
                                            <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                                            <input
                                                type="number"
                                                name="quantity"
                                                min="1"
                                                required
                                                value={formData.quantity}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 space-y-4">
                                <button
                                    type="submit"
                                    className="w-full bg-[#FF6600] text-white py-4 rounded-2xl font-bold text-sm hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    {addMode === 'bulk' ? `Create ${formData.quantity || 0} Sequential Records` : 'Add to Inventory'}
                                </button>
                                {addMode === 'bulk' && formData.sku && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 italic">Sequential Preview</p>
                                        <p className="text-xs text-slate-600 font-bold tracking-tight">
                                            {formData.sku} → {formData.sku.replace(/\d+$/, (n) => (parseInt(n) + (parseInt(formData.quantity) - 1)).toString().padStart(n.length, '0'))}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add Category Modal */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900 font-outfit uppercase tracking-tight">New Category</h2>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleAddCategory} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Appliances"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#FF6600] text-sm font-bold"
                                />
                            </div>
                            <button type="submit" className="w-full bg-[#FF6600] text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-500 transition-all">
                                Create Category
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
