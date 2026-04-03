import React, { useState } from 'react';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = '/auth/login';
    const payload = { email, password };

    try {
      const { data } = await api.post(endpoint, payload);

      if (data.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Please check your credentials or backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-[#FF6600]/10 rounded-2xl flex items-center justify-center text-[#FF6600] mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-outfit uppercase tracking-tight">
            Admin Portal
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
            Authorized Access Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}



          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                placeholder="admin@texsa.com"
              />
            </div>
          </div>



          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-12 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF6600] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF6600] text-white py-4 rounded-xl font-bold text-sm hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'Sign In to Dashboard'
            )}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
