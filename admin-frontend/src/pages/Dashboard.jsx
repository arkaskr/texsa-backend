import React from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import RecentActivity from '../components/RecentActivity';
import SalesActivity from '../components/SalesActivity';
import {
    ShoppingBag,
    IndianRupee,
    UserCheck,
    Package,
    AlertCircle
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

const Dashboard = () => {
    const [statsData, setStatsData] = React.useState(null);
    const [recentActivities, setRecentActivities] = React.useState([]);
    const [recentSales, setRecentSales] = React.useState([]);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStatsData(data);
            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
            }
        };
        const fetchActivities = async () => {
            try {
                const { data } = await api.get('/dashboard/activities');
                setRecentActivities(data);
            } catch (err) {
                console.error('Error fetching dashboard activities:', err);
            }
        };
        const fetchSales = async () => {
            try {
                const { data } = await api.get('/dashboard/sales');
                setRecentSales(data);
            } catch (err) {
                console.error('Error fetching dashboard sales:', err);
            }
        };
        fetchStats();
        fetchActivities();
        fetchSales();
    }, []);

    const stats = statsData ? [
        { title: 'Total Revenue', value: `₹${statsData.revenue?.monthly?.toLocaleString() || 0}`, icon: ShoppingBag, color: 'bg-orange-500' },
        { title: 'Inventory Value', value: `₹${statsData.inventory.totalValue.toLocaleString()}`, icon: IndianRupee, color: 'bg-emerald-500' },
        { title: 'Total Users', value: statsData.users.total.toString(), subtitle: `A:${statsData.users.admins} C:${statsData.users.customers} E1:${statsData.users.serviceEmployees} E2:${statsData.users.salesEmployees}`, icon: UserCheck, color: 'bg-amber-500' },
        { title: 'Pending Tasks', value: '0', icon: AlertCircle, color: 'bg-rose-500' },
    ] : [
        { title: 'Total Revenue', value: '...', icon: ShoppingBag, color: 'bg-orange-500' },
        { title: 'Inventory Value', value: '...', icon: IndianRupee, color: 'bg-emerald-500' },
        { title: 'Total Users', value: '...', subtitle: 'Loading...', icon: UserCheck, color: 'bg-amber-500' },
        { title: 'Pending Tasks', value: '...', icon: AlertCircle, color: 'bg-rose-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit">System Overview</h1>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Real-time control panel</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <StatCard key={i} {...s} />
                ))}
            </div>

            {/* Activities Grid */}
            <div className="grid lg:grid-cols-10 gap-8 h-auto pb-10">
                {/* Recent Activity - 70% */}
                <div className="lg:col-span-7 h-full">
                    <RecentActivity 
                        activities={recentActivities} 
                        onViewAll={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'All Activities' }))}
                    />
                </div>

                {/* Sales Activity - 30% */}
                <div className="lg:col-span-3 h-full">
                    <SalesActivity 
                        sales={recentSales} 
                        onViewAll={() => window.dispatchEvent(new CustomEvent('changeTab', { detail: 'All Sales' }))}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
