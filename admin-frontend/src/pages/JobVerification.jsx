import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobVerification = () => {
  const [requests, setRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchUnderReviewRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/service-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for 'Under Review' and history
      setRequests(response.data.filter(req => req.status === 'Under Review'));
      setHistoryRequests(response.data.filter(req => req.status === 'Completed' || req.status === 'Failed'));
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnderReviewRequests();
  }, []);

  const handleVerify = async (id, status) => {
    const action = status === 'Completed' ? 'Approve' : 'Reject';
    if (!window.confirm(`Are you sure you want to ${action} this job?`)) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      await axios.put(`${apiUrl}/api/service-requests/${id}/verify`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list
      fetchUnderReviewRequests();
    } catch (err) {
      alert('Verification failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium animate-pulse">Loading verification queue...</div>;
  if (error) return <div className="p-8 text-red-500 font-medium">Error: {error}</div>;

  const displayRequests = activeTab === 'Pending' ? requests : historyRequests;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Verification</h1>
          <p className="text-slate-500 mt-1 font-medium">Review and approve completed service tasks</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl">
             <button 
               onClick={() => setActiveTab('Pending')} 
               className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'Pending' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}>
               Pending
             </button>
             <button 
               onClick={() => setActiveTab('History')} 
               className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'History' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}>
               Job History
             </button>
          </div>
          
          {activeTab === 'Pending' && requests.length > 0 && (
            <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl border border-orange-100 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
              <span className="font-bold text-sm">{requests.length} Jobs Waiting</span>
            </div>
          )}
        </div>
      </div>

      {displayRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-3xl">{activeTab === 'Pending' ? '🎉' : '⏱️'}</div>
          <h3 className="text-xl font-bold text-slate-900">{activeTab === 'Pending' ? 'All caught up!' : 'No History Found'}</h3>
          <p className="text-slate-500 max-w-xs mx-auto">{activeTab === 'Pending' ? 'No jobs are currently pending verification. Good job!' : 'You have no previously verified jobs.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {displayRequests.map((req) => (
            <div key={req._id} className="group bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-xl font-bold">
                    {req.productName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{req.productName}</h3>
                    <p className="text-slate-500 text-sm font-medium">ID: {req._id.substring(req._id.length - 6).toUpperCase()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                  req.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  req.status === 'Failed' ? 'bg-red-50 text-red-600 border-red-100' : 
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="space-y-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Technician</p>
                    <p className="font-bold text-slate-700">{req.assignedEmployee?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</p>
                    <p className="font-bold text-slate-700">{req.customerName || 'N/A'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Notes</p>
                  <p className="text-slate-600 text-sm italic font-medium">"{req.completionDescription || 'No notes provided'}"</p>
                </div>
                {(req.receiptImage || (req.productImages && req.productImages.length > 0) || req.failureImage) && (
                  <div className="pt-4 border-t border-slate-200/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attached Images</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {req.failureImage && (
                        <div 
                          className="flex-shrink-0 relative group cursor-zoom-in"
                          onClick={() => setSelectedImage(req.failureImage)}
                        >
                          <img src={req.failureImage} alt="Failure" className="h-20 w-20 object-cover rounded-xl border border-slate-200" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold text-center px-1">Failure</span>
                          </div>
                        </div>
                      )}
                      {req.receiptImage && (
                        <div 
                          className="flex-shrink-0 relative group cursor-zoom-in"
                          onClick={() => setSelectedImage(req.receiptImage)}
                        >
                          <img src={req.receiptImage} alt="Receipt" className="h-20 w-20 object-cover rounded-xl border border-slate-200" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold text-center px-1">Receipt</span>
                          </div>
                        </div>
                      )}
                      {req.productImages?.map((img, i) => (
                        <div 
                          key={i} 
                          className="flex-shrink-0 relative group cursor-zoom-in"
                          onClick={() => setSelectedImage(img)}
                        >
                          <img src={img} alt={`Product ${i+1}`} className="h-20 w-20 object-cover rounded-xl border border-slate-200" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold text-center px-1">Product {i+1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {activeTab === 'Pending' ? (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleVerify(req._id, 'Completed')}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                  >
                    Approve Job
                  </button>
                  <button 
                    onClick={() => handleVerify(req._id, 'Failed')}
                    className="flex-1 bg-white border-2 border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-3 rounded-2xl transition-all active:scale-95"
                  >
                    Reject & Fail
                  </button>
                </div>
              ) : (
                <div className={`flex items-center justify-center py-3 rounded-2xl border ${
                  req.status === 'Completed' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                }`}>
                  <span className={`font-bold ${req.status === 'Completed' ? 'text-emerald-700' : 'text-red-700'}`}>
                    Verified as {req.status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Expansion Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-md cursor-zoom-out transition-all duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Expanded view" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
            onClick={(e) => e.stopPropagation()} // Let zooming stay open if they click the image itself
          />
          <button 
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20 shadow-lg"
            onClick={() => setSelectedImage(null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default JobVerification;
