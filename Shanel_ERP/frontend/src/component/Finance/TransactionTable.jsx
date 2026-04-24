import React from 'react';

const TransactionTable = ({ transactions }) => {
  const getTransactionBadge = (type) => {
    if (type === 'IN') {
      return (
        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#DCFCE7]">
          <span className="text-[#008236] text-xs font-semibold">⬇️ IN</span>
          <span className="text-[#008236] text-xs font-semibold">REC</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFE2E2]">
        <span className="text-[#C10007] text-xs font-semibold">⬆️ OUT</span>
        <span className="text-[#C10007] text-xs font-semibold">PAY</span>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-[#F3F4F6] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#E5E7EB] p-6">
        <h3 className="text-[#101828] text-lg font-semibold mb-1">Recent Activity</h3>
        <p className="text-[#4A5565] text-sm">Last 10 transactions</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#009689] to-[#00786F]">
              <th className="px-6 py-3 text-left text-white text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-white text-sm font-semibold">Date</th>
              <th className="px-6 py-3 text-left text-white text-sm font-semibold">Party</th>
              <th className="px-6 py-3 text-left text-white text-sm font-semibold">Description</th>
              <th className="px-6 py-3 text-left text-white text-sm font-semibold">Method</th>
              <th className="px-6 py-3 text-right text-white text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-left text-white text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => (
              <tr key={transaction.id} className={`${index < transactions.length - 1 ? 'border-b border-[#F3F4F6]' : ''} hover:bg-gray-50 transition-colors`}>
                <td className="px-6 py-4">{getTransactionBadge(transaction.type)}</td>
                <td className="px-6 py-4 text-[#101828] text-sm">{transaction.date}</td>
                <td className="px-6 py-4 text-[#101828] text-sm font-medium">{transaction.party}</td>
                <td className="px-6 py-4 text-[#4A5565] text-sm">{transaction.description}</td>
                <td className="px-6 py-4 text-[#4A5565] text-sm">{transaction.method}</td>
                <td className="px-6 py-4 text-right font-bold text-sm" style={{ color: transaction.amountColor }}>
                  {transaction.amount}
                </td>
                <td className="px-6 py-4">
                  <button className="px-3 py-2 text-[#009689] text-sm font-medium rounded hover:bg-[#F0FDFA] transition-colors">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
