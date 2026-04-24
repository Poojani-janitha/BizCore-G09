import React, { useEffect, useMemo, useState } from 'react';
import { EMP_KEY, generateEmployees } from '../../storeContext/employeesData';
import { getAttendanceForDate, getLastSavedAttendanceDate, loadAttendanceStore } from '../../storeContext/attendanceData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const today = new Date().toISOString().split('T')[0];
  const lastSavedDate = getLastSavedAttendanceDate() || today;
  const [activeReport, setActiveReport] = useState(null); // 'employees' | 'daily' | 'monthly' | 'leave' | 'payments'
  const [dailyDate, setDailyDate] = useState(lastSavedDate);
  const [month, setMonth] = useState(today.slice(0, 7)); // YYYY-MM
  const [leaveDate, setLeaveDate] = useState(lastSavedDate);
  const [paymentMonth, setPaymentMonth] = useState(today.slice(0, 7)); // YYYY-MM
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [dailySearch, setDailySearch] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const PAYROLL_KEY = 'shanel_payroll_v1';

  const savePdf = (reportId) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;

    const titleMap = {
      employees: 'Employee Details Report',
      daily: `Daily Attendance Report - ${dailyDate}`,
      monthly: `Monthly Attendance Report - ${month}`,
      leave: `Leave Report - ${leaveDate}`,
      payments: `Monthly Payment Report - ${paymentMonth}`,
    };

    const fileSafe = (s) => String(s).replace(/[\\/:*?"<>|]+/g, '-');
    const title = titleMap[reportId] || 'Report';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, marginX, 50);
    doc.setDrawColor(226);
    doc.line(marginX, 60, pageWidth - marginX, 60);

    const money = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

    if (reportId === 'employees') {
      autoTable(doc, {
        startY: 80,
        head: [['ID', 'Employee', 'Role', 'Email', 'Phone']],
        body: employeeDetails.map(e => [e.id, e.name, e.role || '—', e.email || '—', e.phone || '—']),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 64, 175] },
      });
    }

    if (reportId === 'daily') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `Present: ${daily.summary.present}   Leave: ${daily.summary.leave}   Absent: ${daily.summary.absent}   OT Hours: ${daily.summary.totalOtHours.toFixed(2)}   Tea Cost: ${money(daily.summary.totalTeaCost)}`,
        marginX,
        78
      );
      autoTable(doc, {
        startY: 95,
        head: [['ID', 'Employee', 'Role', 'Status', 'Time In', 'Time Out', 'OT', 'Tea Cost']],
        body: daily.rows.map(r => [
          r.id,
          r.name,
          r.role || '—',
          String(r.status || 'absent').toUpperCase(),
          r.timeIn || '—',
          r.timeOut || '—',
          Number(r.otHours || 0).toFixed(2),
          r.teaCost ? money(r.teaCost) : '—',
        ]),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 64, 175] },
      });
    }

    if (reportId === 'monthly') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `OT Hours: ${monthly.summary.totalOtHours.toFixed(2)}   Tea Cost: ${money(monthly.summary.totalTeaCost)}   Bonus Eligible: ${monthly.hasWholeMonth ? monthly.summary.bonusEligible : 0}`,
        marginX,
        78
      );
      autoTable(doc, {
        startY: 95,
        head: [['ID', 'Employee', 'Role', 'Present', 'Leave', 'Absent', 'OT Hours', 'Tea Cost']],
        body: monthly.rows.map(r => [
          r.id,
          r.name,
          r.role || '—',
          r.presentDays,
          r.leaveDays,
          r.absentDays,
          Number(r.otHours || 0).toFixed(2),
          r.teaCost ? money(r.teaCost) : '—',
        ]),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 64, 175] },
      });
    }

    if (reportId === 'leave') {
      autoTable(doc, {
        startY: 80,
        head: [['ID', 'Employee', 'Role', 'Email', 'Phone', 'Reason']],
        body: leaveReport.rows.map(r => [r.id, r.name, r.role || '—', r.email || '—', r.phone || '—', r.reason || '—']),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 64, 175] },
      });
    }

    if (reportId === 'payments') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `Total Gross: ${money(paymentReport.totals.gross)}   Total Deductions: ${money(paymentReport.totals.deductions)}   Total Net: ${money(paymentReport.totals.net)}`,
        marginX,
        78
      );
      autoTable(doc, {
        startY: 95,
        head: [['Code', 'Employee', 'Role', 'Gross', 'Deductions', 'Net', 'Status']],
        body: paymentReport.rows.map(r => [
          r.employeeCode || `EMP-${String(r.id).padStart(3, '0')}`,
          r.employeeName || '—',
          r.employeeRole || '—',
          money(r.grossSalary),
          money(r.totalDeductions),
          money(r.netSalary),
          r.status,
        ]),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 64, 175] },
      });
    }

    doc.save(`${fileSafe(title)}.pdf`);
  };

  const printSection = (sectionId, title, mode = 'print') => {
    const el = document.getElementById(sectionId);
    if (!el) return;

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            body { font-family: Segoe UI, Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { font-size: 18px; margin: 0 0 14px 0; }
            .hint { margin: 0 0 12px 0; padding: 10px 12px; border-radius: 10px; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.18); color: #1e3a8a; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 10px; font-size: 12px; text-align: left; }
            th { background: #f8fafc; font-weight: 700; }
            .muted { color: #64748b; }
            @media print { .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${mode === 'pdf' ? `<div class="hint no-print"><strong>Save PDF:</strong> In the print dialog choose <em>Destination → Save as PDF</em>, then click Save.</div>` : ``}
          ${el.innerHTML}
        </body>
      </html>
    `;

    // Use a hidden iframe to avoid popup/document.write restrictions.
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const frameWindow = iframe.contentWindow;
    if (!frameWindow) {
      document.body.removeChild(iframe);
      return;
    }

    const doc = frameWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    const cleanup = () => {
      try { document.body.removeChild(iframe); } catch { /* ignore */ }
    };

    // Wait for layout/fonts then print.
    setTimeout(() => {
      try {
        frameWindow.focus();
        frameWindow.print();
      } finally {
        // Remove iframe after the dialog opens.
        setTimeout(cleanup, 500);
      }
    }, 100);
  };

  const employees = useMemo(() => {
    try {
      const storedEmployees = localStorage.getItem(EMP_KEY);
      return storedEmployees ? JSON.parse(storedEmployees) : generateEmployees();
    } catch {
      return generateEmployees();
    }
  }, [refreshTick]);

  const employeeDetails = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const q = employeeSearch.toLowerCase();
    return employees.filter(e =>
      String(e.id || '').toLowerCase().includes(q) ||
      String(e.name || '').toLowerCase().includes(q) ||
      String(e.role || '').toLowerCase().includes(q) ||
      String(e.email || '').toLowerCase().includes(q) ||
      String(e.phone || '').toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

  const getWorkHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [inH, inM] = timeIn.split(':').map(Number);
    const [outH, outM] = timeOut.split(':').map(Number);
    return ((outH * 60 + outM) - (inH * 60 + inM)) / 60;
  };

  const daily = useMemo(() => {
    const dayAttendance = getAttendanceForDate(dailyDate);

    const rows = employees.map(e => {
      const rec = dayAttendance?.[e.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 };
      const workedHours = getWorkHours(rec.timeIn, rec.timeOut);
      const roleText = String(e.role || '').toLowerCase();
      const isProductionOrStaffRole = roleText.includes('production') || roleText.includes('staff');
      const teaCost = rec.status === 'present' && isProductionOrStaffRole && rec.timeIn && rec.timeOut && workedHours >= 4 ? 60 : 0;
      return {
        ...e,
        status: rec.status || 'absent',
        timeIn: rec.timeIn || '',
        timeOut: rec.timeOut || '',
        otHours: Number(rec.otHours || 0),
        workedHours,
        teaCost,
        reason: rec.reason || '',
      };
    });

    const summary = rows.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      acc.totalOtHours += r.otHours;
      acc.totalTeaCost += r.teaCost;
      return acc;
    }, { present: 0, leave: 0, absent: 0, totalOtHours: 0, totalTeaCost: 0 });

    const filtered = !dailySearch.trim()
      ? rows
      : rows.filter(r => {
        const q = dailySearch.toLowerCase();
        return (
          String(r.name || '').toLowerCase().includes(q) ||
          String(r.role || '').toLowerCase().includes(q) ||
          String(r.status || '').toLowerCase().includes(q)
        );
      });

    return { rows: filtered, summary };
  }, [dailyDate, employees, dailySearch]);

  const leaveReport = useMemo(() => {
    const dayAttendance = getAttendanceForDate(leaveDate);
    const rows = employees
      .filter(e => dayAttendance?.[e.id]?.status === 'leave')
      .map(e => ({
        id: e.id,
        name: e.name,
        role: e.role,
        email: e.email,
        phone: e.phone,
        reason: dayAttendance?.[e.id]?.reason || '',
      }));
    return { rows };
  }, [employees, leaveDate]);

  const paymentReport = useMemo(() => {
    let payrollRecords = [];
    try {
      const stored = localStorage.getItem(PAYROLL_KEY);
      payrollRecords = stored ? JSON.parse(stored) : [];
    } catch {
      payrollRecords = [];
    }

    const rows = payrollRecords.map(r => ({
      id: String(r.id),
      employeeCode: r.employeeCode,
      employeeName: r.employeeName,
      employeeRole: r.employeeRole,
      grossSalary: Number(r.grossSalary || 0),
      totalDeductions: Number(r.totalDeductions || 0),
      netSalary: Number(r.netSalary || 0),
      status: r.status || 'Pending',
    }));

    const totals = rows.reduce((acc, r) => {
      acc.gross += r.grossSalary;
      acc.deductions += r.totalDeductions;
      acc.net += r.netSalary;
      return acc;
    }, { gross: 0, deductions: 0, net: 0 });

    return { rows, totals, month: paymentMonth };
  }, [paymentMonth, refreshTick]);

  const monthly = useMemo(() => {
    const store = loadAttendanceStore();
    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthNum = Number(monthStr); // 1-12
    if (!year || !monthNum) return { daysInMonth: 0, hasWholeMonth: false, rows: [], summary: { present: 0, leave: 0, absent: 0, totalOtHours: 0, totalTeaCost: 0, bonusEligible: 0 } };

    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, idx) => `${month}-${String(idx + 1).padStart(2, '0')}`);
    const hasWholeMonth = dates.every(d => store[d]);

    const perEmp = employees.map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      presentDays: 0,
      leaveDays: 0,
      absentDays: 0,
      otHours: 0,
      teaCost: 0,
    }));
    const perEmpMap = Object.fromEntries(perEmp.map(r => [r.id, r]));

    const summary = { present: 0, leave: 0, absent: 0, totalOtHours: 0, totalTeaCost: 0, bonusEligible: 0 };

    dates.forEach(d => {
      const day = store[d] || {};
      employees.forEach(e => {
        const rec = day?.[e.id] || { status: 'absent', timeIn: '', timeOut: '', otHours: 0 };
        const status = rec.status || 'absent';
        const row = perEmpMap[e.id];
        if (!row) return;

        if (status === 'present') row.presentDays += 1;
        else if (status === 'leave') row.leaveDays += 1;
        else row.absentDays += 1;

        row.otHours += Number(rec.otHours || 0);

        const workedHours = getWorkHours(rec.timeIn, rec.timeOut);
        const roleText = String(e.role || '').toLowerCase();
        const isProductionOrStaffRole = roleText.includes('production') || roleText.includes('staff');
        row.teaCost += (status === 'present' && isProductionOrStaffRole && rec.timeIn && rec.timeOut && workedHours >= 4) ? 60 : 0;

        summary[status] = (summary[status] || 0) + 1;
        summary.totalOtHours += Number(rec.otHours || 0);
        summary.totalTeaCost += (status === 'present' && isProductionOrStaffRole && rec.timeIn && rec.timeOut && workedHours >= 4) ? 60 : 0;
      });
    });

    if (hasWholeMonth) {
      summary.bonusEligible = perEmp.filter(r => r.presentDays > 25).length;
    }

    return { daysInMonth, hasWholeMonth, rows: perEmp, summary };
  }, [employees, month]);

  useEffect(() => {
    const refresh = () => setRefreshTick(t => t + 1);
    const syncLastSavedDate = () => {
      const savedDate = getLastSavedAttendanceDate();
      if (savedDate) {
        setDailyDate(savedDate);
        setLeaveDate(savedDate);
      }
    };
    window.addEventListener('attendance-updated', refresh);
    window.addEventListener('attendance-saved', syncLastSavedDate);
    window.addEventListener('employees-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('attendance-updated', refresh);
      window.removeEventListener('attendance-saved', syncLastSavedDate);
      window.removeEventListener('employees-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const Stat = ({ title, value, subtitle, color }) => (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e8e8e8',
      borderTop: `3px solid ${color}`,
      padding: '16px 18px',
      minWidth: '160px',
      flex: '1 1 180px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      <div style={{ fontSize: '26px', fontWeight: 800, color: '#1a1a2e' }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{subtitle}</div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '28px 32px',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ marginBottom: '18px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            HR Reports
          </span>
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Employee, attendance, leave, and payment reports
        </p>
      </div>

      {/* Report chooser */}
      {activeReport === null && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e8e8e8',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          padding: '18px 20px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a1a2e', marginBottom: '10px' }}>
            Choose a report
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {[
              { id: 'employees', label: 'Employee Details', color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
              { id: 'daily', label: 'Daily Attendance', color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
              { id: 'monthly', label: 'Monthly Attendance', color: '#1d4ed8', bg: 'rgba(29,78,216,0.10)' },
              { id: 'leave', label: 'Leave Report', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
              { id: 'payments', label: 'Monthly Payments', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setActiveReport(r.id);
                  setEmployeeSearch('');
                  setDailySearch('');
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${r.color}25`,
                  background: r.bg,
                  color: r.color,
                  fontWeight: 900,
                  fontSize: '15px',
                  cursor: 'pointer',
                  flex: '1 1 220px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span>{r.label}</span>
                <span style={{ fontSize: '16px' }}>→</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: '10px', color: '#64748b', fontSize: '12px' }}>
            Tip: Open a report only when you need it, then use the Print button inside that report.
          </div>
        </div>
      )}

      {activeReport !== null && (
        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button 
            onClick={() => setActiveReport(null)}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(100,116,139,0.25)',
              background: 'rgba(100,116,139,0.10)',
              color: '#334155',
              fontWeight: 900,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ← Back to reports
          </button>
        </div>
      )}

      {/* Employee Details Report */}
      {activeReport === 'employees' && (
      <div id="employee-details-report" style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <div className="no-print" style={{
          padding: '16px 20px',
          borderBottom: '1px solid #eef2f7',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#1a1a2e' }}>Employee Details Report</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search employees..."
              value={employeeSearch}
              onChange={e => setEmployeeSearch(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none',
                minWidth: '240px',
              }}
            />
            <button
              onClick={() => savePdf('employees')}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(59,130,246,0.25)',
                background: 'rgba(59,130,246,0.10)',
                color: '#1d4ed8',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Save PDF
            </button>
            <button
              onClick={() => printSection('employee-details-report', 'Employee Details Report', 'print')}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(100,116,139,0.25)',
                background: 'rgba(100,116,139,0.10)',
                color: '#334155',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Print
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 140px 240px 170px',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['ID', 'Employee', 'Role', 'Email', 'Phone'].map(h => (
            <div key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
            }}>
              {h}
            </div>
          ))}
        </div>

        {employeeDetails.map((e, idx) => {
          const rowBg = idx % 2 === 0 ? '#fff' : '#fafbfc';
          return (
            <div
              key={e.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 140px 240px 170px',
                padding: '12px 20px',
                gap: '12px',
                alignItems: 'center',
                background: rowBg,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>{e.id}</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a2e' }}>{e.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{e.role || '—'}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>{e.email || '—'}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>{e.phone || '—'}</div>
            </div>
          );
        })}
      </div>
      )}

      {/* Daily Reports */}
      {activeReport === 'daily' && (
      <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 10px 0' }}>
        <button
          onClick={() => savePdf('daily')}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(59,130,246,0.25)',
            background: 'rgba(59,130,246,0.10)',
            color: '#1d4ed8',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Save PDF
        </button>
        <button
          onClick={() => printSection('daily-report', `Daily Attendance Report - ${dailyDate}`, 'print')}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(100,116,139,0.25)',
            background: 'rgba(100,116,139,0.10)',
            color: '#334155',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Print
        </button>
      </div>
      <div id="daily-report">
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        padding: '16px 20px',
        marginBottom: '14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a2e' }}>Daily Report</div>
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Date:</label>
            <input
              type="date"
              value={dailyDate}
              onChange={e => setDailyDate(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                color: '#1a1a2e',
                outline: 'none',
              }}
            />
            <input
              type="text"
              placeholder="🔍 Search name/role/status..."
              value={dailySearch}
              onChange={e => setDailySearch(e.target.value)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none',
                minWidth: '240px',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
          <Stat title="Present" value={daily.summary.present} subtitle="Employees present" color="#22c55e" />
          <Stat title="On Leave" value={daily.summary.leave} subtitle="Employees on leave" color="#f59e0b" />
          <Stat title="Absent" value={daily.summary.absent} subtitle="Employees absent" color="#ef4444" />
          <Stat title="Total OT Hours" value={daily.summary.totalOtHours.toFixed(2)} subtitle="After 4:00 PM" color="#3b82f6" />
          <Stat title="Tea Cost (Rs)" value={daily.summary.totalTeaCost} subtitle="Eligible present employees" color="#16a34a" />
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 140px 120px 110px 110px 100px 120px',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['ID', 'Employee', 'Role', 'Status', 'Time In', 'Time Out', 'OT', 'Tea Cost'].map(h => (
            <div key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
            }}>
              {h}
            </div>
          ))}
        </div>

        {daily.rows.map((r, idx) => {
          const rowBg = idx % 2 === 0 ? '#fff' : '#fafbfc';
          return (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 140px 120px 110px 110px 100px 120px',
                padding: '12px 20px',
                gap: '12px',
                alignItems: 'center',
                background: rowBg,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>{r.id}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>{r.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{r.role || '—'}</div>
              <div style={{
                fontSize: '12px',
                fontWeight: 800,
                color: r.status === 'present' ? '#16a34a' : r.status === 'leave' ? '#b45309' : '#dc2626',
              }}>
                {String(r.status).toUpperCase()}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{r.timeIn || '—'}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{r.timeOut || '—'}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 800 }}>{Number(r.otHours || 0).toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: r.teaCost ? '#16a34a' : '#94a3b8', fontWeight: 800 }}>
                {r.teaCost ? `Rs ${r.teaCost}` : '—'}
              </div>
            </div>
          );
        })}
      </div>
      </div>
      </>
      )}

      {/* Monthly Reports */}
      {activeReport === 'monthly' && (
      <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 10px 0' }}>
        <button
          onClick={() => savePdf('monthly')}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(59,130,246,0.25)',
            background: 'rgba(59,130,246,0.10)',
            color: '#1d4ed8',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Save PDF
        </button>
        <button
          onClick={() => printSection('monthly-report', `Monthly Attendance Report - ${month}`, 'print')}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(100,116,139,0.25)',
            background: 'rgba(100,116,139,0.10)',
            color: '#334155',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Print
        </button>
      </div>
      <div id="monthly-report">
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        padding: '16px 20px',
        marginBottom: '14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a2e' }}>Monthly Report</div>
          <div className="no-print" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Month:</label>
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                color: '#1a1a2e',
                outline: 'none',
              }}
            />
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              color: monthly.hasWholeMonth ? '#16a34a' : '#b45309',
              background: monthly.hasWholeMonth ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${monthly.hasWholeMonth ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
              padding: '6px 10px',
              borderRadius: '10px',
            }}>
              {monthly.hasWholeMonth ? 'Month attendance complete' : 'Month not complete (Bonus shows 0)'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
          <Stat title="Total OT Hours" value={monthly.summary.totalOtHours.toFixed(2)} subtitle="Sum for the month" color="#3b82f6" />
          <Stat title="Tea Cost (Rs)" value={monthly.summary.totalTeaCost} subtitle="Sum for the month" color="#16a34a" />
          <Stat title="Bonus Eligible" value={monthly.hasWholeMonth ? monthly.summary.bonusEligible : 0} subtitle="26+ present days" color="#a855f7" />
        </div>
      </div>

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 140px 120px 120px 120px 120px 140px',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['ID', 'Employee', 'Role', 'Present', 'Leave', 'Absent', 'OT Hours', 'Tea Cost (Rs)'].map(h => (
            <div key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
            }}>
              {h}
            </div>
          ))}
        </div>

        {monthly.rows.map((r, idx) => {
          const rowBg = idx % 2 === 0 ? '#fff' : '#fafbfc';
          const eligible = monthly.hasWholeMonth && r.presentDays > 25;
          return (
            <div
              key={r.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 140px 120px 120px 120px 120px 140px',
                padding: '12px 20px',
                gap: '12px',
                alignItems: 'center',
                background: rowBg,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 700 }}>{r.id}</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a2e' }}>
                {r.name}
                {eligible && (
                  <span style={{
                    marginLeft: '10px',
                    fontSize: '11px',
                    fontWeight: 900,
                    color: '#7c3aed',
                    background: 'rgba(168,85,247,0.12)',
                    border: '1px solid rgba(168,85,247,0.25)',
                    padding: '3px 8px',
                    borderRadius: '999px',
                  }}>
                    BONUS
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{r.role || '—'}</div>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 900 }}>{r.presentDays}</div>
              <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 900 }}>{r.leaveDays}</div>
              <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 900 }}>{r.absentDays}</div>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 900 }}>{r.otHours.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: r.teaCost ? '#16a34a' : '#94a3b8', fontWeight: 900 }}>
                {r.teaCost ? `Rs ${r.teaCost}` : '—'}
              </div>
            </div>
          );
        })}
      </div>
      </div>
      </>
      )}

      {/* Leave Reports */}
      {activeReport === 'leave' && (
      <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 10px 0', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#1a1a2e' }}>Leave Report</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Date:</label>
          <input
            type="date"
            value={leaveDate}
            onChange={(e) => setLeaveDate(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              color: '#1a1a2e',
              outline: 'none',
            }}
          />
          <button
            onClick={() => savePdf('leave')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(245,158,11,0.25)',
              background: 'rgba(245,158,11,0.12)',
              color: '#b45309',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Save PDF
          </button>
          <button
            onClick={() => printSection('leave-report', `Leave Report - ${leaveDate}`, 'print')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(100,116,139,0.25)',
              background: 'rgba(100,116,139,0.10)',
              color: '#334155',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Print
          </button>
        </div>
      </div>

      <div id="leave-report" style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 140px 220px 160px 1.2fr',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['ID', 'Employee', 'Role', 'Email', 'Phone', 'Reason'].map(h => (
            <div key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
            }}>
              {h}
            </div>
          ))}
        </div>

        {leaveReport.rows.length === 0 ? (
          <div style={{ padding: '22px 20px', color: '#64748b', fontSize: '13px' }}>
            No employees are marked as leave for this date.
          </div>
        ) : (
          leaveReport.rows.map((r, idx) => {
            const rowBg = idx % 2 === 0 ? '#fff' : '#fafbfc';
            return (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 140px 220px 160px 1.2fr',
                  padding: '12px 20px',
                  gap: '12px',
                  alignItems: 'center',
                  background: rowBg,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800 }}>{r.id}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a2e' }}>{r.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{r.role || '—'}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>{r.email || '—'}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700 }}>{r.phone || '—'}</div>
                <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700 }}>{r.reason || '—'}</div>
              </div>
            );
          })
        )}
      </div>
      </>
      )}

      {/* Monthly Payment Reports */}
      {activeReport === 'payments' && (
      <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '18px 0 10px 0', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '14px', fontWeight: 900, color: '#1a1a2e' }}>Monthly Payment Report</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>Month:</label>
          <input
            type="month"
            value={paymentMonth}
            onChange={(e) => setPaymentMonth(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '13px',
              color: '#1a1a2e',
              outline: 'none',
            }}
          />
          <button
            onClick={() => savePdf('payments')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(168,85,247,0.25)',
              background: 'rgba(168,85,247,0.12)',
              color: '#7c3aed',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Save PDF
          </button>
          <button
            onClick={() => printSection('payment-report', `Monthly Payment Report - ${paymentMonth}`, 'print')}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(100,116,139,0.25)',
              background: 'rgba(100,116,139,0.10)',
              color: '#334155',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Print
          </button>
        </div>
      </div>

      <div id="payment-report" style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef2f7', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', fontWeight: 900, color: '#059669' }}>Total Gross: Rs {paymentReport.totals.gross.toLocaleString()}</div>
          <div style={{ fontSize: '12px', fontWeight: 900, color: '#b45309' }}>Total Deductions: Rs {paymentReport.totals.deductions.toLocaleString()}</div>
          <div style={{ fontSize: '12px', fontWeight: 900, color: '#7c3aed' }}>Total Net: Rs {paymentReport.totals.net.toLocaleString()}</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }} className="muted">
            Source: Payroll records (`shanel_payroll_v1`)
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr 140px 140px 140px 140px 120px',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['Code', 'Employee', 'Role', 'Gross', 'Deductions', 'Net', 'Status'].map(h => (
            <div key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
            }}>
              {h}
            </div>
          ))}
        </div>

        {paymentReport.rows.length === 0 ? (
          <div style={{ padding: '22px 20px', color: '#64748b', fontSize: '13px' }}>
            No payroll records found. Open the Payroll page once to initialize payroll data.
          </div>
        ) : (
          paymentReport.rows.map((r, idx) => {
            const rowBg = idx % 2 === 0 ? '#fff' : '#fafbfc';
            return (
              <div
                key={r.employeeCode || r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr 140px 140px 140px 140px 120px',
                  padding: '12px 20px',
                  gap: '12px',
                  alignItems: 'center',
                  background: rowBg,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 900 }}>{r.employeeCode || `EMP-${String(r.id).padStart(3, '0')}`}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a2e' }}>{r.employeeName || '—'}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{r.employeeRole || '—'}</div>
                <div style={{ fontSize: '12px', color: '#059669', fontWeight: 900, textAlign: 'left' }}>Rs {r.grossSalary.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 900 }}>Rs {r.totalDeductions.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 900 }}>Rs {r.netSalary.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: r.status === 'Approved' ? '#16a34a' : '#64748b', fontWeight: 900 }}>{r.status}</div>
              </div>
            );
          })
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default Reports;
