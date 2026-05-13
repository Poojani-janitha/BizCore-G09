import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const today = new Date().toISOString().split('T')[0];
  const [activeReport, setActiveReport] = useState(null); // 'employees' | 'daily' | 'monthly' | 'leave' | 'payments' | 'individual'
  const [dailyDate, setDailyDate] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7)); // YYYY-MM
  const [leaveDate, setLeaveDate] = useState(today);
  const [paymentMonth, setPaymentMonth] = useState(today.slice(0, 7)); // YYYY-MM
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [dailySearch, setDailySearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [individualData, setIndividualData] = useState({ 
    rows: [], 
    summary: { present: 0, leave: 0, absent: 0, ot: 0, tea: 0 } 
  });
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const handleRefresh = () => setTriggerRefresh(prev => prev + 1);

  const normDate = (d) => d ? String(d).split('T')[0] : '';

  /**
 * PDF Generator: Uses jsPDF and autoTable to create structured reports.
 * Handles specialized table layouts for Employee Details, Attendance (Daily/Monthly), Leaves, and Payments.
 */
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
      individual: `Individual Attendance Report - ${selectedEmp?.name || ''} - ${month}`,
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
        head: [['ID', 'Employee', 'Role', 'Salary Cat', 'Bank Name', 'Branch', 'Email', 'Phone']],
        body: employeeDetails.map(e => [e.id, e.name, e.role || '—', e.salaryCategory || '—', e.bankName || '—', e.bankBranch || '—', e.email || '—', e.phone || '—']),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 64, 175] },
      });
    }

    if (reportId === 'daily') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `Present: ${daily.summary.present}   Leave: ${daily.summary.leave}   Absent: ${daily.summary.absent}   OT Hours: ${daily.summary.totalOtHours.toFixed(2)}`,
        marginX,
        78
      );
      autoTable(doc, {
        startY: 95,
        head: [['ID', 'Employee', 'Role', 'Status', 'Time In', 'Time Out', 'OT']],
        body: daily.rows.map(r => [
          r.id,
          r.name,
          r.role || '—',
          String(r.status || 'absent').toUpperCase(),
          r.timeIn || '—',
          r.timeOut || '—',
          Number(r.otHours || 0).toFixed(2),
        ]),
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 64, 175] },
      });
    }

    if (reportId === 'monthly') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `Monthly Attendance Report - ${month}`,
        marginX,
        78
      );
      autoTable(doc, {
        startY: 95,
        head: [['ID', 'Employee', 'Role', 'Present', 'Leave', 'Absent', 'OT Hours']],
        body: monthly.rows.map(r => [
          r.id,
          r.name,
          r.role || '—',
          r.presentDays,
          r.leaveDays,
          r.absentDays,
          r.isCashier ? Number(r.otHours || 0).toFixed(2) : '—',
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

    if (reportId === 'individual' && selectedEmp) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(
        `Employee: ${selectedEmp.name} (${selectedEmp.role || '—'})   Month: ${month}`,
        marginX,
        78
      );
      doc.text(
        `Present: ${individualData.summary.present}   Leave: ${individualData.summary.leave}   Absent: ${individualData.summary.absent}   OT: ${Number(individualData.summary.ot || 0).toFixed(2)}`,
        marginX,
        92
      );
      autoTable(doc, {
        startY: 105,
        head: [['Date', 'Day', 'Status', 'In', 'Out', 'OT']],
        body: individualData.rows.map(r => [
          r.date,
          r.day,
          r.status.toUpperCase(),
          r.timeIn,
          r.timeOut,
          r.isCashier ? Number(r.ot || 0).toFixed(2) : '—',
        ]),
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [248, 250, 252], textColor: [30, 64, 175] },
      });
    }

    doc.save(`${fileSafe(title)}.pdf`);
  };

  /**
 * Print Helper: Creates a hidden iframe to render a specific report section for printing.
 * Injects custom CSS for print-friendly styling.
 */
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

    setTimeout(() => {
      try {
        frameWindow.focus();
        frameWindow.print();
      } finally {
        setTimeout(cleanup, 500);
      }
    }, 100);
  };

  const [employees, setEmployees] = useState([]);
  const [dailyData, setDailyData] = useState({ rows: [], summary: { present: 0, leave: 0, absent: 0, totalOtHours: 0, totalTeaCost: 0 } });
  const [monthlyData, setMonthlyData] = useState({ daysInMonth: 0, hasWholeMonth: false, rows: [], summary: { present: 0, leave: 0, absent: 0, totalOtHours: 0, totalTeaCost: 0, bonusEligible: 0 } });
  const [leaveReportData, setLeaveReportData] = useState({ rows: [] });
  const [paymentReportData, setPaymentReportData] = useState({ rows: [], totals: { gross: 0, deductions: 0, net: 0 } });
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:5000/api/hr';

  /**
 * MAIN DATA FETCHER (Reports):
 * Orchestrates API calls based on the active report type.
 * Aggregates raw Attendance and Leave data to compute statuses (Present/Absent/Leave) for the UI.
 * Implements specialized logic for 'Monthly' and 'Individual' tracking.
 */
useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (activeReport === 'employees') {
          const res = await axios.get(`${API_BASE}/employees`, { params: { status: 'Active', _t: Date.now() } });
          const emps = Array.isArray(res.data.data) ? res.data.data.map(e => ({
            id: e.Employee_ID,
            name: e.Full_Name,
            role: e.Role,
            email: e.Email,
            phone: e.Contact_Phone_1,
            salaryCategory: e.Salary_Category,
            bankName: e.Bank_Name,
            bankBranch: e.Bank_Branch
          })) : [];
          setEmployees(emps);
        } else if (activeReport === 'daily') {
          const [empRes, attRes, leaveRes] = await Promise.all([
            axios.get(`${API_BASE}/employees`, { params: { status: 'Active', _t: Date.now() } }),
            axios.get(`${API_BASE}/attendance`, { params: { from: dailyDate, to: dailyDate, _t: Date.now() } }),
            axios.get(`${API_BASE}/leaves`, { params: { from: dailyDate, to: dailyDate, _t: Date.now() } })
          ]);
          const emps = Array.isArray(empRes.data.data) ? empRes.data.data : [];
          const attRecords = Array.isArray(attRes.data.data) ? attRes.data.data : [];
          const leaves = Array.isArray(leaveRes.data.data) ? leaveRes.data.data : [];
          const attMap = Object.fromEntries(attRecords.map(r => [String(r.Employee_ID), r]));
          const leaveMap = Object.fromEntries(leaves.filter(l => l.Status === 'Approved').map(l => [String(l.Employee_ID), l]));
          
          const rows = emps.map(e => {
            const rec = attMap[String(e.Employee_ID)] || {};
            const leave = leaveMap[String(e.Employee_ID)];
            
            let status = (rec.Status || 'absent').toLowerCase();
            if (!rec.Status && leave) status = 'leave';

            const isCashier = String(e.Role || '').toLowerCase().includes('cashier');
            const otHours = isCashier ? Number(rec.Overtime_Hours || 0) : 0;

            return {
              id: e.Employee_ID,
              name: e.Full_Name,
              role: e.Role,
              status: status,
              timeIn: rec.Check_In_Time || '—',
              timeOut: rec.Check_Out_Time || '—',
              otHours: otHours,
              isCashier
            };
          });

          const summary = rows.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            acc.totalOtHours += r.otHours;
            return acc;
          }, { present: 0, leave: 0, absent: 0, totalOtHours: 0 });

          setDailyData({ rows, summary });
        } else if (activeReport === 'monthly') {
          const [yearStr, monthStr] = month.split('-');
          const year = Number(yearStr);
          const monthNum = Number(monthStr);
          if (!year || !monthNum) return;
          const daysInMonth = new Date(year, monthNum, 0).getDate();
          
          const from = `${month}-01`;
          const to = `${month}-${String(daysInMonth).padStart(2, '0')}`;
          
          const [empRes, attRes, leaveRes] = await Promise.all([
            axios.get(`${API_BASE}/employees`, { params: { status: 'Active', _t: Date.now() } }),
            axios.get(`${API_BASE}/attendance`, { params: { from, to, _t: Date.now() } }),
            axios.get(`${API_BASE}/leaves`, { params: { from, to, _t: Date.now() } })
          ]);
          
          const emps = Array.isArray(empRes.data.data) ? empRes.data.data : [];
          const attRecords = Array.isArray(attRes.data.data) ? attRes.data.data : [];
          const leaves = Array.isArray(leaveRes.data.data) ? leaveRes.data.data.filter(l => l.Status === 'Approved') : [];
          
          const perEmp = emps.map(e => {
            const employeeAtt = attRecords.filter(r => String(r.Employee_ID) === String(e.Employee_ID));
            const employeeLeaves = leaves.filter(l => String(l.Employee_ID) === String(e.Employee_ID));
            
            const isCashier = String(e.Role || '').toLowerCase().includes('cashier');
            let presentDays = 0, leaveDays = 0, absentDays = 0, otHours = 0;
            const attByDate = Object.fromEntries(employeeAtt.map(a => [normDate(a.Attendance_Date), a]));
            
            for (let d = 1; d <= daysInMonth; d++) {
              const dateStr = `${month}-${String(d).padStart(2, '0')}`;
              const att = attByDate[dateStr];
              const attStatus = (att?.Status || '').toLowerCase();
              
              if (att) {
                if (attStatus === 'present') {
                  presentDays++;
                  if (isCashier) otHours += Number(att.Overtime_Hours || 0);
                } else if (attStatus === 'leave') {
                  leaveDays++;
                } else {
                  absentDays++;
                }
              } else {
                const isOnLeave = employeeLeaves.some(l => {
                  const start = new Date(l.Start_Date);
                  const end = new Date(l.End_Date);
                  const current = new Date(dateStr);
                  return current >= start && current <= end;
                });
                if (isOnLeave) leaveDays++;
                else absentDays++;
              }
            }
            
            return {
              id: e.Employee_ID,
              name: e.Full_Name,
              role: e.Role,
              presentDays, leaveDays, absentDays, otHours, isCashier
            };
          });

          const summary = perEmp.reduce((acc, r) => {
            acc.present += r.presentDays;
            acc.leave += r.leaveDays;
            acc.absent += r.absentDays;
            acc.totalOtHours += r.otHours;
            return acc;
          }, { present: 0, leave: 0, absent: 0, totalOtHours: 0, bonusEligible: 0 });
          
          summary.bonusEligible = perEmp.filter(r => r.presentDays >= 25).length;
          setMonthlyData({ daysInMonth, hasWholeMonth: true, rows: perEmp, summary });
        } else if (activeReport === 'leave') {
          const [empRes, leaveRes] = await Promise.all([
            axios.get(`${API_BASE}/employees`, { params: { status: 'Active', _t: Date.now() } }),
            axios.get(`${API_BASE}/leaves`, { params: { from: leaveDate, to: leaveDate, _t: Date.now() } })
          ]);
          const emps = Array.isArray(empRes.data.data) ? empRes.data.data : [];
          const empMap = Object.fromEntries(emps.map(e => [e.Employee_ID, e]));
          const leaves = Array.isArray(leaveRes.data.data) ? leaveRes.data.data : [];
          
          const rows = leaves.map(l => {
            const e = empMap[l.Employee_ID] || {};
            return {
              id: l.Employee_ID,
              name: e.Full_Name || 'Unknown',
              role: e.Role || '',
              email: e.Email || '',
              phone: e.Contact_Phone_1 || '',
              reason: l.Reason || ''
            };
          });
          setLeaveReportData({ rows });
        } else if (activeReport === 'payments') {
          const [yearStr, monthStr] = paymentMonth.split('-');
          const payRes = await axios.get(`${API_BASE}/payroll`, { params: { month: monthStr, year: yearStr, _t: Date.now() }});
          const dbPayrolls = Array.isArray(payRes.data.data) ? payRes.data.data : [];
          
          const rows = dbPayrolls.map(r => ({
            id: r.Employee_ID,
            employeeCode: `EMP-${String(r.Employee_ID).padStart(3, '0')}`,
            employeeName: r.Employee?.Full_Name || 'Unknown',
            employeeRole: r.Employee?.Role || '',
            grossSalary: Number(r.Gross_Salary || 0),
            totalDeductions: Number(r.Total_Deductions || 0),
            netSalary: Number(r.Net_Salary || 0),
            status: r.Payment_Status || 'Pending'
          }));
          const totals = rows.reduce((acc, r) => {
            acc.gross += r.grossSalary;
            acc.deductions += r.totalDeductions;
            acc.net += r.netSalary;
            return acc;
          }, { gross: 0, deductions: 0, net: 0 });
          setPaymentReportData({ rows, totals });
        } else if (activeReport === 'individual') {
          if (employees.length === 0) {
            const res = await axios.get(`${API_BASE}/employees`, { params: { status: 'Active', _t: Date.now() } });
            const emps = Array.isArray(res.data.data) ? res.data.data.map(e => ({
              id: e.Employee_ID,
              name: e.Full_Name,
              role: e.Role,
              email: e.Email,
              phone: e.Contact_Phone_1
            })) : [];
            setEmployees(emps);
          }
          if (!selectedEmp) return;
          const [yearStr, monthStr] = month.split('-');
          const year = Number(yearStr);
          const monthNum = Number(monthStr);
          const daysInMonth = new Date(year, monthNum, 0).getDate();
          
          const from = `${month}-01`;
          const to = `${month}-${String(daysInMonth).padStart(2, '0')}`;
          
          const [attRes, leaveRes] = await Promise.all([
            axios.get(`${API_BASE}/attendance`, { params: { from, to, employeeId: selectedEmp.id, _t: Date.now() } }),
            axios.get(`${API_BASE}/leaves`, { params: { from, to, employeeId: selectedEmp.id, _t: Date.now() } })
          ]);
          
          const attRecords = Array.isArray(attRes.data.data) ? attRes.data.data : [];
          const attMap = Object.fromEntries(attRecords.map(r => [normDate(r.Attendance_Date), r]));
          const leaves = Array.isArray(leaveRes.data.data) ? leaveRes.data.data.filter(l => l.Status === 'Approved') : [];
          
          const rows = [];
          const isCashier = String(selectedEmp.role || '').toLowerCase().includes('cashier');
          let present = 0, leave = 0, absent = 0, ot = 0;
          
          for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${month}-${String(d).padStart(2, '0')}`;
            const rec = attMap[dateStr] || {};
            const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
            
            let status = (rec.Status || 'absent').toLowerCase();
            if (!rec.Status) {
              const isOnLeave = leaves.some(l => {
                const start = new Date(normDate(l.Start_Date));
                const end = new Date(normDate(l.End_Date));
                const current = new Date(dateStr);
                return current >= start && current <= end;
              });
              if (isOnLeave) status = 'leave';
            }

            if (status === 'present') {
              present++;
              if (isCashier) ot += Number(rec.Overtime_Hours || 0);
            }
            else if (status === 'leave') leave++;
            else absent++;
            
            rows.push({
              date: dateStr,
              day: dayName,
              status,
              timeIn: rec.Check_In_Time || '—',
              timeOut: rec.Check_Out_Time || '—',
              ot: isCashier ? Number(rec.Overtime_Hours || 0) : 0,
              isCashier
            });
          }
          setIndividualData({ rows, summary: { present, leave, absent, ot } });
        }
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (activeReport) fetchData();
  }, [activeReport, dailyDate, month, leaveDate, paymentMonth, selectedEmp, triggerRefresh]);

  const employeeDetails = useMemo(() => {
    if (!employeeSearch.trim()) return employees;
    const q = employeeSearch.toLowerCase();
    return employees.filter(e =>
      String(e.id || '').toLowerCase().includes(q) ||
      String(e.name || '').toLowerCase().includes(q) ||
      String(e.role || '').toLowerCase().includes(q) ||
      String(e.email || '').toLowerCase().includes(q) ||
      String(e.phone || '').toLowerCase().includes(q) ||
      String(e.salaryCategory || '').toLowerCase().includes(q) ||
      String(e.bankName || '').toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

  const daily = useMemo(() => {
    const filtered = !dailySearch.trim()
      ? dailyData.rows
      : dailyData.rows.filter(r => {
        const q = dailySearch.toLowerCase();
        return (
          String(r.name || '').toLowerCase().includes(q) ||
          String(r.role || '').toLowerCase().includes(q) ||
          String(r.status || '').toLowerCase().includes(q)
        );
      });
    return { rows: filtered, summary: dailyData.summary };
  }, [dailyData, dailySearch]);

  const monthly = monthlyData;
  const leaveReport = leaveReportData;
  const paymentReport = paymentReportData;

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
            background: 'linear-gradient(135deg, #0d9488, #0f172a)',
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
              { id: 'employees', label: 'Employee Details', color: '#0d9488', bg: '#f0fdfa' },
              { id: 'daily', label: 'Daily Attendance', color: '#059669', bg: '#ecfdf5' },
              { id: 'monthly', label: 'Monthly Attendance', color: '#0d9488', bg: '#f0fdfa' },
              { id: 'leave', label: 'Leave Report', color: '#ea580c', bg: '#fff7ed' },
              { id: 'payments', label: 'Monthly Payments', color: '#8b5cf6', bg: '#f5f3ff' },
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
              onClick={handleRefresh}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(13, 148, 136, 0.25)',
                background: 'rgba(13, 148, 136, 0.10)',
                color: '#0d9488',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => savePdf('employees')}
              style={{
                padding: '8px 14px',
                borderRadius: '12px',
                border: '1px solid #ccfbf1',
                background: '#f0fdfa',
                color: '#0d9488',
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
          gridTemplateColumns: '50px 1.8fr 1.2fr 1.4fr 1.2fr 2fr',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {[
            { label: 'ID', align: 'center' },
            { label: 'Name', align: 'left' },
            { label: 'Role', align: 'left' },
            { label: 'Salary Cat.', align: 'center' },
            { label: 'Phone', align: 'center' },
            { label: 'Email', align: 'left' }
          ].map(h => (
            <div key={h.label} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#0d9488',
              background: '#f0fdfa',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #ccfbf1',
              textAlign: h.align
            }}>
              {h.label}
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
                gridTemplateColumns: '50px 1.8fr 1.2fr 1.4fr 1.2fr 2fr',
                padding: '12px 20px',
                gap: '12px',
                alignItems: 'center',
                background: rowBg,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800, textAlign: 'center' }}>{e.id}</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a2e' }}>{e.name}</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{e.role || '—'}</div>
              <div style={{ fontSize: '12px', color: '#0d9488', fontWeight: 800, textAlign: 'center' }}>{e.salaryCategory || '—'}</div>
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700, textAlign: 'center' }}>{e.phone || '—'}</div>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>{e.email || '—'}</div>
            </div>
          );
        })}
      </div>
      )}

      {activeReport === 'daily' && (
      <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 10px 0' }}>
        <button
          onClick={handleRefresh}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(13, 148, 136, 0.25)',
            background: 'rgba(13, 148, 136, 0.10)',
            color: '#0d9488',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          🔄 Refresh
        </button>
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
          <Stat title="Total OT Hours" value={daily.summary.totalOtHours.toFixed(2)} subtitle="Cashier OT only" color="#3b82f6" />
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
          gridTemplateColumns: '60px 1.5fr 1fr 120px 110px 110px 100px',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['ID', 'Employee', 'Role', 'Status', 'Time In', 'Time Out', 'OT'].map(h => (
            <div key={h} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#0d9488',
              background: '#f0fdfa',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #ccfbf1',
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
                gridTemplateColumns: '60px 1.5fr 1fr 120px 110px 110px 100px',
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
              <div style={{ fontSize: '12px', color: '#475569', fontWeight: 800 }}>{r.isCashier ? Number(r.otHours || 0).toFixed(2) : '—'}</div>
            </div>
          );
        })}
      </div>
      </div>
      </>
      )}

      {activeReport === 'monthly' && (
      <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 10px 0' }}>
        <button
          onClick={handleRefresh}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(13, 148, 136, 0.25)',
            background: 'rgba(13, 148, 136, 0.10)',
            color: '#0d9488',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          🔄 Refresh
        </button>
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
              {monthly.hasWholeMonth ? 'Month attendance complete' : 'Month not complete'}
            </div>
          </div>
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
          gridTemplateColumns: '60px 1.2fr 1.2fr 100px 100px 100px 100px 80px',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {['ID', 'Employee', 'Role', 'Present', 'Leave', 'Absent', 'OT', 'Action'].map((h, i) => (
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
              textAlign: i >= 3 ? 'center' : 'left',
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
                gridTemplateColumns: '60px 1.2fr 1.2fr 100px 100px 100px 100px 80px',
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
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 900, textAlign: 'center' }}>{r.presentDays}</div>
              <div style={{ fontSize: '12px', color: '#b45309', fontWeight: 900, textAlign: 'center' }}>{r.leaveDays}</div>
              <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 900, textAlign: 'center' }}>{r.absentDays}</div>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 900, textAlign: 'center' }}>{r.isCashier ? r.otHours.toFixed(2) : '—'}</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setSelectedEmp(r);
                    setActiveReport('individual');
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #0d9488',
                    background: '#f0fdfa',
                    color: '#0d9488',
                    fontSize: '11px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  View
                </button>
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
            onClick={handleRefresh}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              background: 'rgba(13, 148, 136, 0.10)',
              color: '#0d9488',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            🔄 Refresh
          </button>
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
          gridTemplateColumns: '60px 1.5fr 1fr 1.8fr 1.2fr 1.5fr',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {[
            { label: 'ID', align: 'center' },
            { label: 'Employee', align: 'left' },
            { label: 'Role', align: 'left' },
            { label: 'Email', align: 'left' },
            { label: 'Phone', align: 'center' },
            { label: 'Reason', align: 'left' }
          ].map(h => (
            <div key={h.label} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
              textAlign: h.align
            }}>
              {h.label}
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
                  gridTemplateColumns: '60px 1.5fr 1fr 1.8fr 1.2fr 1.5fr',
                  padding: '12px 20px',
                  gap: '12px',
                  alignItems: 'center',
                  background: rowBg,
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 800, textAlign: 'center' }}>{r.id}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.role || '—'}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email || '—'}</div>
                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 700, textAlign: 'center' }}>{r.phone || '—'}</div>
                <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason || '—'}</div>
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
            onClick={handleRefresh}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(13, 148, 136, 0.25)',
              background: 'rgba(13, 148, 136, 0.10)',
              color: '#0d9488',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            🔄 Refresh
          </button>
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

      {activeReport === 'individual' && (
      <>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 0 10px 0' }}>
        <button
          onClick={handleRefresh}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(13, 148, 136, 0.25)',
            background: 'rgba(13, 148, 136, 0.10)',
            color: '#0d9488',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          🔄 Refresh
        </button>
        <button
          onClick={() => savePdf('individual')}
          style={{
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(8,145,178,0.25)',
            background: 'rgba(8,145,178,0.10)',
            color: '#0891b2',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Save PDF
        </button>
        <button
          onClick={() => printSection('individual-report', `Individual Attendance - ${selectedEmp?.name} - ${month}`, 'print')}
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
      <div id="individual-report">
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e8e8e8',
        padding: '16px 20px',
        marginBottom: '14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1a1a2e' }}>Individual Attendance Report</div>
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
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginLeft: '10px' }}>Employee:</label>
            <select
              value={selectedEmp?.id || ''}
              onChange={e => {
                const emp = employees.find(emp => String(emp.id) === e.target.value);
                setSelectedEmp(emp);
              }}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                color: '#1a1a2e',
                outline: 'none',
              }}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedEmp && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
            <Stat title="Employee" value={selectedEmp.name} subtitle={selectedEmp.role} color="#1e40af" />
            <Stat title="Present Days" value={individualData.summary.present || 0} subtitle="Total for month" color="#16a34a" />
            <Stat title="Leave/Absent" value={`${individualData.summary.leave || 0} / ${individualData.summary.absent || 0}`} subtitle="Days" color="#dc2626" />
            <Stat title="Total OT" value={(individualData.summary.ot || 0).toFixed(2)} subtitle="Hours" color="#3b82f6" />
          </div>
        )}
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
          gridTemplateColumns: '120px 80px 100px 1fr 1fr 100px',
          background: '#f8fafc',
          borderBottom: '2px solid #e8e8e8',
          padding: '12px 20px',
          gap: '12px',
          alignItems: 'center',
        }}>
          {[
            { label: 'Date', align: 'center' },
            { label: 'Day', align: 'center' },
            { label: 'Status', align: 'center' },
            { label: 'In', align: 'center' },
            { label: 'Out', align: 'center' },
            { label: 'OT', align: 'center' }
          ].map(h => (
            <div key={h.label} style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#1e40af',
              background: 'rgba(59,130,246,0.12)',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(59,130,246,0.3)',
              textAlign: h.align
            }}>
              {h.label}
            </div>
          ))}
        </div>

        {individualData.rows.map((r, idx) => {
          const rowBg = idx % 2 === 0 ? '#fff' : '#fafbfc';
          const isWeekend = r.day === 'Sat' || r.day === 'Sun';
          return (
            <div
              key={r.date}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 80px 100px 1fr 1fr 100px',
                padding: '10px 20px',
                gap: '12px',
                alignItems: 'center',
                background: isWeekend ? '#fefce8' : rowBg,
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textAlign: 'center' }}>{r.date}</div>
              <div style={{ fontSize: '12px', color: isWeekend ? '#b45309' : '#64748b', fontWeight: 600, textAlign: 'center' }}>{r.day}</div>
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 900, 
                color: r.status === 'present' ? '#16a34a' : r.status === 'leave' ? '#b45309' : '#dc2626',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                {r.status}
              </div>
              <div style={{ fontSize: '12px', color: '#1a1a2e', textAlign: 'center' }}>{r.timeIn}</div>
              <div style={{ fontSize: '12px', color: '#1a1a2e', textAlign: 'center' }}>{r.timeOut}</div>
              <div style={{ fontSize: '12px', color: '#334155', fontWeight: 700, textAlign: 'center' }}>{r.isCashier && r.ot > 0 ? r.ot.toFixed(2) : '—'}</div>
            </div>
          );
        })}
      </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Reports;
