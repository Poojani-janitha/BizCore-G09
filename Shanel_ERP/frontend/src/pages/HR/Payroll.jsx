import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, Send, Download, CheckCircle, AlertCircle, Edit2, Save, X } from 'lucide-react';
import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';

const PAYROLL_KEY = 'shanel_payroll_v1';

// Salary configuration based on role
const getSalaryConfig = (role) => {
  const configs = {
    Manager: {
      salaryType: 'Monthly Fixed',
      basicSalary: 75000,
      productionEarnings: 0,
      overtimeRate: 400,
      attendanceBonus: 1500,
      teaAllowance: 0,
      epfEligible: true,
      etfEligible: true,
    },
    Staff: {
      salaryType: 'Production Based',
      basicSalary: 0,
      productionEarnings: 45000,
      overtimeRate: 400,
      attendanceBonus: 1500,
      teaAllowance: 1560,
      epfEligible: true,
      etfEligible: true,
    },
  };
  return configs[role] || configs.Staff;
};

// Calculate salary components
const calculateSalary = (config, overtimeHours = 0, advanceDeduction = 0) => {
  const basicSalary = config.basicSalary;
  const productionEarnings = config.productionEarnings;
  const overtimeEarnings = overtimeHours * config.overtimeRate;
  const attendanceBonus = config.attendanceBonus;
  const teaAllowance = config.teaAllowance;

  const grossSalary = basicSalary + productionEarnings + overtimeEarnings + attendanceBonus + teaAllowance;

  const epfEmployee = config.epfEligible ? Math.round(grossSalary * 0.08) : 0; // 8% employee contribution
  const etfEmployee = config.etfEligible ? Math.round(grossSalary * 0.03) : 0; // 3% employee contribution
  const totalDeductions = epfEmployee + etfEmployee + advanceDeduction;
  const netSalary = grossSalary - totalDeductions;

  return {
    basicSalary,
    productionEarnings,
    overtimeEarnings,
    attendanceBonus,
    teaAllowance,
    grossSalary,
    epfEmployee,
    etfEmployee,
    advanceDeduction,
    totalDeductions,
    netSalary,
  };
};

// Generate initial payroll data for employees
const generatePayrollData = (employees) => {
  return employees.map((emp) => {
    const config = getSalaryConfig(emp.role);
    const salary = calculateSalary(config);

    return {
      id: emp.id,
      employeeCode: `EMP-${String(emp.id).padStart(3, '0')}`,
      employeeName: emp.name,
      employeeRole: emp.role,
      salaryType: config.salaryType,
      ...salary,
      overtimeHours: 0,
      status: 'Pending',
    };
  });
};

