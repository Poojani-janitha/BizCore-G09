import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  netCash: { amount: 0, percentage: 0 }
};

const PaymentManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [summaryData, setSummaryData] = useState(DEFAULT_SUMMARY_DATA);
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

  return (
    <div className="w-full min-h-screen bg-[#f5f7f9] px-4 md:px-6 py-6">
      <main className="w-full max-w-[1280px] mx-auto">
        <section className="w-full flex flex-col gap-6">
          <div className="w-full flex flex-col gap-6">

              {/* Title Section */}
              <div className="w-full flex flex-col items-start gap-1">
                <h1 className="text-3xl md:text-[32px] leading-9 font-semibold text-[#101828]">
                  Payment Management
                </h1>
                <div className="text-base text-[#4a5565] leading-6">
                  Track and manage all incoming and outgoing payments
                </div>
              </div>

              {/* Tabs */}
              <div className="shadow-[0px_1px_3px_rgba(0,_0,_0,_0.1),_0px_1px_2px_-1px_rgba(0,_0,_0,_0.1)] rounded-[14px] bg-white border-[#e5e7eb] border-solid border-[0.8px] flex items-center p-1 text-center text-sm md:text-base w-fit max-w-full overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`shadow-[0px_1px_3px_rgba(0,_0,_0,_0.1),_0px_1px_2px_-1px_rgba(0,_0,_0,_0.1)] rounded-[10px] flex items-center py-2 px-5 cursor-pointer transition-all whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-[#009689] to-[#00786f] text-white'
                      : 'bg-white text-[#4a5565] hover:text-[#101828]'
                  }`}
                >
                  <div className="leading-6 font-medium">
                    Overview
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('received')}
                  className={`rounded-[10px] flex items-center py-2 px-5 cursor-pointer transition-all whitespace-nowrap ${
                    activeTab === 'received'
                      ? 'bg-gradient-to-r from-[#009689] to-[#00786f] text-white'
                      : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                >
                  <div className="leading-6 font-medium">
                    Received
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('paid')}
                  className={`rounded-[10px] flex items-center py-2 px-5 cursor-pointer transition-all whitespace-nowrap ${
                    activeTab === 'paid'
                      ? 'bg-gradient-to-r from-[#009689] to-[#00786f] text-white'
                      : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                >
                  <div className="leading-6 font-medium">
                    Paid Out
                  </div>
                </button>
              </div>

              {error && (
                <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Summary Cards */}
              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 w-full">
                <SummaryCard
                  title="RECEIVED (From Customers)"
                  amount={summaryData.received.amount}
                  count={`${summaryData.received.count} receipts this month`}
                  percentage={summaryData.received.percentage}
                  icon="📥"
                  bgColor="#F0FDF4"
                  textColor="#00a63e"
                />
                <SummaryCard
                  title="PAID OUT (To Suppliers)"
                  amount={summaryData.paid.amount}
                  count={`${summaryData.paid.count} payments this month`}
                  percentage={summaryData.paid.percentage}
                  icon="📤"
                  bgColor="#FEF2F2"
                  textColor="#e7000b"
                />
                <SummaryCard
                  title="NET CASH FLOW"
                  amount={summaryData.netCash.amount}
                  count="Difference (IN - OUT)"
                  percentage={summaryData.netCash.percentage}
                  icon="$"
                  bgColor="#F0FDFA"
                  textColor="#009689"
                />
              </section>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <ActionButton
                  title="RECEIVE PAYMENT"
                  subtitle="From customers"
                  icon="📥"
                  onClick={() => navigate('/finance/receive-payment')}
                  gradient="linear-gradient(135deg, #00c950, #00a63e)"
                />
                <ActionButton
                  title="MAKE PAYMENT"
                  subtitle="To suppliers"
                  icon="📤"
                  onClick={() => navigate('/finance/make-payment')}
                  gradient="linear-gradient(135deg, #fb2c36, #e7000b)"
                />
              </div>

              {/* Recent Activity Table */}
              {loading ? (
                <div className="w-full rounded-lg border border-[#F3F4F6] bg-white shadow-sm p-8 text-center text-[#4A5565] text-sm">
                  Loading finance data...
                </div>
              ) : (
                <TransactionTable transactions={filteredTransactions.slice(0, 10)} />
              )}

          </div>
        </section>
      </main>
    </div>
  );
};

export default PaymentManagementPage;
