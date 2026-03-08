import React from 'react';
import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
import QuickActions from '../../component/HR/Dashboard/Quickactions';
import AttendanceSummary from '../../component/HR/Dashboard/AttendanceSummary';

const Hrdashboardpage = () => {
  const stats = [
    { title: 'Total Employees', value: '22', subtitle: '2 monthly salaried', icon: '👥', color: 'blue' },
    { title: 'Present Today', value: '19', subtitle: 'Fingerprint verified', icon: '✅', color: 'green' },
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

      {/* Attendance Summary (bottom) */}
      <div style={{ marginTop: '22px' }}>
        <AttendanceSummary />
      </div>

      {/* (Simplified) Other HR widgets can be added here */}
    </div>
  );
};

export default Hrdashboardpage;