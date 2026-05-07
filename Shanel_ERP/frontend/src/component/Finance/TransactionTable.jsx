import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Calendar, User, FileText, CreditCard } from 'react-feather';

const TransactionTable = ({ transactions = [], title = "Recent Activity", subtitle = "Last 10 transactions" }) => {
  
  const fmt = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getTransactionBadge = (type) => {
    const isIncome = type === 'IN' || type === 'Income' || type === 'Received';
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '20px',
        backgroundColor: isIncome ? '#ecfdf5' : '#fef2f2',
        color: isIncome ? '#059669' : '#dc2626',
        fontSize: '11px',
        fontWeight: 700
      }}>
        {isIncome ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
        {isIncome ? 'RECEIVED' : 'PAID OUT'}
      </div>
    );
  };

  const renderAmount = (tr) => {
    // If amount is already a string with "Rs.", use it directly
    if (typeof tr.amount === 'string' && tr.amount.includes('Rs.')) {
      return tr.amount;
    }
    
    // Fallback to formatting raw numbers
    const val = tr.amount || tr.Amount || 0;
    const isIncome = tr.type === 'IN' || tr.type === 'Income' || tr.type === 'Received';
    return `${isIncome ? '+ ' : '- '}Rs. ${fmt(val)}`;
  };

  const cardStyle = {
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    overflow: 'hidden'
  };

  const tableHeaderStyle = {
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '16px 24px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  };

  const cellStyle = {
    padding: '16px 24px',
    fontSize: '14px',
    color: '#334155',
    verticalAlign: 'middle',
    borderBottom: '1px solid #f1f5f9'
  };

  return (
    <div style={cardStyle} className="animate-fadeIn">
      {/* Header */}
      <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
        <div>
          <h5 className="mb-0 fw-bold" style={{ color: '#1e293b' }}>{title}</h5>
          <p className="mb-0 text-muted small">{subtitle}</p>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Flow</th>
              <th style={tableHeaderStyle}>Date</th>
              <th style={tableHeaderStyle}>Entity / Description</th>
              <th style={tableHeaderStyle}>Method</th>
              <th style={tableHeaderStyle} className="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted small">
                  No transactions found in this period
                </td>
              </tr>
            ) : (
              transactions.map((tr, idx) => (
                <tr key={idx} style={{ transition: 'background-color 0.2s' }}>
                  <td style={cellStyle}>{getTransactionBadge(tr.type)}</td>
                  <td style={cellStyle}>
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={14} color="#94a3b8" />
                      {tr.date}
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div className="d-flex flex-column">
                      <span className="fw-bold text-dark d-flex align-items-center gap-2">
                        <User size={14} color="#0d9488" />
                        {tr.party || tr.Source || tr.Paid_To}
                      </span>
                      <small className="text-muted d-flex align-items-center gap-2">
                        <FileText size={12} />
                        {tr.description || tr.Notes}
                      </small>
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <div className="d-flex align-items-center gap-2">
                      <FileText size={14} color="#94a3b8" />
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase'
                      }}>
                        {tr.method || tr.Payment_Method}
                      </span>
                    </div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>
                    <span style={{ 
                      fontWeight: 800, 
                      color: (tr.type === 'IN' || tr.type === 'Income' || tr.type === 'Received') ? '#059669' : '#dc2626' 
                    }}>
                      {renderAmount(tr)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default TransactionTable;
