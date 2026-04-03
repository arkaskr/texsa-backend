import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  FolderOpen,
  BarChart3,
  LogOut,
  X,
  Menu,
  CheckCircle2,
  Target,
  CalendarCheck,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import SidebarItem from './SidebarItem';

const Sidebar = ({ isSidebarOpen, setSidebarOpen, activeTab, setActiveTab, onLogout }) => {
  return (
    <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-50">
        <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'hidden'}`}>
          <div className="w-8 h-8 bg-[#FF6600] rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
            <span className="text-white font-bold text-xl font-outfit">T</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 whitespace-nowrap font-outfit">Texsa</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={Users} label="User Management" active={activeTab === 'Users'} onClick={() => setActiveTab('Users')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={ClipboardList} label="Service Requests" active={activeTab === 'Service Requests'} onClick={() => setActiveTab('Service Requests')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={CheckCircle2} label="Job Verification" active={activeTab === 'Job Verification'} onClick={() => setActiveTab('Job Verification')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={Target} label="Target Assessment" active={activeTab === 'Target Assessment'} onClick={() => setActiveTab('Target Assessment')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={Package} label="Inventory" active={activeTab === 'Inventory'} onClick={() => setActiveTab('Inventory')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={LogOut} label="Sold Products" active={activeTab === 'Sold Products'} onClick={() => setActiveTab('Sold Products')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={FolderOpen} label="Inventory Requests" active={activeTab === 'Inventory Requests'} onClick={() => setActiveTab('Inventory Requests')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={CalendarCheck} label="Attendance" active={activeTab === 'Attendance'} onClick={() => setActiveTab('Attendance')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={UserCheck} label="Leave Requests" active={activeTab === 'Leave Requests'} onClick={() => setActiveTab('Leave Requests')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={FileSpreadsheet} label="Employee Reports" active={activeTab === 'Employee Reports'} onClick={() => setActiveTab('Employee Reports')} collapsed={!isSidebarOpen} />
        <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} collapsed={!isSidebarOpen} />
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all">
          <LogOut size={20} />
          {isSidebarOpen && <span className="font-semibold text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
