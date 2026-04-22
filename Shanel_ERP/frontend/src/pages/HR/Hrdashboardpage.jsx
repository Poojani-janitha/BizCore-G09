import React, { useMemo } from 'react';
import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
import QuickActions from '../../component/HR/Dashboard/Quickactions';
import { EMP_KEY, generateEmployees } from '../../storeContext/employeesData';

const Hrdashboardpage = () => {
  const employees = useMemo(() => {
    try {
      const storedEmployees = localStorage.getItem(EMP_KEY);
      return storedEmployees ? JSON.parse(storedEmployees) : generateEmployees();
    } catch {
      return generateEmployees();
    }
  }, []);

  const totalEmployees = employees.length || 1;

  const attendanceTrend = useMemo(() => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayLabels.map((day, index) => {
      // Demo trend based on employee count; can be replaced with real attendance records.
      const present = Math.max(0, Math.min(totalEmployees, Math.round(totalEmployees * (0.72 + ((index % 4) * 0.06)))));
      const percent = Math.round((present / totalEmployees) * 100);
      return { day, present, percent };
    });
  }, [totalEmployees]);

  const stats = [
    { title: 'Total Employees', value: String(totalEmployees), subtitle: 'Active employees', icon: '👥', color: 'blue' },
    { title: 'Present Today', value: String(attendanceTrend[attendanceTrend.length - 1]?.present || 0), subtitle: 'From daily trend', icon: '✅', color: 'green' },
    { title: 'On Leave', value: '2', subtitle: 'Approved leaves', icon: '📋', color: 'amber' },
    { title: 'Pending Leaves', value: '1', subtitle: 'Awaiting approval', icon: '⏳', color: 'red' },
    { title: 'Bonus Eligible', value: '14', subtitle: '20+ days this month', icon: '🏆', color: 'purple' },
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
          Present employees in the last 7 days
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