import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Download, Users, Calendar, Loader2, AlertCircle } from 'lucide-react';

const EmployeeReports = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  const today = new Date();
  const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const response = await axios.get(`${apiUrl}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const staff = response.data.filter(u => u.role === 'SALES_EMPLOYEE' || u.role === 'SERVICE_EMPLOYEE');
        setEmployees(staff);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleGeneratePreview = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee first.");
      return;
    }
    if (!selectedMonth) {
      setError("Please select a month.");
      return;
    }
    
    setError(null);
    setGenerating(true);
    try {
      const token = localStorage.getItem('adminToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/analytics/employee-report/${selectedEmployee}?month=${selectedMonth}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const wb = XLSX.utils.book_new();

    // 1. Summary Sheet
    const isSales = reportData.employee.role === 'SALES_EMPLOYEE';
    
    const totalSalesRev = isSales ? reportData.performanceData.filter(p => p.status === 'Verified').reduce((sum, p) => sum + p.amount, 0) : 0;
    const totalServices = !isSales ? reportData.performanceData.filter(p => p.status === 'Completed').length : 0;
    
    const summaryRows = [
      ['Report Month', selectedMonth],
      ['Employee Name', reportData.employee.name],
      ['Role', reportData.employee.role.replace('_', ' ')],
      ['Email', reportData.employee.email],
      ['Phone', reportData.employee.phone || 'N/A'],
      [],
      ['--- PERFORMANCE METRICS ---', ''],
      ['Total Days Present', reportData.attendance.length],
      ['Total Leaves Taken/Approved', reportData.leaves.filter(l => l.status === 'APPROVED').length],
    ];

    if (isSales) {
      summaryRows.push(
        ['Total Verified Sales Revenue', `₹${totalSalesRev.toLocaleString()}`],
        ['Total Sales Transactions', reportData.performanceData.length],
        ['Monthly Target', reportData.targets?.targetValue ? `₹${reportData.targets.targetValue.toLocaleString()}` : 'Not Set'],
        ['Target Achieved %', reportData.targets?.targetValue ? `${((totalSalesRev / reportData.targets.targetValue) * 100).toFixed(1)}%` : 'N/A']
      );
    } else {
      summaryRows.push(
        ['Total Service Tasks Handled', reportData.performanceData.length],
        ['Completed Tasks', totalServices],
        ['Failed/Rejected Tasks', reportData.performanceData.filter(p => p.status === 'Failed' || p.status === 'Employee Rejected').length]
      );
    }

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    
    // Style adjustments for summary
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // 2. Attendance Sheet
    const attData = reportData.attendance.map(a => ({
      'Date': a.date,
      'Check-in Time': new Date(a.timestamp).toLocaleTimeString(),
      'Latitude': a.location?.latitude || 'N/A',
      'Longitude': a.location?.longitude || 'N/A'
    }));
    const wsAtt = XLSX.utils.json_to_sheet(attData.length ? attData : [{ Note: 'No attendance records found' }]);
    wsAtt['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsAtt, 'Attendance');

    // 3. Performance / Sales Sheet
    let perfData;
    if (isSales) {
      perfData = reportData.performanceData.map(p => ({
        'Date': p.date,
        'Customer': p.customerName,
        'Product': p.productName,
        'SKU': p.productSku || '',
        'Amount (₹)': p.amount,
        'Status': p.status
      }));
    } else {
      perfData = reportData.performanceData.map(p => ({
        'Service Date': p.serviceDate,
        'Customer': p.customerName || 'N/A',
        'Product': p.productName,
        'Model': p.modelName,
        'Address': p.address,
        'Status': p.status,
        'Notes': p.completionDescription || ''
      }));
    }
    const wsPerf = XLSX.utils.json_to_sheet(perfData.length ? perfData : [{ Note: 'No tasks or sales found' }]);
    wsPerf['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsPerf, isSales ? 'Sales Log' : 'Service Tasks');

    // 4. Leaves Sheet
    const leavesData = reportData.leaves.map(l => ({
      'Start Date': new Date(l.startDate).toLocaleDateString(),
      'End Date': new Date(l.endDate).toLocaleDateString(),
      'Reason': l.reason,
      'Status': l.status
    }));
    const wsLeaves = XLSX.utils.json_to_sheet(leavesData.length ? leavesData : [{ Note: 'No leaves taken' }]);
    wsLeaves['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsLeaves, 'Leave Records');

    // Save
    const sanitizedName = reportData.employee.name.replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `${sanitizedName}_Report_${selectedMonth}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Employee Reports</h1>
        <p className="text-slate-500 mt-1 font-medium">Generate comprehensive Excel performance reports for staff</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Users size={16} className="text-[#FF6600]" />
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              disabled={loadingEmployees}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] font-medium text-slate-700"
            >
              <option value="">{loadingEmployees ? 'Loading...' : '-- Select Employee --'}</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.role === 'SALES_EMPLOYEE' ? 'Sales' : 'Service'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Calendar size={16} className="text-[#FF6600]" />
              Report Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] font-medium text-slate-700"
            />
          </div>

          <div>
            <button
              onClick={handleGeneratePreview}
              disabled={generating || !selectedEmployee}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {generating ? <Loader2 size={18} className="animate-spin" /> : <span>Fetch Data</span>}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100">
            <AlertCircle size={20} />
            <span className="font-semibold text-sm">{error}</span>
          </div>
        )}
      </div>

      {reportData && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 bg-white border border-[#FF6600]/20 border-t-4 border-t-[#FF6600] shadow-2xl shadow-[#FF6600]/5 rounded-3xl p-8 overflow-hidden relative">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-black text-slate-900">{reportData.employee.name}</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                  {reportData.employee.role === 'SALES_EMPLOYEE' ? 'Sales Exec' : 'Service Tech'}
                </span>
              </div>
              <p className="text-slate-500 font-medium">Report generated for: <span className="font-bold text-slate-700">{selectedMonth}</span></p>
            </div>
            
            <button 
              onClick={handleExportExcel}
              className="bg-[#FF6600] hover:bg-[#E65C00] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-[#FF6600]/30 transition-all flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-[0]"
            >
              <Download size={20} />
              Export to Excel (.xlsx)
            </button>
          </div>

          {/* Quick Metrics Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Days Present</p>
              <p className="text-2xl font-bold text-slate-800">{reportData.attendance.length}</p>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Leaves</p>
              <p className="text-2xl font-bold text-slate-800">{reportData.leaves.length}</p>
            </div>
            
            {reportData.employee.role === 'SALES_EMPLOYEE' ? (
              <>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                  <p className="text-[11px] font-black text-orange-500 uppercase tracking-wider mb-1">Sales Revenue</p>
                  <p className="text-2xl font-bold text-orange-700">
                    ₹{reportData.performanceData.filter(p => p.status === 'Verified').reduce((a, b) => a + b.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                  <p className="text-[11px] font-black text-green-600 uppercase tracking-wider mb-1">Target</p>
                  <p className="text-2xl font-bold text-green-700">
                    {reportData.targets?.targetValue ? `₹${reportData.targets.targetValue.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
                  <p className="text-[11px] font-black text-orange-500 uppercase tracking-wider mb-1">Assigned Tasks</p>
                  <p className="text-2xl font-bold text-orange-700">{reportData.performanceData.length}</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                  <p className="text-[11px] font-black text-green-600 uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-700">
                    {reportData.performanceData.filter(p => p.status === 'Completed').length}
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-8 text-center bg-slate-50 p-6 rounded-2xl border border-slate-100 border-dashed">
             <div className="inline-flex h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full items-center justify-center mb-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
             </div>
             <p className="text-slate-600 font-medium max-w-md mx-auto">
               Data compilation successful! Click the <b>Export Export</b> button above to download the full, detailed spreadsheet with multiple tabs.
             </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default EmployeeReports;