export default function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2026-02');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    recipientEmail: '',
    notes: '',
  });

  // Initialize payroll data from employees
  useEffect(() => {
    const storedPayroll = localStorage.getItem(PAYROLL_KEY);
    if (storedPayroll) {
      try {
        setPayrollRecords(JSON.parse(storedPayroll));
      } catch {
        initializePayroll();
      }
    } else {
      initializePayroll();
    }
  }, []);

  const initializePayroll = () => {
    const storedEmployees = localStorage.getItem(EMP_KEY);
    let employees = [];

    if (storedEmployees) {
      try {
        employees = JSON.parse(storedEmployees);
      } catch {
        employees = generateEmployees();
      }
    } else {
      employees = generateEmployees();
      localStorage.setItem(EMP_KEY, JSON.stringify(employees));
    }

    const payroll = generatePayrollData(employees);
    setPayrollRecords(payroll);
    localStorage.setItem(PAYROLL_KEY, JSON.stringify(payroll));
  };

  const updatePayrollField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setEditForm({ ...record });
  };

  const saveEdit = () => {
    if (!editingId) return;

    const config = getSalaryConfig(editForm.employeeRole);
    const salary = calculateSalary(config, editForm.overtimeHours, editForm.advanceDeduction);

    const updated = payrollRecords.map((record) =>
      record.id === editingId
        ? {
            ...record,
            overtimeHours: editForm.overtimeHours,
            advanceDeduction: editForm.advanceDeduction,
            ...salary,
          }
        : record
    );

    setPayrollRecords(updated);
    localStorage.setItem(PAYROLL_KEY, JSON.stringify(updated));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const approveRecord = (id) => {
    const updated = payrollRecords.map((record) =>
      record.id === id ? { ...record, status: 'Approved' } : record
    );
    setPayrollRecords(updated);
    localStorage.setItem(PAYROLL_KEY, JSON.stringify(updated));
  };

  const approveAll = () => {
    const updated = payrollRecords.map((record) => ({ ...record, status: 'Approved' }));
    setPayrollRecords(updated);
    localStorage.setItem(PAYROLL_KEY, JSON.stringify(updated));
  };

  const filteredRecords = payrollRecords.filter((record) =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalGross = filteredRecords.reduce((sum, r) => sum + r.grossSalary, 0);
  const totalNet = filteredRecords.reduce((sum, r) => sum + r.netSalary, 0);
  const totalEPF = filteredRecords.reduce((sum, r) => sum + r.epfEmployee, 0);
  const totalETF = filteredRecords.reduce((sum, r) => sum + r.etfEmployee, 0);
  const pendingCount = filteredRecords.filter((r) => r.status === 'Pending').length;
  const approvedCount = filteredRecords.filter((r) => r.status === 'Approved').length;

  // Generate PDF-friendly HTML content
  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Monthly Payroll Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            h1 { text-align: center; color: #1e3a5f; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
            .details { margin: 15px 0; font-size: 12px; }
            .details p { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f0f0f0; padding: 10px; text-align: left; border: 1px solid #ddd; font-weight: bold; }
            td { padding: 8px; border: 1px solid #ddd; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            .amount { text-align: right; }
            .footer { margin-top: 30px; font-size: 11px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SHANEL ERP - Monthly Payroll Report</h1>
            <p>Payroll Period: ${selectedMonth}</p>
            <p>Generated: ${currentDate}</p>
          </div>

          <div class="details">
            <p><strong>Total Employees:</strong> ${filteredRecords.length}</p>
            <p><strong>Total Gross Salary:</strong> Rs. ${totalGross.toLocaleString()}</p>
            <p><strong>Total Net Salary:</strong> Rs. ${totalNet.toLocaleString()}</p>
            <p><strong>Total EPF Contribution:</strong> Rs. ${totalEPF.toLocaleString()}</p>
            <p><strong>Total ETF Contribution:</strong> Rs. ${totalETF.toLocaleString()}</p>
            <p><strong>Approved Records:</strong> ${approvedCount} | <strong>Pending Records:</strong> ${pendingCount}</p>
            ${bankDetails.bankName ? `<p><strong>Bank Name:</strong> ${bankDetails.bankName}</p>` : ''}
            ${bankDetails.accountNumber ? `<p><strong>Account Number:</strong> ${bankDetails.accountNumber}</p>` : ''}
            ${bankDetails.notes ? `<p><strong>Notes:</strong> ${bankDetails.notes}</p>` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Role</th>
                <th class="amount">Gross Salary</th>
                <th class="amount">Deductions</th>
                <th class="amount">Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map((record) => `
                <tr>
                  <td>${record.employeeCode}</td>
                  <td>${record.employeeName}</td>
                  <td>${record.employeeRole}</td>
                  <td class="amount">Rs. ${record.grossSalary.toLocaleString()}</td>
                  <td class="amount">Rs. ${record.totalDeductions.toLocaleString()}</td>
                  <td class="amount">Rs. ${record.netSalary.toLocaleString()}</td>
                  <td>${record.status}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3">TOTAL</td>
                <td class="amount">Rs. ${totalGross.toLocaleString()}</td>
                <td class="amount">Rs. ${filteredRecords.reduce((sum, r) => sum + r.totalDeductions, 0).toLocaleString()}</td>
                <td class="amount">Rs. ${totalNet.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div class="footer">
            <p>This is an automated payroll report generated from SHANEL ERP System.</p>
            <p>For inquiries, contact HR Department.</p>
          </div>
        </body>
      </html>
    `;
  };

  // Download PDF (using print to PDF)
  const downloadPDF = () => {
    const content = generatePDFContent();
    const newWindow = window.open('', '_blank');
    newWindow.document.open();
    newWindow.document.write(content);
    newWindow.document.close();
    setTimeout(() => {
      newWindow.print();
    }, 250);
  };

  // Send to Bank
  const sendToBank = () => {
    if (!bankDetails.bankName || !bankDetails.accountNumber) {
      alert('Please fill in bank name and account number');
      return;
    }

    const content = generatePDFContent();
    const newWindow = window.open('', '_blank');
    newWindow.document.open();
    newWindow.document.write(content);
    newWindow.document.close();

    // Create a record of the bank submission
    const submission = {
      submittedAt: new Date().toISOString(),
      period: selectedMonth,
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      totalAmount: totalNet,
      recordCount: filteredRecords.length,
    };

    // Store submission history
    const submissions = JSON.parse(localStorage.getItem('payroll_submissions') || '[]');
    submissions.push(submission);
    localStorage.setItem('payroll_submissions', JSON.stringify(submissions));

    alert(`Payroll submitted to ${bankDetails.bankName}\n\nAccount: ${bankDetails.accountNumber}\nTotal Amount: Rs. ${totalNet.toLocaleString()}\n\nReceipt: ${submission.submittedAt}`);

    // Email simulation (in real app, this would call backend)
    if (bankDetails.recipientEmail) {
      console.log(`Email would be sent to: ${bankDetails.recipientEmail}`);
    }

    setShowBankModal(false);
    setBankDetails({ bankName: '', accountNumber: '', recipientEmail: '', notes: '' });
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Employee Code', 'Employee Name', 'Role', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'];
    const rows = filteredRecords.map((r) => [
      r.employeeCode,
      r.employeeName,
      r.employeeRole,
      r.grossSalary,
      r.totalDeductions,
      r.netSalary,
      r.status,
    ]);

    const csvContent = [
      ['SHANEL ERP - Payroll Report'],
      [`Payroll Period: ${selectedMonth}`],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [],
      headers,
      ...rows,
      [],
      ['TOTAL', '', '', totalGross, filteredRecords.reduce((sum, r) => sum + r.totalDeductions, 0), totalNet, ''],
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `payroll-${selectedMonth}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '28px 32px', fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Payroll Management
          </span>
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>Calculate and process employee salaries</p>
      </div>

      <div style={{ marginBottom: '22px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search by employee name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            outline: 'none',
            minWidth: '220px',
          }}
        />

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '13px',
            outline: 'none',
          }}
        />

        <button
          onClick={approveAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <CheckCircle size={16} />
          Approve All
        </button>

        <button
          onClick={() => initializePayroll()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Calculator size={16} />
          Recalculate
        </button>

        <button
          onClick={downloadPDF}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Download size={16} />
          Download PDF
        </button>

        <button
          onClick={() => setShowBankModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#ec4899',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Send size={16} />
          Send to Bank
        </button>

        <button
          onClick={exportToCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#14b8a6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '22px',
        }}
      >
        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '2px solid #bfdbfe', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total Employees</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>{filteredRecords.length}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '2px solid #dcfce7', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total Gross</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#059669' }}>{`Rs. ${totalGross.toLocaleString()}`}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '2px solid #e9d5ff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total Net</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#a855f7' }}>{`Rs. ${totalNet.toLocaleString()}`}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '2px solid #fed7aa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total EPF</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#ea580c' }}>{`Rs. ${totalEPF.toLocaleString()}`}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '2px solid #fecaca', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total ETF</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 700, color: '#dc2626' }}>{`Rs. ${totalETF.toLocaleString()}`}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '16px', border: '2px solid #fef08a', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Status</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#1f2937' }}>
            <span style={{ color: '#059669', fontWeight: 600 }}>{approvedCount}</span> Approved,{' '}
            <span style={{ color: '#ca8a04', fontWeight: 600 }}>{pendingCount}</span> Pending
          </p>
        </div>
      </div>

      {/* Payroll Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '22px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Employee</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Type</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Gross</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Deductions</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Net Salary</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>Action</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #f3f4f6' }}>
              {filteredRecords.map((record) => (
                <tr key={record.id} style={{ borderBottom: '1px solid #f3f4f6', hover: { backgroundColor: '#f9fafb' } }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '13px' }}>{record.employeeName}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>{record.employeeCode}</p>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563' }}>{record.employeeRole}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563' }}>{record.salaryType}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#059669', fontSize: '13px' }}>
                    {`Rs. ${record.grossSalary.toLocaleString()}`}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626', fontSize: '13px' }}>
                    {`Rs. ${record.totalDeductions.toLocaleString()}`}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#2563eb', fontSize: '13px' }}>
                    {`Rs. ${record.netSalary.toLocaleString()}`}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {record.status === 'Approved' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 600, backgroundColor: '#dcfce7', color: '#166534' }}>
                        <CheckCircle size={12} />
                        Approved
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '16px', fontSize: '11px', fontWeight: 600, backgroundColor: '#fef3c7', color: '#92400e' }}>
                        <AlertCircle size={12} />
                        Pending
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => startEdit(record)}
                      style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '14px', paddingRight: '8px' }}
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    {record.status === 'Pending' && (
                      <button
                        onClick={() => approveRecord(record.id)}
                        style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#10b981', fontSize: '14px' }}
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ background: '#f9fafb', borderTop: '2px solid #d1d5db' }}>
              <tr>
                <td colSpan={3} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                  TOTAL:
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                  {`Rs. ${totalGross.toLocaleString()}`}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>
                  {`Rs. ${filteredRecords.reduce((sum, r) => sum + r.totalDeductions, 0).toLocaleString()}`}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                  {`Rs. ${totalNet.toLocaleString()}`}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={cancelEdit}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Edit Payroll Adjustment</h3>
              <button
                onClick={cancelEdit}
                style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '20px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#111827' }}>{editForm.employeeName}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{editForm.employeeCode}</p>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>Overtime Hours</label>
              <input
                type="number"
                value={editForm.overtimeHours || 0}
                onChange={(e) => updatePayrollField('overtimeHours', parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>Advance Deduction (Rs.)</label>
              <input
                type="number"
                value={editForm.advanceDeduction || 0}
                onChange={(e) => updatePayrollField('advanceDeduction', parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#111827' }}>Calculated Summary</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>Gross Salary: <span style={{ fontWeight: 600, color: '#059669' }}>Rs. {editForm.grossSalary?.toLocaleString() || 0}</span></p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>Deductions: <span style={{ fontWeight: 600, color: '#dc2626' }}>Rs. {editForm.totalDeductions?.toLocaleString() || 0}</span></p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>Net Salary: <span style={{ fontWeight: 600, color: '#2563eb' }}>Rs. {editForm.netSalary?.toLocaleString() || 0}</span></p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={saveEdit}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={cancelEdit}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Calculation Rules */}
      <div style={{ background: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)', borderRadius: '12px', padding: '16px', border: '1px solid #bfdbfe' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#1e3a5f' }}>Salary Calculation Rules</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', fontSize: '12px', color: '#374151' }}>
          <div>
            <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>Manager (Monthly Fixed)</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• Basic: Rs. 75,000</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• Attendance Bonus: Rs. 1,500</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• EPF/ETF: Eligible</p>
          </div>
          <div>
            <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>Staff (Production Based)</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• Production: Rs. 45,000</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• Tea Allowance: Rs. 1,560</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• EPF/ETF: Eligible</p>
          </div>
          <div>
            <p style={{ margin: '0 0 6px 0', fontWeight: 600 }}>Deductions</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• EPF (8% employee contribution)</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• ETF (3% employee contribution)</p>
            <p style={{ margin: '2px 0', color: '#6b7280' }}>• Advance deductions (as configured)</p>
          </div>
        </div>
      </div>

      {/* Bank Details Modal */}
      {showBankModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowBankModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Send Payroll to Bank</h3>
              <button
                onClick={() => setShowBankModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '20px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: '#111827' }}>Submission Summary</p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>Period: <span style={{ fontWeight: 600 }}>{selectedMonth}</span></p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>Total Employees: <span style={{ fontWeight: 600 }}>{filteredRecords.length}</span></p>
              <p style={{ margin: '4px 0', color: '#4b5563' }}>Total Amount: <span style={{ fontWeight: 600, color: '#059669' }}>Rs. {totalNet.toLocaleString()}</span></p>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>Bank Name *</label>
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                placeholder="e.g., Bank of Ceylon"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>Account Number *</label>
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                placeholder="e.g., 1234567890"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>Recipient Email</label>
              <input
                type="email"
                value={bankDetails.recipientEmail}
                onChange={(e) => setBankDetails({ ...bankDetails, recipientEmail: e.target.value })}
                placeholder="e.g., payroll@bank.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>Notes</label>
              <textarea
                value={bankDetails.notes}
                onChange={(e) => setBankDetails({ ...bankDetails, notes: e.target.value })}
                placeholder="Additional notes or instructions..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '60px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={sendToBank}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#ec4899',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Send size={16} />
                Submit to Bank
              </button>
              <button
                onClick={() => setShowBankModal(false)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
