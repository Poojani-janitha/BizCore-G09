import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { DollarSign, Calculator, Send, Download, CheckCircle, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { Calculator, Send, Download, CheckCircle, AlertCircle, Edit2, Save, X, Eye, Printer, FileText, History } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_BASE = 'http://localhost:5000/api/hr';

// Salary configuration based on role
/**
 * Retrieves salary configuration (base, rates, bonus rules) based on employee role.
 */
const getSalaryConfig = (role) => {
  const normalizedRole = String(role || '').trim().toLowerCase();
  
  if (normalizedRole === 'cashier') {
    return {
      salaryType: 'Monthly Fixed',
      basicSalary: 35000,
      otRate: 100,
      bonusEligible: true,
      bonusThreshold: 20,
      bonusAmount: 2500,
    };
  } else if (normalizedRole === 'manager') {
    return {
      salaryType: 'Monthly Fixed',
      basicSalary: 50000, // Default placeholder for manager
      otRate: 0,
      bonusEligible: true,
      bonusThreshold: 20,
      bonusAmount: 2500,
    };
  } else if (normalizedRole === 'staff (production)') {
    return {
      salaryType: 'Card Based',
      cardRate: 75,
      bonusEligible: true,
      bonusThreshold: 20,
      bonusAmount: 2500,
    };
  } else {
    // Default to Staff
    return {
      salaryType: 'Card Based',
      cardRate: 75,
      bonusEligible: true,
      bonusThreshold: 20,
      bonusAmount: 2500,
    };
  }
};

// Calculate salary components
/**
 * MAIN PAYROLL CALCULATION ENGINE (Frontend):
 * Calculates all salary components (Basic, OT, Bonus, Tea, Deductions, Net) based on stats and config.
 * Implements role-specific logic like Cashier tea allowance exclusion.
 */
const calculateSalary = (config, role, stats, cardsMade = 0) => {
  let basicSalary = 0;
  let productionEarnings = 0;
  let overtimeEarnings = 0;
  let attendanceBonus = 0;
  
  const roleLower = String(role || '').toLowerCase();
  
  let teaAllowance = stats.totalTeaAllowance || 0;
  if (roleLower === 'cashier' || roleLower === 'manager') {
    teaAllowance = 0;
  }
  
  let teaOtPay = stats.totalTeaOt || 0;
  if (roleLower === 'cashier' || roleLower === 'manager') {
    teaOtPay = 0;
  }

  const advanceDeduction = stats.advanceDeduction || 0;
  const epfDeduction = stats.epfDeduction || 0;
  const etfDeduction = stats.etfDeduction || 0;
  const otherDeductions = stats.otherDeductions || 0;
  const otherAllowances = stats.otherAllowances || 0;

  if (config.salaryType === 'Monthly Fixed') {
    basicSalary = config.basicSalary;
    overtimeEarnings = (stats.totalOtHours * (config.otRate || 0)) + teaOtPay;
  } else if (config.salaryType === 'Card Based') {
    productionEarnings = (cardsMade || 0) * config.cardRate;
    overtimeEarnings = (stats.totalOtHours * (config.otRate || 0)) + teaOtPay;
  }

  // Explicitly enforce Cashier Rs 100 / hr rule to OT Pay row
  if (roleLower === 'cashier') {
    overtimeEarnings = (stats.totalOtHours || 0) * 100;
  }

  if (config.bonusEligible && stats.daysWorked > config.bonusThreshold) {
    attendanceBonus = config.bonusAmount;
  }

  const grossSalary = basicSalary + productionEarnings + overtimeEarnings + attendanceBonus + teaAllowance + otherAllowances;

  const totalDeductions = epfDeduction + etfDeduction + advanceDeduction + otherDeductions;
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary,
    productionEarnings,
    overtimeEarnings,
    attendanceBonus,
    teaAllowance,
    otherAllowances,
    epfDeduction,
    etfDeduction,
    advanceDeduction,
    otherDeductions,
    grossSalary,
    totalDeductions,
    netSalary,
  };
};



