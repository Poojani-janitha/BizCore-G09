// import React from 'react';
// import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
// import QuickActions from '../../component/HR/Dashboard/Quickactions';

// const Hrdashboardpage = () => {
//   const stats = [
//     { title: 'Total Employees', value: '22', subtitle: '2 monthly salaried', icon: '👥', color: 'blue' },
//     { title: 'Present Today', value: '19', subtitle: 'Fingerprint verified', icon: '✅', color: 'green' },
//     { title: 'On Leave', value: '2', subtitle: 'Approved leaves', icon: '📋', color: 'amber' },
//     { title: 'Pending Leaves', value: '1', subtitle: 'Awaiting approval', icon: '⏳', color: 'red' },
//     { title: 'Bonus Eligible', value: '14', subtitle: '20+ days this month', icon: '🏆', color: 'purple' },
//   ];

//   return (
//     <div style={{
//       minHeight: '100vh',
//       background: '#f5f6fa',
//       padding: '28px 32px',
//       fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
//     }}>
//       {/* Header */}
//       <div style={{ marginBottom: '28px' }}>
//         <h1 style={{
//           margin: 0,
//           fontSize: '26px',
//           fontWeight: 800,
//           color: '#1a1a2e',
//           letterSpacing: '-0.5px',
//         }}>
//           <span style={{
//             background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//           }}>HR Dashboard</span>
//         </h1>
//         <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
//           February 2026 · Payroll cycle ends on 10th
//         </p>
//       </div>

//       {/* Stats Row */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
//         {stats.map((s, i) => <HrStatsCard key={i} {...s} />)}
//       </div>

//       {/* Quick Actions */}
//       <div style={{ marginBottom: '22px' }}>
//         <QuickActions />
//       </div>

//       {/* (Simplified) Other HR widgets can be added here */}
//     </div>
//   );
// };

// export default Hrdashboardpage;

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
import QuickActions from '../../component/HR/Dashboard/Quickactions';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const API_BASE = API_ENDPOINTS.hr.root;

const Hrdashboardpage = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const [employees, setEmployees] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMonthStart = (dateStr) => {
    const d = new Date(dateStr);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  };

  const getMonthEnd = (dateStr) => {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().split('T')[0];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const startOfMonth = getMonthStart(today);
      const endOfMonth = getMonthEnd(today);
      
      const [empRes, attRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`),
        axios.get(`${API_BASE}/attendance`, { params: { from: startOfMonth, to: endOfMonth } })
      ]);
      
      setEmployees(empRes.data?.data || []);
      setAttendances(attRes.data?.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [today]);

  const totalEmployees = employees.length || 1;

  const todaySummary = useMemo(() => {
    const todayAtt = attendances.filter(a => a.Attendance_Date === today);
    const present = todayAtt.filter(a => String(a.Status).toLowerCase() === 'present').length;
    const leave = todayAtt.filter(a => String(a.Status).toLowerCase() === 'leave').length;
    return { present, leave };
  }, [attendances, today]);

  const bonusEligible = useMemo(() => {
    const presentDaysByEmp = {};
    attendances.forEach(a => {
      if (String(a.Status).toLowerCase() === 'present') {
        presentDaysByEmp[a.Employee_ID] = (presentDaysByEmp[a.Employee_ID] || 0) + 1;
      }
    });
    return employees.filter(e => (presentDaysByEmp[e.Employee_ID] || 0) > 25).length;
  }, [attendances, employees]);

  const attendanceTrend = useMemo(() => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const toDateKey = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const now = new Date();
    const jsDay = now.getDay();
    const mondayOffset = (jsDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);

    return dayLabels.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateKey = toDateKey(date);
      
      const dayAtt = attendances.filter(a => a.Attendance_Date === dateKey);
      const present = dayAtt.filter(a => String(a.Status).toLowerCase() === 'present').length;
      const percent = totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0;
      
      return { day, present, percent, dateKey };
    });
  }, [attendances, totalEmployees]);

  const stats = [
    { title: 'Total Employees', value: String(totalEmployees), subtitle: 'Active employees', icon: '👥', color: 'blue' },
    { title: 'Present Today', value: String(todaySummary.present), subtitle: 'From attendance updates', icon: '✅', color: 'green' },
    { title: 'On Leave', value: String(todaySummary.leave), subtitle: 'From attendance updates', icon: '📋', color: 'amber' },
    { title: 'Bonus Eligible', value: String(bonusEligible), subtitle: '26+ present days this month', icon: '🏆', color: 'purple' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '28px 32px',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '26px',
          fontWeight: 800,
          color: '#1a1a2e',
          letterSpacing: '-0.5px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>HR Dashboard</span>
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          February 2026 · Payroll cycle ends on 10th
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
        {stats.map((s, i) => <HrStatsCard key={i} {...s} />)}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '22px' }}>
        <QuickActions />
      </div>

      {/* Daily Attendance Summary Graph */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        padding: '18px 20px',
      }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#1a1a2e' }}>
          Daily Attendance Summary
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
          Present employees in the current week (Monday to Sunday)
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', minHeight: '180px' }}>
          {attendanceTrend.map((item) => (
            <div key={item.day} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                {item.present}
              </div>
              <div style={{
                height: `${Math.max(12, item.percent * 1.3)}px`,
                borderRadius: '8px 8px 4px 4px',
                background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 10px rgba(59,130,246,0.25)',
              }} />
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                {item.day}
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hrdashboardpage;