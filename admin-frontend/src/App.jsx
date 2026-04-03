import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import ServiceRequests from './pages/ServiceRequests';
import JobVerification from './pages/JobVerification';
import TargetAssessment from './pages/TargetAssessment';
import InventoryRequests from './pages/InventoryRequests';
import Login from './pages/Login';
import SoldProducts from './pages/SoldProducts';
import Attendance from './pages/Attendance';
import LeaveRequests from './pages/LeaveRequests';
import Analysis from './pages/Analysis';
import AllRecentActivities from './pages/AllRecentActivities';
import AllSalesActivity from './pages/AllSalesActivity';
import EmployeeReports from './pages/EmployeeReports';

const App = () => {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('adminActiveTab') || 'Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('adminUser')));

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    // 1. Session Sync Check: Ensure both user profile and token exist synchronously
    const token = localStorage.getItem('adminToken');
    if (user && !token) {
      handleLogout(); // Force logout if token is missing but user state is present
    }
  }, [user]);

  useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail);
    };
    window.addEventListener('changeTab', handleTabChange);
    return () => window.removeEventListener('changeTab', handleTabChange);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setActiveTab('Dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminActiveTab');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-inter selection:bg-orange-500/30">
      {/* Sidebar Component - Sticky with full height */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Component */}
        <Header />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {activeTab === 'Dashboard' && <Dashboard />}
            {activeTab === 'Users' && <Users />}
            {activeTab === 'Service Requests' && <ServiceRequests />}
            {activeTab === 'Job Verification' && <JobVerification />}
            {activeTab === 'Target Assessment' && <TargetAssessment />}
            {activeTab === 'Inventory' && <Inventory />}
            {activeTab === 'Sold Products' && <SoldProducts />}
            {activeTab === 'Inventory Requests' && <InventoryRequests />}
            {activeTab === 'Attendance' && <Attendance />}
            {activeTab === 'Leave Requests' && <LeaveRequests />}
            {activeTab === 'Analytics' && <Analysis />}
            {activeTab === 'All Activities' && <AllRecentActivities />}
            {activeTab === 'All Sales' && <AllSalesActivity />}
            {activeTab === 'Employee Reports' && <EmployeeReports />}

            {(activeTab !== 'Dashboard' && activeTab !== 'Users' && activeTab !== 'Service Requests' && activeTab !== 'Job Verification' && activeTab !== 'Target Assessment' && activeTab !== 'Inventory' && activeTab !== 'Sold Products' && activeTab !== 'Inventory Requests' && activeTab !== 'Attendance' && activeTab !== 'Leave Requests' && activeTab !== 'Analytics' && activeTab !== 'All Activities' && activeTab !== 'All Sales' && activeTab !== 'Employee Reports') && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-[#FF6600] shadow-2xl shadow-orange-500/10 rotate-3">
                  <span className="text-4xl">⚡</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{activeTab} Module</h2>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2 font-medium">
                    Our team is currently optimizing this module for the new high-performance web architecture.
                    Check back soon for the experience.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('Dashboard')}
                  className="px-6 py-2.5 bg-[#FF6600] text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;