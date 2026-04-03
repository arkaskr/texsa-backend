import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    CheckCircle2,
    Clock,
    User,
    MapPin,
    ChevronRight,
    AlertCircle,
    X,
    UserPlus,
    Check,
    Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api/api';

const ServiceRequests = () => {
    const [requests, setRequests] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [requestsRes, usersRes] = await Promise.all([
                api.get('/service-requests'),
                api.get('/auth/users')
            ]);
            
            setRequests(requestsRes.data);
            // Filter only service employees
            setEmployees(usersRes.data.filter(u => u.role === 'SERVICE_EMPLOYEE'));
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedEmployeeId) return toast.error('Please select an employee');

        try {
            await api.put(`/service-requests/${selectedRequest._id}/assign`, {
                employeeId: selectedEmployeeId
            });
            
            toast.success('Employee assigned successfully');
            setShowAssignModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Assignment failed');
        }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        
        try {
            await api.put(`/service-requests/${requestId}/assign`, {
                status: 'Rejected'
            });
            
            toast.success('Request rejected');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Rejection failed');
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Service Requests</h1>
                    <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Workflow & Fulfillment</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold bg-slate-50/50">
                                <th className="py-4 px-6">Booking ID</th>
                                <th className="py-4 px-6">Customer</th>
                                <th className="py-4 px-6">Product</th>
                                <th className="py-4 px-6">Assigned To</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {requests.map((req) => (
                                <tr key={req._id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="py-5 px-6">
                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                                            #{req._id.substring(req._id.length - 6).toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{req.user?.name || req.customerName}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                                    <MapPin size={10} />
                                                    {req.address}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{req.productName}</p>
                                            <p className="text-[10px] text-slate-400 uppercase">{req.modelName}</p>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        {req.status === 'Employee Rejected' ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                                    <X size={12} />
                                                </div>
                                                <span className="text-xs font-semibold text-rose-600">Rejected by {req.assignedEmployee?.name || 'Technician'}</span>
                                            </div>
                                        ) : req.assignedEmployee ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <Check size={12} />
                                                </div>
                                                <span className="text-xs font-medium text-slate-600">{req.assignedEmployee.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Not Assigned</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight ${
                                            req.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                                            req.status === 'Employee Rejected' ? 'bg-orange-100 text-orange-800' :
                                            req.status === 'Approved' ? 'bg-blue-50 text-blue-600' :
                                            req.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                                            'bg-slate-50 text-slate-600'
                                        }`}>
                                            {req.status === 'Employee Rejected' ? 'ACTION NEEDED' : req.status}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                        {!req.assignedEmployee && req.status === 'Pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleReject(req._id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                >
                                                    REJECT
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRequest(req);
                                                        setSelectedEmployeeId('');
                                                        setShowAssignModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-[10px] font-bold rounded-lg hover:bg-orange-700 transition-colors"
                                                >
                                                    <UserPlus size={12} />
                                                    ASSIGN
                                                </button>
                                            </div>
                                        )}
                                        {req.status === 'Employee Rejected' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleReject(req._id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                >
                                                    REJECT
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedRequest(req);
                                                        setSelectedEmployeeId('');
                                                        setShowAssignModal(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-[10px] font-bold rounded-lg hover:bg-orange-700 transition-colors"
                                                >
                                                    <UserPlus size={12} />
                                                    REASSIGN
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Assign Technician</h3>
                                <p className="text-xs text-slate-500">Service Request #{selectedRequest?._id.substring(selectedRequest._id.length - 6).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAssign} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Service Employee</label>
                                <select 
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                >
                                    <option value="">Select Technician...</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.phone})</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                type="submit"
                                className="w-full h-11 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} />
                                CONFIRM ASSIGNMENT
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceRequests;
