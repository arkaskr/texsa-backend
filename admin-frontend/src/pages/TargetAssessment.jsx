import React, { useState, useEffect } from 'react';
import { Target, Users, Calendar, ArrowUpRight, CheckCircle2, AlertCircle, Save, User as UserIcon, Coins, PenTool as Tool } from 'lucide-react';
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

const TargetAssessment = () => {
  const [employees, setEmployees] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    userId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    targetValue: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchTargets();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/auth/users');
      // Filter only employees
      const filtered = data.filter(u => u.role === 'SALES_EMPLOYEE' || u.role === 'SERVICE_EMPLOYEE');
      setEmployees(filtered);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/targets');
      setTargets(data);
    } catch (err) {
      setError('Error fetching targets');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) {
      setError('Please select an employee');
      return;
    }

    const selectedEmployee = employees.find(emp => emp._id === formData.userId);
    const type = selectedEmployee.role === 'SALES_EMPLOYEE' ? 'SALES' : 'SERVICE';

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post('/targets', {
        ...formData,
        type,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        targetValue: parseFloat(formData.targetValue),
      });
      setMessage('Target assigned successfully!');
      fetchTargets();
      setFormData({ ...formData, targetValue: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while assigning target');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear + 1];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Target Assessment</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Assign Monthly Performance Goals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6 flex items-center gap-2">
              <Target size={18} className="text-[#FF6600]" />
              Assign New Target
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  {message}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Select Employee</label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    name="userId"
                    value={formData.userId}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] text-sm appearance-none"
                    required
                  >
                    <option value="">Select an employee...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.role === 'SALES_EMPLOYEE' ? 'Sales' : 'Service'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Month</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#FF6600] text-sm"
                  >
                    {months.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-4 focus:outline-none focus:border-[#FF6600] text-sm"
                  >
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">
                  Target Value {formData.userId && (
                    <span className="text-[#FF6600] lowercase italic">
                      ({employees.find(e => e._id === formData.userId)?.role === 'SALES_EMPLOYEE' ? 'INR Amount' : 'Job Count'})
                    </span>
                  )}
                </label>
                <div className="relative group">
                  {formData.userId && employees.find(e => e._id === formData.userId)?.role === 'SALES_EMPLOYEE' ? (
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  ) : (
                    <Tool className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  )}
                  <input
                    type="number"
                    name="targetValue"
                    placeholder="Enter target value..."
                    value={formData.targetValue}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6600] text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 mt-4"
              >
                <Save size={18} />
                {loading ? 'Processing...' : 'Assign Target'}
              </button>
            </form>
          </div>
        </div>

        {/* Targets List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 bg-slate-50/30">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Calendar size={18} className="text-[#FF6600]" />
                Active Monthly Targets
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold bg-slate-50/50">
                    <th className="py-4 px-6 border-b border-slate-100">Employee</th>
                    <th className="py-4 px-6 border-b border-slate-100">Period</th>
                    <th className="py-4 px-6 border-b border-slate-100">Target Type</th>
                    <th className="py-4 px-6 border-b border-slate-100">Goal Progress</th>
                    <th className="py-4 px-6 border-b border-slate-100 text-right">Target Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {targets.map((target) => (
                    <tr key={target._id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6600] flex items-center justify-center font-bold text-xs">
                            {target.user?.name?.[0] || 'E'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 font-outfit uppercase">{target.user?.name}</p>
                            <p className="text-[10px] text-slate-400">{target.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-600">
                          {months[target.month - 1]} {target.year}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${
                          target.type === 'SALES' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          {target.type} TARGET
                        </span>
                      </td>
                      <td className="py-4 px-6 min-w-[200px]">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-400 capitalize">
                              {target.progress}% achieved
                            </span>
                            <span className="text-slate-900">
                              {target.achievedValue.toLocaleString()} / {target.targetValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                target.progress >= 100 ? 'bg-emerald-500' : 
                                target.progress >= 50 ? 'bg-[#FF6600]' : 'bg-amber-400'
                              }`}
                              style={{ width: `${Math.min(target.progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-black text-[#FF6600]">
                          {target.type === 'SALES' ? `₹${target.targetValue.toLocaleString()}` : `${target.targetValue} Jobs`}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {targets.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-slate-400 text-sm font-medium">
                        No targets assigned yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetAssessment;
