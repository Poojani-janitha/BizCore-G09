import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../../component/Finance/SummaryCard';
import ActionButton from '../../component/Finance/ActionButton';
import TransactionTable from '../../component/Finance/TransactionTable';

const PaymentManagementPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - replace with API calls
  const recentActivity = [
    {
      id: 1,
      type: 'in',
      date: '03/05/24',
      party: 'ABC Trading',
      description: 'Payment received',
      amount: 5000,
      method: 'Bank Transfer'
    },
    {
      id: 2,
      type: 'out',
      date: '03/04/24',
      party: 'Lanka Supplies',
      description: 'Raw materials',
      amount: -43000,
      method: 'Bank Transfer'
    },
    {
      id: 3,
      type: 'in',
      date: '03/04/24',
      party: 'XYZ Traders',
      description: 'Payment received',
      amount: 15000,
      method: 'Cash'
    },
    {
      id: 4,
      type: 'out',
      date: '03/03/24',
      party: 'ABC Suppliers',
      description: 'Office supplies',
      amount: -25000,
      method: 'Cheque #12345'
    },
    {
      id: 5,
      type: 'in',
      date: '03/03/24',
      party: 'Global Mart',
      description: 'Payment received',
      amount: 12500,
      method: 'Bank Transfer'
    },
  ];

  const summaryData = {
    received: {
      amount: 653000,
      count: 45,
      percentage: 15,
      icon: '⬇️',
      bgColor: '#F0FDF4',
      borderColor: '#dcfce7',
      textColor: '#00A63E'
    },
    paid: {
      amount: 543000,
      count: 23,
      percentage: -5,
      icon: '⬆️',
      bgColor: '#FEF2F2',
      borderColor: '#ffe2e2',
      textColor: '#E7000B'
    },
    netCash: {
      amount: 110000,
      percentage: 25,
      icon: '$',
      bgColor: '#F0FDFA',
      borderColor: '#ccf7f5',
      textColor: '#009689'
    }
  };

  return (
    <div className="w-full h-[1101px] relative bg-white leading-normal tracking-normal text-left text-xl text-white font-Inter overflow-auto">
      <main className="absolute top-0 left-0 bg-[#f5f7f9] w-full flex items-start justify-end h-full">
        <section className="h-full w-full flex flex-col items-start pt-0 pb-6 pl-5 pr-0 gap-6">
          
          {/* Page Header */}
          <div className="flex items-start pt-0 pb-0 pl-6 pr-6 max-w-full w-full">
            <div className="h-auto flex flex-col items-start gap-6 max-w-full w-full">
              
              {/* Title Section */}
              <div className="w-full flex flex-col items-start gap-1 shrink-0">
                <h1 className="text-[32px] leading-9 font-semibold text-[#101828]">
                  Payment Management
                </h1>
                <div className="text-base text-[#4a5565] leading-6">
                  Track and manage all incoming and outgoing payments
                </div>
              </div>

              {/* Tabs */}
              <div className="h-[53.6px] shadow-[0px_1px_3px_rgba(0,_0,_0,_0.1),_0px_1px_2px_-1px_rgba(0,_0,_0,_0.1)] rounded-[14px] bg-white border-[#e5e7eb] border-solid border-[0.8px] flex items-start pt-[3px] pb-[3px] pl-1 pr-1 shrink-0 text-center text-base w-fit">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`shadow-[0px_1px_3px_rgba(0,_0,_0,_0.1),_0px_1px_2px_-1px_rgba(0,_0,_0,_0.1)] rounded-[10px] flex items-start pt-[7.8px] pb-[12.2px] pl-[22px] pr-[21px] cursor-pointer transition-all ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-[#009689] to-[#00786f] text-white'
                      : 'bg-white text-[#4a5565] hover:text-[#101828]'
                  }`}
                >
                  <div className="h-6 w-auto leading-6 font-medium">
                    Overview
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('received')}
                  className={`rounded-[10px] flex items-start pt-[7.8px] pb-[12.2px] pl-[21px] pr-5 cursor-pointer transition-all ${
                    activeTab === 'received'
                      ? 'bg-gradient-to-r from-[#009689] to-[#00786f] text-white'
                      : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                >
                  <div className="h-6 leading-6 font-medium">
                    Received
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('paid')}
                  className={`rounded-[10px] flex items-start pt-[7.8px] pb-[12.2px] pl-[22px] pr-[22px] cursor-pointer transition-all ${
                    activeTab === 'paid'
                      ? 'bg-gradient-to-r from-[#009689] to-[#00786f] text-white'
                      : 'text-[#4a5565] hover:text-[#101828]'
                  }`}
                >
                  <div className="h-6 leading-6 font-medium">
                    Paid Out
                  </div>
                </button>
              </div>

              {/* Summary Cards */}
              <section className="flex items-start gap-6 max-w-full shrink-0 w-full flex-wrap">
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
              <div className="flex items-start gap-4 max-w-full shrink-0 w-full flex-wrap">
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
              <TransactionTable transactions={recentActivity} />

            </div>
          </div>

        </section>
      </main>
    </div>
  );
};

export default PaymentManagementPage;
