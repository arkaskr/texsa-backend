import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit2, Trash2, Shield, X, Mail, Phone, Lock, MapPin, Package } from 'lucide-react';
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

const UserManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Admin'); // Default role
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    monthlyTarget: 0,
  });

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Error fetching users. Make sure backend is running.');
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

    const roleMap = {
      'Admin': 'ADMIN',
      'Customer': 'CUSTOMER',
      'Service Employee': 'SERVICE_EMPLOYEE',
      'Sales Employee': 'SALES_EMPLOYEE'
    };

    const backendRole = roleMap[selectedRole];
    let endpoint = '/auth/signup';
    
    if (backendRole === 'ADMIN') {
      endpoint = '/auth/create-admin';
    } else if (backendRole === 'SERVICE_EMPLOYEE' || backendRole === 'SALES_EMPLOYEE') {
      endpoint = '/auth/create-employee';
    }

    try {
      if (editingUser) {
        await api.put(`/auth/users/${editingUser._id}`, {
          ...formData,
          role: backendRole
        });
        setMessage(`Successfully updated ${selectedRole}: ${formData.name}`);
      } else {
        const { data } = await api.post(endpoint, {
          ...formData,
          role: backendRole
        });
        setMessage(`Successfully created ${selectedRole}: ${data.name}`);
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', phone: '', password: '', address: '' });
      fetchUsers(); // Refresh list after creation/update
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Error occurred during creation');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/auth/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '', // Don't show password
      address: user.address || '',
      monthlyTarget: user.monthlyTarget || 0,
    });
    const revRoleMap = {
      'ADMIN': 'Admin',
      'CUSTOMER': 'Customer',
      'SERVICE_EMPLOYEE': 'Service Employee',
      'SALES_EMPLOYEE': 'Sales Employee'
    };
    setSelectedRole(revRoleMap[user.role] || 'Customer');
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = user.name?.toLowerCase().includes(searchLower) || 
                         user.email?.toLowerCase().includes(searchLower);
    const matchesRole = selectedRoleFilter === 'All Roles' || 
                       (selectedRoleFilter === 'Admin' && user.role === 'ADMIN') ||
                       (selectedRoleFilter === 'Employee' && (user.role === 'SERVICE_EMPLOYEE' || user.role === 'SALES_EMPLOYEE')) ||
                       (selectedRoleFilter === 'Customer' && user.role === 'CUSTOMER');
    return matchesSearch && matchesRole;
  });

  const roles = ['Admin', 'Customer', 'Service Employee', 'Sales Employee'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">User Management</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Admin Controls & Permissions</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#FF6600] text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 flex items-center gap-2 group"
        >
          <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
          Add New User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm text-slate-600 focus:outline-none focus:border-[#FF6600] font-bold"
            >
              <option>All Roles</option>
              <option>Admin</option>
              <option>Employee</option>
              <option>Customer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                <th className="py-4 px-6 border-b border-slate-50">User Information</th>
                <th className="py-4 px-6 border-b border-slate-50">Account Role</th>
                <th className="py-4 px-6 border-b border-slate-50">Date Joined</th>
                <th className="py-4 px-6 border-b border-slate-50">Status</th>
                <th className="py-4 px-6 border-b border-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#FF6600] font-bold shadow-sm group-hover:bg-[#FF6600] group-hover:text-white transition-all uppercase">
                        {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-[#FF6600] transition-colors font-outfit uppercase tracking-wide">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      <Shield size={14} className="text-[#FF6600]/70" />
                      {user.role}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    {user.joins}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
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

        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
          <span>Showing {users.length} users</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:text-slate-900 transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:text-slate-900 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-outfit uppercase">
                  {editingUser ? 'Update Account' : 'Add New Account'}
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-0.5">
                  {editingUser ? 'Modification Center' : 'Registration Gateway'}
                </p>
              </div>
              <button
                onClick={() => {
                   setIsModalOpen(false);
                   setEditingUser(null);
                   setFormData({ name: '', email: '', phone: '', password: '', address: '' });
                }}
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
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Select Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${selectedRole === role
                          ? 'bg-[#FF6600] border-[#FF6600] text-white shadow-lg shadow-orange-600/20'
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                        }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Full Name</label>
                  <div className="relative group">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
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
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Security Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                    <input
                      type="password"
                      name="password"
                      required={!editingUser}
                      placeholder={editingUser ? "Leave blank to keep current" : "••••••••"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                    />
                  </div>
                </div>

                {(selectedRole === 'Service Employee' || selectedRole === 'Sales Employee') && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Monthly Job Target</label>
                    <div className="relative group">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                      <input
                        type="number"
                        name="monthlyTarget"
                        value={formData.monthlyTarget}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
                      />
                    </div>
                  </div>
                )}

                {selectedRole !== 'Admin' && (
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-1">Delivery/Residential Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-4 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={16} />
                      <textarea
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#FF6600] text-white py-4 rounded-2xl font-bold text-sm hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98]"
                >
                  Confirm & {editingUser ? 'Update' : 'Create'} Account
                </button>
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 opacity-50">
                  Secured Admin Portal Entry
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
