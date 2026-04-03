import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Search, User, Clock, ExternalLink } from 'lucide-react';
import api from '../api/api';



const Attendance = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [filterDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/all', {
        params: { date: filterDate }
      });
      setLogs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Failed to fetch attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-outfit uppercase">Attendance Logs</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] tracking-widest font-semibold">Sales Employee Daily Tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-sm font-bold text-slate-600 focus:outline-none focus:border-[#FF6600] transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF6600] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-[#FF6600] focus:ring-4 focus:ring-[#FF6600]/5 text-sm transition-all"
            />
          </div>
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            Total Records: {filteredLogs.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold">
                <th className="py-4 px-6 border-b border-slate-50">Employee</th>
                <th className="py-4 px-6 border-b border-slate-50">Time Marked</th>
                <th className="py-4 px-6 border-b border-slate-50">Location</th>
                <th className="py-4 px-6 border-b border-slate-50 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 font-semibold animate-pulse">
                    Loading attendance data...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400 font-semibold">
                    No attendance records found for this date.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6600] font-bold shadow-sm uppercase">
                          {log.user?.name ? log.user.name.split(' ').map(n => n[0]).join('') : 'E'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 font-outfit uppercase tracking-wide">
                            {log.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">{log.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Clock size={14} className="text-slate-400" />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold italic">
                        <MapPin size={14} className="text-rose-400" />
                        {log.location?.latitude?.toFixed(4)}, {log.location?.longitude?.toFixed(4)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${log.location?.latitude},${log.location?.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-[#FF6600] hover:text-white rounded-lg text-[10px] font-bold text-slate-600 transition-all uppercase tracking-wider"
                      >
                        <ExternalLink size={12} />
                        View on Map
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
