import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Filter, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Briefcase,
  Layers,
  ChevronRight,
  Activity,
  AlertCircle
} from 'react-feather';
import SummaryCard from '../../component/Finance/SummaryCard';
import TransactionTable from '../../component/Finance/TransactionTable';
import {
  filterTransactionsByTab,
  getPaymentManagementData,
  getPaymentManagementError
} from '../../services/finance/paymentService';

const DEFAULT_SUMMARY_DATA = {
  received: { amount: 0, count: 0, percentage: 0 },
  paid: { amount: 0, count: 0, percentage: 0 },
  net: { amount: 0, percentage: 0 }
};

const COLORS = ['#0d9488', '#ea580c', '#3b82f6', '#8b5cf6', '#ec4899'];

const PaymentManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [summaryData, setSummaryData] = useState(DEFAULT_SUMMARY_DATA);
  const [cashFlow, setCashFlow] = useState([]);
  const [distribution, setDistribution] = useState({ income: [], expense: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPaymentManagementData(500);
      setSummaryData(data.summaryData);
      setCashFlow(data.cashFlow);
      setDistribution(data.distribution);
      setTransactions(data.transactions);
    } catch (err) {
      setError(getPaymentManagementError(err));
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return filterTransactionsByTab(transactions, activeTab);
  }, [transactions, activeTab]);

  const cardStyle = {
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    padding: '24px'
  };

  const renderOverview = () => (
    <div className="d-flex flex-column gap-4 animate-fadeIn">
      {/* Summary Cards */}
      <div className="row g-4">
        <div className="col-md-4">
          <SummaryCard
            title="Total Received"
            amount={summaryData.received.amount}
            count="Income & Credits"
            percentage={summaryData.received.percentage}
            icon={<ArrowDownCircle color="#059669" />}
            bgColor="#ecfdf5"
          />
        </div>
        <div className="col-md-4">
          <SummaryCard
            title="Total Paid Out"
            amount={summaryData.paid.amount}
            count="Expenses & Payables"
            percentage={summaryData.paid.percentage}
            icon={<ArrowUpCircle color="#dc2626" />}
            bgColor="#fef2f2"
          />
        </div>
        <div className="col-md-4">
          <SummaryCard
            title="Net Cash Flow"
            amount={summaryData.net.amount}
            count="Net Performance"
            percentage={summaryData.net.percentage}
            icon={<TrendingUp color="#3b82f6" />}
            bgColor="#eff6ff"
            isNet={true}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4">
        {/* Cash Flow Chart */}
        <div className="col-lg-8">
          <div style={cardStyle}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
                <Activity size={18} color="#0d9488" />
                Cash Flow Trend (Last 6 Months)
              </h6>
              <div className="d-flex gap-2">
                <span className="badge" style={{ backgroundColor: '#ecfdf5', color: '#059669', fontSize: '10px' }}>INCOME</span>
                <span className="badge" style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '10px' }}>EXPENSE</span>
              </div>
            </div>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }} />
                  <Bar dataKey="income" name="Income" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expense" name="Expense" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="col-lg-4">
          <div style={cardStyle}>
            <h6 className="fw-bold mb-4 d-flex align-items-center gap-2" style={{ color: '#1e293b' }}>
              <Layers size={18} color="#ea580c" />
              Expense Distribution
            </h6>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution.expense.length > 0 ? distribution.expense : [{name: 'No Data', value: 1}]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distribution.expense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {distribution.expense.length === 0 && <Cell fill="#f1f5f9" />}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <TransactionTable 
        transactions={transactions.slice(0, 10)} 
        title="Recent Transactions"
        subtitle="Last 10 financial movements across all accounts"
      />
    </div>
  );

  return (
    <div style={{ width: '100%', minHeight: '100%', backgroundColor: '#f8fafc', padding: '24px' }}>
      <div className="container-fluid p-0">
        
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.02em', fontWeight: 900 }}>Finance Overview</h3>
            <p className="text-muted small mb-0">Real-time health of your business finances and payment tracking</p>
          </div>
          <div className="d-flex gap-2">
            <button 
              onClick={() => navigate('/finance/receive-payment')}
              className="btn d-flex align-items-center gap-2 px-4 shadow-sm fw-bold"
              style={{ backgroundColor: '#0d9488', color: '#fff', borderRadius: '12px', height: '42px', fontSize: '14px', border: 'none', transition: 'all 0.2s' }}>
              <PlusCircle size={16} /> Receive Payment
            </button>
            <button 
              onClick={() => navigate('/finance/make-payment')}
              className="btn d-flex align-items-center gap-2 px-4 shadow-sm fw-bold"
              style={{ backgroundColor: '#ea580c', color: '#fff', borderRadius: '12px', height: '42px', fontSize: '14px', border: 'none', transition: 'all 0.2s' }}>
              <DollarSign size={16} /> Make Payment
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="d-flex p-1 bg-white mb-4 shadow-sm border" style={{ borderRadius: '14px', width: 'fit-content' }}>
          {[
            { id: 'overview', label: 'Overview', icon: <Briefcase size={14} /> },
            { id: 'received', label: 'Payments In', icon: <ArrowDownCircle size={14} /> },
            { id: 'paid', label: 'Payments Out', icon: <ArrowUpCircle size={14} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm px-4 py-2 d-flex align-items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-dark text-white fw-bold shadow-sm' : 'text-muted border-0'}`}
              style={{ borderRadius: '10px', fontSize: '13px', border: 'none' }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" style={{ borderRadius: '12px', fontSize: '14px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 bg-white border shadow-sm" style={{ borderRadius: '24px' }}>
            <div className="spinner-border text-primary mb-3" style={{ width: '2rem', height: '2rem' }}></div>
            <p className="text-muted fw-bold">Synchronizing Financial Intelligence...</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {activeTab === 'overview' ? renderOverview() : (
              <div className="animate-fadeIn">
                 <TransactionTable 
                    transactions={filteredTransactions} 
                    title={activeTab === 'received' ? "Payments Received" : "Payments Disbursed"}
                    subtitle={`Full history of ${activeTab} transactions`}
                 />
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .btn:active {
          transform: scale(0.96);
        }
      `}</style>
    </div>
  );
};

export default PaymentManagementPage;
