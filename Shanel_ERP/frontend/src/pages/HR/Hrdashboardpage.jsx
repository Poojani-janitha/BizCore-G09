import React, { useEffect, useMemo, useState } from 'react';
import HrStatsCard from '../../component/HR/Dashboard/HrStatsCard';
import QuickActions from '../../component/HR/Dashboard/Quickactions';
import { EMP_KEY, generateEmployees } from '../../storeContext/employeesData';
import { getAttendanceForDate, loadAttendanceStore } from '../../storeContext/attendanceData';

const Hrdashboardpage = () => {
  const today = new Date().toISOString().split('T')[0];
  const employees = useMemo(() => {
    try {
      const storedEmployees = localStorage.getItem(EMP_KEY);
      return storedEmployees ? JSON.parse(storedEmployees) : generateEmployees();
    } catch {
      return generateEmployees();
    }
  }, []);

  const totalEmployees = employees.length || 1;

  const getMonthKey = (dateStr) => dateStr.slice(0, 7); // YYYY-MM

  const computeTodaySummary = () => {
    const todayAttendance = getAttendanceForDate(today);
    const present = employees.filter(e => todayAttendance?.[e.id]?.status === 'present').length;
    const leave = employees.filter(e => todayAttendance?.[e.id]?.status === 'leave').length;
    return { present, leave };
  };

  const [todaySummary, setTodaySummary] = useState(() => computeTodaySummary());
  const [refreshTick, setRefreshTick] = useState(0);

  const computeBonusEligible = () => {
    const store = loadAttendanceStore();
    const monthKey = getMonthKey(today);
    const [yearStr, monthStr] = monthKey.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr); // 1-12
    if (!year || !month) return 0;

    const daysInMonth = new Date(year, month, 0).getDate();
    const requiredDates = Array.from({ length: daysInMonth }, (_, idx) => {
      const day = String(idx + 1).padStart(2, '0');
      return `${monthKey}-${day}`;
    });

    // By default show 0 until the full month is marked
    const hasWholeMonth = requiredDates.every(d => store[d]);
    if (!hasWholeMonth) return 0;

    const presentDaysByEmp = Object.fromEntries(employees.map(e => [e.id, 0]));
    requiredDates.forEach(d => {
      const daily = store[d] || {};
      employees.forEach(e => {
        if (daily?.[e.id]?.status === 'present') presentDaysByEmp[e.id] += 1;
      });
    });

    // "more than 25 days"
    return employees.filter(e => (presentDaysByEmp[e.id] || 0) > 25).length;
  };

  const [bonusEligible, setBonusEligible] = useState(() => computeBonusEligible());

  useEffect(() => {
    const refresh = () => {
      setTodaySummary(computeTodaySummary());
      setBonusEligible(computeBonusEligible());
      setRefreshTick(t => t + 1);
    };
    refresh();
    window.addEventListener('attendance-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('attendance-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [totalEmployees]); // eslint-disable-line react-hooks/exhaustive-deps

  const attendanceTrend = useMemo(() => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const store = loadAttendanceStore();

    const toDateKey = (dateObj) => {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Week starts on Monday (Mon=0 ... Sun=6).
    const now = new Date();
    const jsDay = now.getDay(); // Sun=0 ... Sat=6
    const mondayOffset = (jsDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);

    return dayLabels.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      const dateKey = toDateKey(date);
      const dayAttendance = store?.[dateKey] || {};
      const present = employees.filter(e => dayAttendance?.[e.id]?.status === 'present').length;
      const percent = Math.round((present / totalEmployees) * 100);
      return { day, present, percent, dateKey };
    });
  }, [employees, totalEmployees, refreshTick]);

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