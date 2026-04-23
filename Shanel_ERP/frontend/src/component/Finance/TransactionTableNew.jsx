import React from 'react';

const TransactionTable = ({ transactions }) => {
  return (
    <div className="w-full shadow-[0px_1px_3px_rgba(0,_0,_0,_0.1),_0px_1px_2px_-1px_rgba(0,_0,_0,_0.1)] rounded-[14px] bg-white border-[#f3f4f6] border-solid border-[0.8px] box-border overflow-hidden max-w-full">
      
      {/* Table Header Section */}
      <div className="self-stretch h-[100.8px] border-[#e5e7eb] border-solid border-b-[0.8px] box-border flex flex-col items-start pt-6 pb-[0.8px] pl-6 pr-6 gap-1">
        <div className="self-stretch h-7 flex items-start">
          <div className="h-7 w-[133px] relative leading-7 font-semibold text-lg text-[#101828] inline-block">
            Recent Activity
          </div>
        </div>
        <div className="self-stretch h-5 flex items-start text-sm text-[#4a5565]">
          <div className="h-5 w-[133px] relative leading-5 inline-block">
            Last 10 transactions
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#009689] to-[#00786f] text-white">
            <tr>
              <th className="px-6 py-[15.8px] text-left text-sm font-semibold min-w-[155.9px]">Type</th>
              <th className="px-6 py-[15.8px] text-left text-sm font-semibold min-w-[114.2px]">Date</th>
              <th className="px-6 py-[15.8px] text-left text-sm font-semibold min-w-[170.8px]">Party</th>
              <th className="px-6 py-[15.8px] text-left text-sm font-semibold min-w-[171.9px]">Description</th>
              <th className="px-6 py-[15.8px] text-left text-sm font-semibold min-w-[159.3px]">Method</th>
              <th className="px-6 py-[15.8px] text-left text-sm font-semibold min-w-[149px]">Amount</th>
              <th className="px-6 py-[15.8px] text-left text-sm font-semibold min-w-[121.4px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f3f4f6]">
            {transactions.map((transaction, index) => (
              <tr 
                key={transaction.id}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#f9fafb]'} hover:bg-[#f3f4f6] transition-colors`}
              >
                {/* Type Badge */}
                <td className="px-6 py-5 text-xs">
                  <div className={`rounded-[26843500px] flex items-start pt-1.5 pb-1.5 pl-3 pr-3 gap-1.5 w-fit font-semibold ${
                    transaction.type === 'in'
                      ? 'bg-[#dcfce7] text-[#008236]'
                      : 'bg-[#ffe2e2] text-[#c10007]'
                  }`}>
                    <div>{transaction.type === 'in' ? '📥 IN' : '📤 OUT'}</div>
                    <div>{transaction.type === 'in' ? 'REC' : 'PAY'}</div>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-5 text-sm text-[#101828]">{transaction.date}</td>

                {/* Party */}
                <td className="px-6 py-5 text-base font-medium text-[#101828]">{transaction.party}</td>

                {/* Description */}
                <td className="px-6 py-5 text-sm text-[#4a5565]">{transaction.description}</td>

                {/* Method */}
                <td className="px-6 py-5 text-sm text-[#4a5565]">{transaction.method}</td>

                {/* Amount */}
                <td className="px-6 py-5 text-base font-bold text-right">
                  <span className={transaction.amount > 0 ? 'text-[#00a63e]' : 'text-[#e7000b]'}>
                    {transaction.amount > 0 ? '+' : ''}Rs. {Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </td>

                {/* Action */}
                <td className="px-6 py-5">
                  <button className="rounded-[10px] flex items-center pt-[7.8px] pb-[8.2px] pl-3.5 pr-3.5 h-5 text-center text-[#009689] font-medium text-sm hover:bg-[#f0fdf4] transition-colors cursor-pointer border-none bg-transparent">
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