export default function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '', recipientEmail: '', notes: '' });

  const [showCardsModal, setShowCardsModal] = useState(false);
  const [selectedEmpForCards, setSelectedEmpForCards] = useState(null);
  const [dailyCardsData, setDailyCardsData] = useState([]);
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmpForView, setSelectedEmpForView] = useState(null);
  const [selectedEmpForAdj, setSelectedEmpForAdj] = useState(null);
  const [adjData, setAdjData] = useState({
    epf: '',
    etf: '',
    advance: '',
    newDeductionAmount: '',
    newDeductionReason: '',
    newAllowanceAmount: '',
    newAllowanceReason: '',
    existingDeductions: [],
    existingAllowances: []
  });
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [modalMonth, setModalMonth] = useState('');

  const API_BASE = API_ENDPOINTS.hr.root;


  // Helper to render dynamic breakdown of other allowances
  const renderAllowancesBreakdown = (allowanceReason, otherAllowances) => {
    try {
      if (allowanceReason && allowanceReason.startsWith('[')) {
        const list = JSON.parse(allowanceReason);
        const validList = list.filter(item => parseFloat(item.amount) > 0);
        if (validList.length > 0) {
          return validList.map((item, idx) => (
            <div key={`allw-tbl-${idx}`} style={{ fontSize: '10px', color: '#0d9488', fontWeight: 400, marginTop: '2px' }}>
              + {item.reason || 'Allw'}: Rs. {parseFloat(item.amount || 0).toLocaleString()}
            </div>
          ));
        }
      }
    } catch (e) {}
    if (otherAllowances > 0) {
      return (
        <div style={{ fontSize: '10px', color: '#0d9488', fontWeight: 400, marginTop: '2px' }}>
          + Allw: Rs. {(otherAllowances || 0).toLocaleString()}
        </div>
      );
    }
    return null;
  };

  // Helper to render dynamic breakdown of other deductions
  const renderDeductionsBreakdown = (deductionReason, totalDeductions) => {
    try {
      if (deductionReason && deductionReason.startsWith('[')) {
        const list = JSON.parse(deductionReason);
        const validList = list.filter(item => parseFloat(item.amount) > 0);
        if (validList.length > 0) {
          return validList.map((item, idx) => (
            <div key={`ded-tbl-${idx}`} style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400, marginTop: '2px' }}>
              - {item.reason || 'Ded'}: Rs. {parseFloat(item.amount || 0).toLocaleString()}
            </div>
          ));
        }
      }
    } catch (e) {}
    if (totalDeductions > 0) {
      return (
        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400, marginTop: '2px' }}>
          - Ded: Rs. {(totalDeductions || 0).toLocaleString()}
        </div>
      );
    }
    return null;
  };

  // Helper to calculate daily tea cost (Replicating AttendancePage logic)
  /**
 * Helper: Calculates daily tea cost for an employee record.
 * Logic: Rs 60 standard, Rs 450 if working past 5 PM. Excludes specific roles.
 */
  const getDailyTeaCost = (rec, role) => {
    if (rec.Status !== 'Present' || !rec.Check_In_Time || !rec.Check_Out_Time) return 0;
    const roleText = String(role || '').toLowerCase();
    if (roleText.includes('cashier') || roleText.includes('manager') || roleText.includes('admin')) return 0;

    const [inH, inM] = rec.Check_In_Time.split(':').map(Number);
    const [outH, outM] = rec.Check_Out_Time.split(':').map(Number);
    const workedHours = ((outH * 60 + outM) - (inH * 60 + inM)) / 60;

    if (workedHours < 4) return 0;

    const outMinutes = outH * 60 + outM;
    return outMinutes > (18 * 60) ? 450 : 60;
  };

  // Fetch employees, payroll, and monthly attendance
  /**
 * Data Fetcher: Loads Employees, Payroll, and Attendance data from the backend.
 * Merges them into a single "combined" record format for the UI table.
 */
  const fetchPayrollData = async (monthStr) => {
    try {
      setLoading(true);
      const [year, month] = monthStr.split('-');
      const firstDay = `${year}-${month}-01`;
      const lastDay = new Date(year, month, 0).toISOString().split('T')[0];

      const [empRes, payRes, attRes] = await Promise.all([
        axios.get(`${API_BASE}/employees`, { params: { status: 'Active' } }),
        axios.get(`${API_BASE}/payroll`, { params: { month, year } }),
        axios.get(`${API_BASE}/attendance`, { params: { from: firstDay, to: lastDay } })
      ]);

      const employees = Array.isArray(empRes?.data?.data) ? empRes.data.data : [];
      const dbPayrolls = Array.isArray(payRes?.data?.data) ? payRes.data.data : [];
      const attendances = Array.isArray(attRes?.data?.data) ? attRes.data.data : [];

      // Compute monthly stats from attendance
      const statsMap = {};
      attendances.forEach(att => {
        const id = att.Employee_ID;
        if (!statsMap[id]) statsMap[id] = { daysWorked: 0, totalOtHours: 0, totalTeaAllowance: 0, totalTeaOt: 0, totalCards: 0 };

        if (att.Status === 'Present') {
          statsMap[id].daysWorked += 1;
          statsMap[id].totalOtHours += parseFloat(att.Overtime_Hours || 0);
          
          const dailyTea = getDailyTeaCost(att, att.Employee?.Role);
          if (dailyTea === 60) {
            statsMap[id].totalTeaAllowance += 60;
          } else if (dailyTea === 450) {
            statsMap[id].totalTeaOt += 450;
          }
          
          statsMap[id].totalCards += parseInt(att.Cards_Produced || 0);
        }
      });

      const payrollMap = Object.fromEntries(dbPayrolls.map(p => [p.Employee_ID, p]));

      const combinedRecords = employees.map(emp => {
        const empId = emp.Employee_ID;
        const dbRec = payrollMap[empId];
        const role = emp.Role || 'Staff';
        const stats = statsMap[empId] || { daysWorked: 0, totalOtHours: 0, totalTeaAllowance: 0, totalTeaOt: 0, totalCards: 0 };

        const config = getSalaryConfig(role);

        const salary = calculateSalary(config, role, {
          ...stats,
          epfDeduction: parseFloat(dbRec?.EPF_Employee_Deduction || 0),
          etfDeduction: parseFloat(dbRec?.ETF_Employee_Deduction || 0),
          advanceDeduction: parseFloat(dbRec?.Advance_Deduction || 0),
          otherDeductions: parseFloat(dbRec?.Other_Deductions || 0),
          otherAllowances: parseFloat(dbRec?.Other_Allowances || 0)
        }, stats.totalCards);

        return {
          id: empId,
          payrollId: dbRec?.Payroll_ID || null,
          employeeId: empId,
          employeeCode: emp.Employee_Code,
          employeeName: emp.Full_Name,
          employeeRole: emp.Role,
          bankAccountNo: emp.Bank_Account_No,
          salaryType: config.salaryType,
          daysWorked: stats.daysWorked,
          totalCards: stats.totalCards,
          deductionReason: dbRec?.Other_Deductions_Reason || '',
          allowanceReason: dbRec?.Other_Allowances_Reason || '',
          ...salary,
          status: dbRec?.Payment_Status || 'Pending',
        };
      });

      setPayrollRecords(combinedRecords);
    } catch (error) {
      console.error('Failed to load payroll data:', error);
      alert('Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData(selectedMonth);
  }, [selectedMonth]);

  /**
 * Persister: Sends updated payroll data to the backend (POST for new, PUT for existing).
 */
  const persistRecord = async (recordData, newStatus) => {
    const [year, month] = selectedMonth.split('-');
    const payload = {
      Employee_ID: recordData.id,
      Pay_Period_Month: Number(month),
      Pay_Period_Year: Number(year),
      Basic_Salary: recordData.basicSalary,
      Production_Earnings: recordData.productionEarnings,
      Overtime_Earnings: recordData.overtimeEarnings,
      Attendance_Bonus: recordData.attendanceBonus,
      Tea_Allowance: recordData.teaAllowance,
      Gross_Salary: recordData.grossSalary,
      EPF_Employee_Deduction: recordData.epfDeduction,
      ETF_Employee_Deduction: recordData.etfDeduction,
      Advance_Deduction: recordData.advanceDeduction,
      Other_Deductions: recordData.otherDeductions,
      Other_Allowances: recordData.otherAllowances,
      Other_Deductions_Reason: recordData.deductionReason,
      Other_Allowances_Reason: recordData.allowanceReason,
      Total_Deductions: recordData.totalDeductions,
      Net_Salary: recordData.netSalary,
      Payment_Status: newStatus || recordData.status
    };

    if (recordData.payrollId) {
      await axios.put(`${API_BASE}/payroll/${recordData.payrollId}`, payload);
    } else {
      await axios.post(`${API_BASE}/payroll`, payload);
    }
  };
  //approves a record.
  const approveRecord = async (id) => {
    const record = payrollRecords.find(r => r.id === id);
    try {
      setLoading(true);
      await persistRecord(record, 'Approved');
      await fetchPayrollData(selectedMonth);
    } catch (error) {
      console.error('Failed to approve payroll:', error);
      alert('Failed to approve payroll');
    } finally {
      setLoading(false);
    }
  };
  //reverts the approval status of a record.
  const revertApproval = async (id) => {
    const record = payrollRecords.find(r => r.id === id);
    try {
      setLoading(true);
      await persistRecord(record, 'Pending');
      await fetchPayrollData(selectedMonth);
    } catch (error) {
      console.error('Failed to revert approval:', error);
      alert('Failed to revert approval');
    } finally {
      setLoading(false);
    }
  };
  //opens the view modal.
  const openViewModal = (record) => {
    setSelectedEmpForView(record);
    setShowViewModal(true);
  };

  const approveAll = async () => {
    const pendingRecords = payrollRecords.filter(r => r.status === 'Pending');
    if (pendingRecords.length === 0) {
      alert('No pending records to approve.');
      return;
    }

    try {
      setLoading(true);
      for (const record of pendingRecords) {
        await persistRecord(record, 'Approved');
      }
      await fetchPayrollData(selectedMonth);
      alert('All pending records approved successfully!');
    } catch (error) {
      console.error('Failed to approve all:', error);
      alert('Some records failed to approve. Check the console.');
    } finally {
      setLoading(false);
    }
  };

  const revertAll = async () => {
    const approvedRecords = payrollRecords.filter(r => r.status === 'Approved');
    if (approvedRecords.length === 0) {
      alert('No approved records to reset.');
      return;
    }

    if (!window.confirm('Are you sure you want to reset all approved records back to pending?')) return;

    try {
      setLoading(true);
      for (const record of approvedRecords) {
        await persistRecord(record, 'Pending');
      }
      await fetchPayrollData(selectedMonth);
      alert('All approved records reset to pending successfully!');
    } catch (error) {
      console.error('Failed to reset all:', error);
      alert('Some records failed to reset. Check the console.');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = payrollRecords.filter((record) =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalGross = filteredRecords.reduce((sum, r) => sum + r.grossSalary, 0);
  const totalNet = filteredRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const pendingCount = filteredRecords.filter((r) => r.status === 'Pending').length;
  const approvedCount = filteredRecords.filter((r) => r.status === 'Approved').length;

  // to format month for display
  const getFriendlyMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const generatePDFContent = () => {
    const friendlyMonth = getFriendlyMonth(selectedMonth);
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payroll Report - ${friendlyMonth}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { text-align: center; color: #1e3a5f; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
            .details { margin: 15px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f0f0f0; padding: 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
            td { padding: 8px; border: 1px solid #ddd; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            .amount { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header"><h1>SHANEL ERP - Payroll Report</h1></div>
          <div style="text-align: center; margin-bottom: 20px; font-weight: bold; font-size: 18px; color: #1e3a5f;">
            Month: ${friendlyMonth}
          </div>
          <div class="details">
            <p>Generated on: ${currentDate}</p>
          </div>
          <table>
            <thead>
              <tr><th>Name</th><th>Role</th><th class="amount">Gross</th><th class="amount">Net</th></tr>
            </thead>
            <tbody>
              ${filteredRecords.map((r) => `<tr><td>${r.employeeName}</td><td>${r.employeeRole}</td><td class="amount">Rs. ${r.grossSalary.toLocaleString()}</td><td class="amount">Rs. ${r.netSalary.toLocaleString()}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  const printPDF = () => {
    const content = generatePDFContent();
    const newWindow = window.open('', '_blank');
    newWindow.document.open();
    newWindow.document.write(content);
    newWindow.document.close();
    setTimeout(() => newWindow.print(), 250);
  };

  const savePDF = () => {
    const doc = new jsPDF();
    const friendlyMonth = getFriendlyMonth(selectedMonth);

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 95);
    doc.text(`Payroll Report - ${friendlyMonth}`, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Shanel ERP - HR Management System`, 14, 35);
    doc.line(14, 40, 196, 40);

    const tableColumn = ["Emp Code", "Name", "Role", "Days", "Gross", "Deductions", "Net Salary"];
    const tableRows = filteredRecords.map(r => [
      r.employeeCode,
      r.employeeName,
      r.employeeRole,
      r.daysWorked,
      `Rs. ${r.grossSalary.toLocaleString()}`,
      `Rs. ${r.totalDeductions.toLocaleString()}`,
      `Rs. ${r.netSalary.toLocaleString()}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 95], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 45 }
    });

    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Net Payable: Rs. ${totalNet.toLocaleString()}`, 14, finalY + 15);

    doc.save(`Payroll_Report_${selectedMonth}.pdf`);
  };

  /**
 * Export Helper: Generates a paysheet PDF and calls the backend email API to send it to the bank.
 */
  const handleMailToBank = async () => {
    if (!bankDetails.recipientEmail || !bankDetails.bankName) {
      alert('Please enter bank name and recipient email.');
      return;
    }

    try {
      setLoading(true);
      const doc = new jsPDF();
      const friendlyMonth = getFriendlyMonth(selectedMonth);
      const [year, month] = selectedMonth.split('-');

      // Generate PDF (Similar to savePDF but for bank)
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 95);
      doc.text(`Monthly Paysheet - ${friendlyMonth}`, 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Bank: ${bankDetails.bankName}`, 14, 30);
      doc.text(`Shanel ERP - HR Management System`, 14, 35);
      doc.line(14, 40, 196, 40);

      const tableColumn = ["Employee Name", "Net Salary", "Account Number"];
      const tableRows = filteredRecords.map(r => [
        r.employeeName,
        `Rs. ${r.netSalary.toLocaleString()}`,
        r.bankAccountNo || 'N/A'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [30, 58, 95], textColor: 255 },
        margin: { top: 45 }
      });

      const pdfBase64 = doc.output('datauristring');

      await axios.post(`${API_BASE}/payroll/mail-to-bank`, {
        recipientEmail: bankDetails.recipientEmail,
        bankName: bankDetails.bankName,
        month,
        year,
        pdfBase64,
        notes: bankDetails.notes
      });

      alert('Paysheet successfully mailed to the bank!');
      setShowBankModal(false);
    } catch (error) {
      console.error('Mail to bank error:', error);
      alert(error?.response?.data?.message || 'Failed to send mail. Ensure your backend email configuration is correct.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const friendlyMonth = getFriendlyMonth(selectedMonth);
    const headers = ['Employee Code', 'Employee Name', 'Role', 'Gross Salary', 'EPF', 'ETF', 'Advance', 'Other Ded', 'Net Salary', 'Status'];
    const rows = filteredRecords.map((r) => [
      r.employeeCode,
      r.employeeName,
      r.employeeRole,
      r.grossSalary,
      r.epfDeduction,
      r.etfDeduction,
      r.advanceDeduction,
      r.otherDeductions,
      r.netSalary,
      r.status
    ]);
    const csvContent = [`Payroll Report - ${friendlyMonth}`, "", headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payroll_Report_${selectedMonth}.csv`;
    a.click();
  };

  // Daily Cards Modal Logic
  const openDailyCardsModal = async (emp) => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-');
      const firstDay = `${year}-${month}-01`;
      const lastDayDate = new Date(year, month, 0);
      const lastDayStr = lastDayDate.toISOString().split('T')[0];
      const lastDay = lastDayDate.getDate();

      // Fetch existing records and leaves for the month
      const [attRes, leavesRes] = await Promise.all([
        axios.get(`${API_BASE}/attendance`, {
          params: { employeeId: emp.id, from: firstDay, to: lastDayStr }
        }),
        axios.get(`${API_BASE}/leaves`, {
          params: { employeeId: emp.id, from: firstDay, to: lastDayStr, status: 'Approved' }
        })
      ]);

      const existing = attRes.data.data || [];
      const leaves = leavesRes.data.data || [];

      const days = [];
      const todayStr = new Date().toISOString().split('T')[0];

      for (let i = 1; i <= lastDay; i++) {
        const dateStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
        const match = existing.find(a => a.Attendance_Date === dateStr);
        const leaveMatch = leaves.find(l => l.Start_Date <= dateStr && l.End_Date >= dateStr);

        days.push({
          date: dateStr,
          day: i,
          cards: leaveMatch ? 0 : (match?.Cards_Produced ?? 0),
          status: leaveMatch ? 'Leave' : (match?.Status || 'Absent'),
          isLeave: !!leaveMatch,
          hasTimeIn: !!match?.Check_In_Time,
          timeIn: match?.Check_In_Time || null,
          timeOut: match?.Check_Out_Time || null,
          totalHours: match?.Total_Hours || null,
          isLate: match?.Is_Late || false,
          lateMinutes: match?.Late_Minutes || 0,
          isOvertime: match?.Is_Overtime || false,
          overtimeHours: match?.Overtime_Hours || 0,
        });
      }

      setDailyCardsData(days);
      setSelectedEmpForCards(emp);
      
      // Fetch historical totals for the last 12 months for the "Monthly History" view
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const histRes = await axios.get(`${API_BASE}/attendance`, {
        params: { employeeId: emp.id, from: oneYearAgo.toISOString().split('T')[0] }
      });
      
      const historyMap = {};
      (histRes.data.data || []).forEach(att => {
        const m = att.Attendance_Date.substring(0, 7);
        historyMap[m] = (historyMap[m] || 0) + (att.Cards_Produced || 0);
      });
      setMonthlyHistory(Object.entries(historyMap).sort((a,b) => b[0].localeCompare(a[0])));

      setModalMonth(selectedMonth);
      setShowHistory(false);
      setShowCardsModal(true);
    } catch (error) {
      console.error('openDailyCardsModal error:', error);
      alert('Failed to load daily cards data');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch daily data if the month is changed WITHIN the modal
  useEffect(() => {
    if (showCardsModal && modalMonth && selectedEmpForCards) {
      const refreshModalData = async () => {
        try {
          const [year, month] = modalMonth.split('-');
          const firstDay = `${year}-${month}-01`;
          const lastDayDate = new Date(year, month, 0);
          const lastDayStr = lastDayDate.toISOString().split('T')[0];
          const lastDay = lastDayDate.getDate();

          const [attRes, leavesRes] = await Promise.all([
            axios.get(`${API_BASE}/attendance`, {
              params: { employeeId: selectedEmpForCards.id, from: firstDay, to: lastDayStr }
            }),
            axios.get(`${API_BASE}/leaves`, {
              params: { employeeId: selectedEmpForCards.id, from: firstDay, to: lastDayStr, status: 'Approved' }
            })
          ]);

          const existing = attRes.data.data || [];
          const leaves = leavesRes.data.data || [];
          const todayStr = new Date().toISOString().split('T')[0];

          const days = [];
          for (let i = 1; i <= lastDay; i++) {
            const dateStr = `${year}-${month}-${String(i).padStart(2, '0')}`;
            const match = existing.find(a => a.Attendance_Date === dateStr);
            const leaveMatch = leaves.find(l => l.Start_Date <= dateStr && l.End_Date >= dateStr);

            days.push({
              date: dateStr,
              day: i,
              cards: leaveMatch ? 0 : (match?.Cards_Produced ?? 0),
              status: leaveMatch ? 'Leave' : (match?.Status || 'Absent'),
              isLeave: !!leaveMatch,
              hasTimeIn: !!match?.Check_In_Time,
              timeIn: match?.Check_In_Time || null,
              timeOut: match?.Check_Out_Time || null,
              totalHours: match?.Total_Hours || null,
              isLate: match?.Is_Late || false,
              lateMinutes: match?.Late_Minutes || 0,
              isOvertime: match?.Is_Overtime || false,
              overtimeHours: match?.Overtime_Hours || 0,
            });
          }
          setDailyCardsData(days);
        } catch (err) {
          console.error('refreshModalData error:', err);
        }
      };
      refreshModalData();
    }
  }, [modalMonth, showCardsModal]);

  const saveDailyCards = async () => {
    try {
      setLoading(true);
      const records = dailyCardsData.map(d => ({
        Employee_ID: selectedEmpForCards.id,
        Attendance_Date: d.date,
        Status: d.status,
        Cards_Produced: d.cards,
        Marked_By: 'Manual',
        Check_In_Time: d.timeIn,
        Check_Out_Time: d.timeOut,
        Total_Hours: d.totalHours,
        Is_Late: d.isLate,
        Late_Minutes: d.lateMinutes,
        Is_Overtime: d.isOvertime,
        Overtime_Hours: d.overtimeHours
      }));

      await axios.post(`${API_BASE}/attendance/bulk`, { records });
      await fetchPayrollData(selectedMonth);
      setShowCardsModal(false);
    } catch (error) {
      alert('Failed to save daily cards');
    } finally {
      setLoading(false);
    }
  };

  const openAdjModal = (record) => {
    setSelectedEmpForAdj(record);
    let parsedDeductions = [];
    try {
      if (record.deductionReason && record.deductionReason.startsWith('[')) {
        parsedDeductions = JSON.parse(record.deductionReason);
        if (!Array.isArray(parsedDeductions)) parsedDeductions = [];
      } else if (record.otherDeductions > 0 || record.deductionReason) {
        parsedDeductions = [{ amount: record.otherDeductions ? String(record.otherDeductions) : '', reason: record.deductionReason || '' }];
      }
    } catch (e) {
      parsedDeductions = [];
    }
    // Filter out completely empty items from existing deductions list
    parsedDeductions = parsedDeductions.filter(item => item && (item.amount || item.reason));

    let parsedAllowances = [];
    try {
      if (record.allowanceReason && record.allowanceReason.startsWith('[')) {
        parsedAllowances = JSON.parse(record.allowanceReason);
        if (!Array.isArray(parsedAllowances)) parsedAllowances = [];
      } else if (record.otherAllowances > 0 || record.allowanceReason) {
        parsedAllowances = [{ amount: record.otherAllowances ? String(record.otherAllowances) : '', reason: record.allowanceReason || '' }];
      }
    } catch (e) {
      parsedAllowances = [];
    }
    // Filter out completely empty items from existing allowances list
    parsedAllowances = parsedAllowances.filter(item => item && (item.amount || item.reason));

    setAdjData({
      epf: '',
      etf: '',
      advance: '',
      newDeductionAmount: '',
      newDeductionReason: '',
      newAllowanceAmount: '',
      newAllowanceReason: '',
      existingDeductions: parsedDeductions,
      existingAllowances: parsedAllowances
    });
    setShowAdjModal(true);
  };

  const saveAdjustments = async () => {
    try {
      setLoading(true);

      const deductionsList = [...adjData.existingDeductions];
      if (adjData.newDeductionAmount && parseFloat(adjData.newDeductionAmount) > 0) {
        deductionsList.push({
          amount: adjData.newDeductionAmount,
          reason: adjData.newDeductionReason || 'Adjustment',
          date: new Date().toISOString().split('T')[0]
        });
      }

      const allowancesList = [...adjData.existingAllowances];
      if (adjData.newAllowanceAmount && parseFloat(adjData.newAllowanceAmount) > 0) {
        allowancesList.push({
          amount: adjData.newAllowanceAmount,
          reason: adjData.newAllowanceReason || 'Adjustment',
          date: new Date().toISOString().split('T')[0]
        });
      }

      const totalOtherDeductions = deductionsList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
      const totalOtherAllowances = allowancesList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      const updatedRecord = {
        ...selectedEmpForAdj,
        epfDeduction: adjData.epf === '' ? selectedEmpForAdj.epfDeduction : (parseFloat(adjData.epf) || 0),
        etfDeduction: adjData.etf === '' ? selectedEmpForAdj.etfDeduction : (parseFloat(adjData.etf) || 0),
        advanceDeduction: adjData.advance === '' ? selectedEmpForAdj.advanceDeduction : (parseFloat(adjData.advance) || 0),
        otherDeductions: totalOtherDeductions,
        otherAllowances: totalOtherAllowances,
        deductionReason: JSON.stringify(deductionsList),
        allowanceReason: JSON.stringify(allowancesList)
      };

      // Recalculate salary with new adjustments
      const config = getSalaryConfig(updatedRecord.employeeRole);
      const salary = calculateSalary(config, updatedRecord.employeeRole, {
        daysWorked: updatedRecord.daysWorked,
        totalOtHours: updatedRecord.overtimeEarnings / (config.otRate || 1),
        totalTeaCost: updatedRecord.teaAllowance,
        ...updatedRecord
      }, updatedRecord.totalCards);

      await persistRecord({ ...updatedRecord, ...salary }, updatedRecord.status);
      await fetchPayrollData(selectedMonth);
      setShowAdjModal(false);
    } catch (error) {
      alert('Failed to save adjustments');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '28px 32px', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>

        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={printPDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}>
            <Printer size={16} color="#0d9488" /> Print PDF
          </button>
          <button onClick={savePDF} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}>
            <FileText size={16} color="#0d9488" /> Save PDF
          </button>
          <button onClick={exportToCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}>
            <Download size={16} color="#0d9488" /> Export CSV
          </button>
          <button onClick={() => setShowBankModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'linear-gradient(135deg, #1e3a5f, #0f172a)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30,58,95,0.2)' }}>
            <Send size={16} /> Mail to Bank
          </button>
          <button onClick={approveAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(13,148,136,0.2)' }}>
            <CheckCircle size={16} /> Approve All
          </button>
          <button onClick={revertAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.2)' }}>
            <X size={16} /> Reset All
          </button>
        </div>
      </div>

      {/* Filters & Actions */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search employee by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
        </div>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none', fontWeight: 600, color: '#1e3a5f' }}
        />
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Total Gross', value: totalGross, color: '#3b82f6' },
          { label: 'Total Net', value: totalNet, color: '#10b981' },
          { label: 'Pending', value: pendingCount, color: '#f59e0b', isCount: true },
          { label: 'Approved', value: approvedCount, color: '#8b5cf6', isCount: true },
        ].map((stat, i) => (
          <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{stat.label}</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '22px', fontWeight: 800, color: stat.color }}>
              {stat.isCount ? stat.value : `Rs. ${stat.value.toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Employee</th>
                <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Role</th>
                <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Days</th>
                <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Cards Made</th>
                <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Base Pay</th>
                <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>OT Pay</th>
                <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Bonus</th>
                <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Tea Allw.</th>
                <th style={{ textAlign: 'right', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Net Salary</th>
                <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, idx) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{record.employeeName}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{record.employeeCode}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{record.employeeRole}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>{record.daysWorked}</td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    {record.salaryType === 'Card Based' ? (
                      <div
                        onClick={() => openDailyCardsModal(record)}
                        style={{ cursor: 'pointer', padding: '6px 12px', background: '#f1f5f9', borderRadius: '8px', color: '#1e293b', fontWeight: 800, border: '1px solid #e2e8f0', display: 'inline-block' }}
                      >
                        {record.totalCards} <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 400 }}>Cards</span>
                      </div>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                    Rs. {((record.basicSalary || 0) + (record.productionEarnings || 0)).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                    {record.overtimeEarnings > 0 ? `Rs. ${(record.overtimeEarnings || 0).toLocaleString()}` : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '14px', color: '#10b981', fontWeight: 700 }}>
                    {record.attendanceBonus > 0 ? `Rs. ${(record.attendanceBonus || 0).toLocaleString()}` : <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                    Rs. {(record.teaAllowance || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '15px', color: '#1e3a5f', fontWeight: 800 }}>
                    Rs. {(record.netSalary || 0).toLocaleString()}
                    {renderAllowancesBreakdown(record.allowanceReason, record.otherAllowances)}
                    {renderDeductionsBreakdown(record.deductionReason, record.otherDeductions)}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      background: record.status === 'Approved' ? '#dcfce7' : '#fef3c7',
                      color: record.status === 'Approved' ? '#166534' : '#92400e',
                      border: `1px solid ${record.status === 'Approved' ? '#16653420' : '#92400e20'}`
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openViewModal(record)}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e3a5f', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                        title="View Breakdown"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openAdjModal(record)}
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                        title="Deductions & Adjustments"
                      >
                        <Edit2 size={16} />
                      </button>
                      {record.status === 'Pending' ? (
                        <button
                          onClick={() => approveRecord(record.id)}
                          style={{ background: '#f0fdf4', border: '1px solid #dcfce7', color: '#10b981', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : record.status === 'Approved' ? (
                        <button
                          onClick={() => revertApproval(record.id)}
                          style={{ background: '#fff1f2', border: '1px solid #ffe4e6', color: '#f43f5e', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                          title="Revert to Pending"
                        >
                          <X size={16} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Info */}
      <div style={{ marginTop: '24px', padding: '20px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: '#1e3a5f' }}>Calculation Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, color: '#475569' }}>CASHIER</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Rs. 35,000 Fixed + Rs. 100/hr OT (after 5 PM)</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, color: '#475569' }}>STAFF</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Rs. 75 per Card Produced</p>
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 700, color: '#475569' }}>BONUS & TEA</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Rs. 2,500 Bonus if &gt; 20 days. Tea Allw. auto-calculated from Attendance.</p>
          </div>
        </div>
      </div>

      {/* Daily Cards Modal */}
      {showCardsModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Daily Card Production</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>{selectedEmpForCards?.employeeName} - {selectedMonth}</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="month" 
                  value={modalMonth}
                  onChange={(e) => setModalMonth(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, color: '#1e3a5f', outline: 'none' }}
                />
                {!showHistory && (
                  <button 
                    onClick={() => setShowHistory(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#1e3a5f' }}
                  >
                    <History size={16} /> Card history
                  </button>
                )}
                <button onClick={() => setShowCardsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: showHistory ? 'repeat(auto-fill, minmax(120px, 1fr))' : '1fr', gap: '12px', marginBottom: '32px' }}>
              {!showHistory && !dailyCardsData.some(d => d.date === new Date().toISOString().split('T')[0]) && (
                <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Today's date is not in the selected month ({selectedMonth}).</p>
                  <button onClick={() => setShowHistory(true)} style={{ marginTop: '12px', background: 'none', border: 'none', color: '#0d9488', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>View Full Card History</button>
                </div>
              )}
              {dailyCardsData.filter(d => {
                const todayStr = new Date().toISOString().split('T')[0];
                if (!showHistory) return d.date === todayStr;
                return d.date <= todayStr;
              }).map((day) => {
                const isToday = day.date === new Date().toISOString().split('T')[0];
                const originalIdx = dailyCardsData.findIndex(d => d.date === day.date);
                
                return (
                  <div key={day.date} style={{ 
                    padding: '12px', 
                    background: isToday ? '#f0fdfa' : '#f8fafc', 
                    borderRadius: '12px', 
                    border: isToday ? '1px solid #0d9488' : '1px solid #e2e8f0',
                    boxShadow: isToday ? '0 4px 6px -1px rgba(13, 148, 136, 0.1)' : 'none'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: isToday ? '#0d9488' : '#1e3a5f', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{new Date(day.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', weekday: 'short' })}</span>
                      {isToday && <span style={{ fontSize: '10px', background: '#0d9488', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>TODAY</span>}
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={day.cards || ''}
                      disabled={day.status !== 'Present'}
                      onChange={(e) => {
                        const newData = [...dailyCardsData];
                        newData[originalIdx].cards = parseInt(e.target.value) || 0;
                        setDailyCardsData(newData);
                      }}
                      style={{
                        width: '100%', padding: '8px', borderRadius: '8px',
                        border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 700,
                        textAlign: 'center', outline: 'none',
                        background: (day.status !== 'Present' || (showHistory && !isToday)) ? '#f1f5f9' : '#fff',
                        color: (day.status !== 'Present' || (showHistory && !isToday)) ? '#94a3b8' : '#1e3a5f'
                      }}
                    />
                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                      <div style={{
                        width: '100%', 
                        fontSize: '10px', 
                        padding: '6px', 
                        borderRadius: '6px',
                        textAlign: 'center',
                        background: day.status === 'Present' ? '#dcfce7' : 
                                   day.status === 'Leave' ? '#fef3c7' : '#fee2e2',
                        fontWeight: 700, 
                        color: day.status === 'Present' ? '#166534' : 
                               day.status === 'Leave' ? '#92400e' : '#991b1b',
                        border: '1px solid rgba(0,0,0,0.05)',
                        opacity: 0.9,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                      }}>
                        {day.status}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Monthly History Summary Section */}
            {showHistory && monthlyHistory.length > 0 && (
              <div style={{ marginTop: '24px', padding: '16px', background: '#f0fdfa', borderRadius: '12px', border: '1px solid #ccfbf1' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} /> Monthly Production Summary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                  {monthlyHistory.map(([month, total]) => (
                    <div 
                      key={month} 
                      onClick={() => setModalMonth(month)}
                      className="monthly-history-item"
                      style={{ 
                        background: modalMonth === month ? '#f0fdfa' : '#fff', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        border: modalMonth === month ? '2px solid #0d9488' : '1px solid #e2e8f0', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: modalMonth === month ? '0 2px 4px rgba(13,148,136,0.1)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 600, color: modalMonth === month ? '#0d9488' : '#475569' }}>
                        {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0d9488' }}>{total} <span style={{ fontSize: '10px', fontWeight: 400 }}>Cards</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button onClick={() => setShowCardsModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveDailyCards} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#0d9488', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Save Production Data</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjustments Modal */}
      {showAdjModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '95%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Deductions & Adjustments</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>{selectedEmpForAdj?.employeeName}</p>
              </div>
              <button onClick={() => setShowAdjModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Advance Deduction (Rs.)</label>
                <input
                  type="number"
                  value={adjData.advance}
                  onChange={(e) => setAdjData({ ...adjData, advance: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>EPF (Rs.)</label>
                  <input
                    type="number"
                    value={adjData.epf}
                    onChange={(e) => setAdjData({ ...adjData, epf: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>ETF (Rs.)</label>
                  <input
                    type="number"
                    value={adjData.etf}
                    onChange={(e) => setAdjData({ ...adjData, etf: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Other Deductions Saved</label>
                {adjData.existingDeductions.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px 0' }}>No other deductions saved.</p>
                ) : (
                  <div style={{ maxHeight: '100px', overflowY: 'auto', background: '#f8fafc', padding: '8px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                    {adjData.existingDeductions.map((item, idx) => (
                      <div key={`exist-ded-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px 0', borderBottom: idx < adjData.existingDeductions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <span>
                          {item.reason || 'Deduction'}: <strong>Rs. {parseFloat(item.amount || 0).toLocaleString()}</strong>
                          {item.date && <span style={{ color: '#94a3b8', fontSize: '10px', marginLeft: '6px' }}>({item.date})</span>}
                        </span>
                        <button 
                          onClick={() => {
                            const newList = adjData.existingDeductions.filter((_, i) => i !== idx);
                            setAdjData({ ...adjData, existingDeductions: newList });
                          }}
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px', marginTop: '8px' }}>Add New Deduction</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={adjData.newDeductionAmount}
                    onChange={(e) => setAdjData({ ...adjData, newDeductionAmount: e.target.value })}
                    style={{ width: '40%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    value={adjData.newDeductionReason}
                    onChange={(e) => setAdjData({ ...adjData, newDeductionReason: e.target.value })}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Other Allowances Saved</label>
                {adjData.existingAllowances.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 8px 0' }}>No other allowances saved.</p>
                ) : (
                  <div style={{ maxHeight: '100px', overflowY: 'auto', background: '#f8fafc', padding: '8px', borderRadius: '8px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
                    {adjData.existingAllowances.map((item, idx) => (
                      <div key={`exist-allw-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px 0', borderBottom: idx < adjData.existingAllowances.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <span>
                          {item.reason || 'Allowance'}: <strong>Rs. {parseFloat(item.amount || 0).toLocaleString()}</strong>
                          {item.date && <span style={{ color: '#94a3b8', fontSize: '10px', marginLeft: '6px' }}>({item.date})</span>}
                        </span>
                        <button 
                          onClick={() => {
                            const newList = adjData.existingAllowances.filter((_, i) => i !== idx);
                            setAdjData({ ...adjData, existingAllowances: newList });
                          }}
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >Remove</button>
                      </div>
                    ))}
                  </div>
                )}

                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '4px', marginTop: '8px' }}>Add New Allowance</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={adjData.newAllowanceAmount}
                    onChange={(e) => setAdjData({ ...adjData, newAllowanceAmount: e.target.value })}
                    style={{ width: '40%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    value={adjData.newAllowanceReason}
                    onChange={(e) => setAdjData({ ...adjData, newAllowanceReason: e.target.value })}
                    style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowAdjModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveAdjustments} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#0d9488', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Apply Adjustments</button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Mailing Modal */}
      {showBankModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '95%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#1e293b' }}>Mail Paysheet to Bank</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Send monthly breakdown to bank for processing</p>
              </div>
              <button onClick={() => setShowBankModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bank of Ceylon"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Recipient Email</label>
                <input
                  type="email"
                  placeholder="bank-officer@example.com"
                  value={bankDetails.recipientEmail}
                  onChange={(e) => setBankDetails({ ...bankDetails, recipientEmail: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Additional Notes</label>
                <textarea
                  placeholder="Any specific instructions for the bank..."
                  value={bankDetails.notes}
                  onChange={(e) => setBankDetails({ ...bankDetails, notes: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowBankModal(false)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #d1d5db', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={handleMailToBank}
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading ? '#94a3b8' : '#1e3a5f',
                  color: 'white',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {loading ? 'Sending...' : <><Send size={18} /> Send to Bank</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Breakdown Modal */}
      {showViewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '95%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>Salary Breakdown</h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>{selectedEmpForView?.employeeName} ({selectedEmpForView?.employeeRole})</p>
              </div>
              <button onClick={() => setShowViewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
              {/* Earnings Column */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0d9488', marginBottom: '16px', borderBottom: '2px solid #f0fdfa', paddingBottom: '8px' }}>EARNINGS</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>Basic / Fixed Salary</span>
                    <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.basicSalary || 0).toLocaleString()}</span>
                  </div>
                  {selectedEmpForView?.productionEarnings > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>Production Pay ({selectedEmpForView?.totalCards})</span>
                      <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.productionEarnings || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedEmpForView?.overtimeEarnings > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>OT Earnings</span>
                      <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.overtimeEarnings || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>Tea Allowance</span>
                    <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.teaAllowance || 0).toLocaleString()}</span>
                  </div>
                  {selectedEmpForView?.attendanceBonus > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>Attendance Bonus</span>
                      <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.attendanceBonus || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedEmpForView?.otherAllowances > 0 && (
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: '#64748b' }}>Other Allowances</span>
                        <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.otherAllowances || 0).toLocaleString()}</span>
                      </div>
                      {(() => {
                        try {
                          const list = JSON.parse(selectedEmpForView?.allowanceReason || '[]');
                          if (Array.isArray(list) && list.length > 0) {
                            return list.map((item, idx) => (
                              <div key={`vw-allw-${idx}`} style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontStyle: 'italic' }}>• {item.reason || 'Allowance'}: Rs. {parseFloat(item.amount || 0).toLocaleString()}</span>
                                {item.date && <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '10px' }}>{item.date}</span>}
                              </div>
                            ));
                          }
                        } catch (e) {}
                        return <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0 0 0' }}>Reason: {selectedEmpForView?.allowanceReason || 'No reason provided'}</p>;
                      })()}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: '#1e293b', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
                    <span>Gross Salary</span>
                    <span>Rs. {(selectedEmpForView?.grossSalary || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626', marginBottom: '16px', borderBottom: '2px solid #fef2f2', paddingBottom: '8px' }}>DEDUCTIONS</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>EPF Deduction</span>
                    <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.epfDeduction || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#64748b' }}>ETF Deduction</span>
                    <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.etfDeduction || 0).toLocaleString()}</span>
                  </div>
                  {selectedEmpForView?.advanceDeduction > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                      <span style={{ color: '#64748b' }}>Advance Recovery</span>
                      <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.advanceDeduction || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedEmpForView?.otherDeductions > 0 && (
                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: '#64748b' }}>Other Deductions</span>
                        <span style={{ fontWeight: 600 }}>Rs. {(selectedEmpForView?.otherDeductions || 0).toLocaleString()}</span>
                      </div>
                      {(() => {
                        try {
                          const list = JSON.parse(selectedEmpForView?.deductionReason || '[]');
                          if (Array.isArray(list) && list.length > 0) {
                            return list.map((item, idx) => (
                              <div key={`vw-ded-${idx}`} style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ fontStyle: 'italic' }}>• {item.reason || 'Deduction'}: Rs. {parseFloat(item.amount || 0).toLocaleString()}</span>
                                {item.date && <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '10px' }}>{item.date}</span>}
                              </div>
                            ));
                          }
                        } catch (e) {}
                        return <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', margin: '4px 0 0 0' }}>Reason: {selectedEmpForView?.deductionReason || 'No reason provided'}</p>;
                      })()}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 800, color: '#1e293b', borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '4px' }}>
                    <span>Total Deductions</span>
                    <span>Rs. {(selectedEmpForView?.totalDeductions || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '18px' }}>Net Payable Amount</span>
              <span style={{ fontWeight: 900, color: '#0d9488', fontSize: '24px' }}>Rs. {(selectedEmpForView?.netSalary || 0).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowViewModal(false)} style={{ padding: '12px 32px', borderRadius: '12px', border: 'none', background: '#1e3a5f', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Close Breakdown</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
