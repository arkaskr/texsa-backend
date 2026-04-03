import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, Package, AlertTriangle, 
  CheckCircle2, Clock, Calendar, ArrowUpRight, 
  ArrowDownRight, RefreshCw, Filter
} from 'lucide-react';
import axios from 'axios';

import api from '../api/api';

const Analysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await api.get('/analytics/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-xs">Analyzing Data...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#FF6600', '#2dd4bf', '#8b5cf6', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Business Intelligence</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold flex items-center gap-2">
            <TrendingUp size={14} className="text-orange-500" /> Real-time Performance Metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-orange-500 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
            <Filter size={16} />
            7 Days
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${data?.summary.totalRevenue.toLocaleString()}`} 
          subValue="+12.4% vs last month"
          icon={TrendingUp}
          color="orange"
          index={0}
        />
        <StatCard 
          title="Active Staff" 
          value={data?.summary.activeUsers} 
          subValue="Currently On-field"
          icon={Users}
          color="blue"
          index={1}
        />
        <StatCard 
          title="Inventory Value" 
          value={`₹${data?.summary.totalInventoryValue.toLocaleString()}`} 
          subValue={`${data?.summary.lowStockCount} items low stock`}
          icon={Package}
          color="purple"
          index={2}
        />
        <StatCard 
          title="Service Load" 
          value={data?.summary.openServiceRequests} 
          subValue="Tasks needing attention"
          icon={Clock}
          color="rose"
          index={3}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend - Spans 2 columns on large screens */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 font-outfit uppercase">Revenue Progression</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF6600]"></span>
              <span className="text-xs font-bold text-slate-500 uppercase">Daily Sales</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTrend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6600" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                  dy={10}
                  tickFormatter={(val) => val.split('-').slice(1).join('/')}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#FF6600', fontWeight: 700 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#FF6600" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Inventory Split */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-8 font-outfit uppercase">Stock Allocation</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 italic">
            <p className="text-[11px] text-orange-700 font-medium">
              Top category accounts for {Math.round((Math.max(...data?.categoryData.map(d => d.value)) / data?.categoryData.reduce((a, b) => a + b.value, 0)) * 100)}% of total stock units.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Second Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Leaderboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 font-outfit uppercase">Performance Leaders</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue Contributors</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.employeeSales} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#1e293b' }}
                />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#FF6600" 
                  radius={[0, 8, 8, 0]} 
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Operations Health */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-8 font-outfit uppercase">Operations Health</h3>
          <div className="space-y-6 flex-1">
            <HealthItem 
               label="Leave Requests" 
               status={`${data?.summary.pendingLeaves} Pending`}
               percentage={(1 - (data?.summary.pendingLeaves / 10)) * 100} // Mock calc
               color="orange"
            />
            <HealthItem 
               label="Service Backlog" 
               status={`${data?.summary.openServiceRequests} Open`}
               percentage={75}
               color="rose"
            />
            <HealthItem 
               label="Inventory Alert" 
               status={`${data?.summary.lowStockCount} Low Stock`}
               percentage={90}
               color="emerald"
            />
          </div>
          <button className="mt-8 w-full py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#FF6600] hover:text-white transition-all">
            Download Full Report
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subValue, icon: Icon, color, index }) => {
  const colorMap = {
    orange: 'from-orange-500 to-orange-600 shadow-orange-500/20',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/20',
    rose: 'from-rose-500 to-rose-600 shadow-rose-500/20',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorMap[color]} text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        <ArrowUpRight className="text-slate-300 group-hover:text-orange-500 transition-colors" size={20} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h2 className="text-2xl font-bold text-slate-900 font-outfit">{value}</h2>
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1">
          {subValue}
        </p>
      </div>
    </motion.div>
  );
};

const HealthItem = ({ label, status, percentage, color }) => {
    const colorClasses = {
        orange: 'bg-orange-500',
        rose: 'bg-rose-500',
        emerald: 'bg-emerald-500'
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-slate-900 font-outfit uppercase">{label}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full ${colorClasses[color]}`}
                ></motion.div>
            </div>
        </div>
    );
};

export default Analysis;
