import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import SummaryCard from '../../component/Finance/SummaryCard';
import ActionButton from '../../component/Finance/ActionButton';
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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

    fetchFinanceData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return filterTransactionsByTab(transactions, activeTab);
  }, [transactions, activeTab]);

  const renderOverview = () => (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 w-full">
        <SummaryCard
          title="TOTAL RECEIVED"
          amount={summaryData.received.amount}
          count="Payments from customers"
          percentage={summaryData.received.percentage}
          icon="📥"
          bgColor="#F0FDF4"
          textColor="#00a63e"
        />
        <SummaryCard
          title="TOTAL PAID OUT"
          amount={summaryData.paid.amount}
          count="Payments to suppliers"
          percentage={summaryData.paid.percentage}
          icon="📤"
          bgColor="#FEF2F2"
          textColor="#e7000b"
        />
        <SummaryCard
          title="NET CASH FLOW"
          amount={summaryData.net.amount}
          count="Current month balance"
          percentage={summaryData.net.percentage}
          icon="💰"
          bgColor="#F0FDFA"
          textColor="#009689"
        />
      </section>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-teal-950 mb-6">Cash Flow Trend (Last 6 Months)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f8fafc'}}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="#00a63e" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="expense" name="Expense" fill="#e7000b" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-teal-950 mb-6">Expense Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution.expense.length > 0 ? distribution.expense : [{name: 'No Data', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distribution.expense.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  {distribution.expense.length === 0 && <Cell fill="#f1f5f9" />}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <TransactionTable transactions={transactions.slice(0, 5)} />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] px-4 md:px-6 py-8">
      <main className="w-full max-w-[1400px] mx-auto">
        <section className="w-full flex flex-col gap-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-black text-teal-950 tracking-tight">Finance Overview</h1>
              <p className="text-gray-500 font-medium text-sm">Real-time financial performance and payment tracking</p>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={() => navigate('/finance/receive-payment')}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all active:scale-95"
               >
                 Receive Payment
               </button>
               <button 
                onClick={() => navigate('/finance/make-payment')}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95"
               >
                 Make Payment
               </button>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-white p-1 rounded-2xl border border-gray-200 w-fit shadow-sm">
            {['overview', 'received', 'paid'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all uppercase tracking-wider ${
                  activeTab === tab 
                    ? 'bg-teal-950 text-white shadow-md' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          {/* Content Area */}
          {loading ? (
            <div className="w-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-teal-950/20 border-t-teal-950 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-bold animate-pulse">Synchronizing Finance Data...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {activeTab === 'overview' ? renderOverview() : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                   <TransactionTable transactions={filteredTransactions} />
                </div>
              )}
            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default PaymentManagementPage;
