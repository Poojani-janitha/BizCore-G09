import React from 'react';

const TransactionTable = ({ transactions = [], title = "Recent Activity", subtitle = "Last 10 transactions" }) => {
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
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="border-b border-gray-50 p-6 bg-white">
        <div>
          <h3 className="text-teal-950 text-lg font-bold mb-1">{title}</h3>
          <p className="text-gray-400 text-sm font-medium">{subtitle}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-left text-gray-500 text-[11px] font-bold uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-left text-gray-500 text-[11px] font-bold uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-gray-500 text-[11px] font-bold uppercase tracking-wider">Party</th>
              <th className="px-6 py-4 text-left text-gray-500 text-[11px] font-bold uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-left text-gray-500 text-[11px] font-bold uppercase tracking-wider">Method</th>
              <th className="px-6 py-4 text-right text-gray-500 text-[11px] font-bold uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                  <p className="text-sm">No transactions found for this period</p>
                </td>
              </tr>
            ) : (
              transactions.map((transaction, index) => (
                <tr key={transaction.id || index} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">{getTransactionBadge(transaction.type)}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{transaction.date}</td>
                  <td className="px-6 py-4 text-teal-950 text-sm font-bold">{transaction.party}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm max-w-[300px] truncate">{transaction.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                      {transaction.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-sm pr-10" style={{ color: transaction.amountColor }}>
                    {transaction.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
