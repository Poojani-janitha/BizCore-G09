import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, PlusCircle } from 'react-feather';

const ChartOfAccountsPage = () => {
  const navigate = useNavigate();

  const accountCategories = [
    {
      title: "Assets",
      accounts: [
        { code: "1001", name: "General Account", type: "Current Asset", balance: "450,000", status: "Active" },
        { code: "1005", name: "Petty Cash", type: "Current Asset", balance: "25,000", status: "Active" },
        { code: "1100", name: "Accounts Receivable", type: "Current Asset", balance: "1,250,000", status: "Active" },
        { code: "1200", name: "Inventory", type: "Current Asset", balance: "3,400,000", status: "Active" },
        { code: "1500", name: "Fixed Assets - Equipment", type: "Fixed Asset", balance: "12,000,000", status: "Active" },
      ]
    },
    {
      title: "Liabilities",
      accounts: [
        { code: "2000", name: "Accounts Payable", type: "Current Liability", balance: "850,000", status: "Active" },
        { code: "2100", name: "Accrued Expenses", type: "Current Liability", balance: "120,000", status: "Active" },
        { code: "2500", name: "Long-term Loan", type: "Non-current Liability", balance: "5,000,000", status: "Active" },
      ]
    },
    {
      title: "Equity",
      accounts: [
        { code: "3000", name: "Owner's Capital", type: "Equity", balance: "10,000,000", status: "Active" },
        { code: "3100", name: "Retained Earnings", type: "Equity", balance: "2,450,000", status: "Active" },
      ]
    },
    {
      title: "Revenue",
      accounts: [
        { code: "4000", name: "Sales Revenue", type: "Revenue", balance: "8,500,000", status: "Active" },
        { code: "4100", name: "Service Income", type: "Revenue", balance: "1,200,000", status: "Active" },
      ]
    },
    {
      title: "Expenses",
      accounts: [
        { code: "5000", name: "Cost of Goods Sold", type: "Expense", balance: "4,200,000", status: "Active" },
        { code: "5100", name: "Salaries & Wages", type: "Expense", balance: "1,500,000", status: "Active" },
        { code: "5200", name: "Rent Expense", type: "Expense", balance: "250,000", status: "Active" },
        { code: "5300", name: "Utility Expense", type: "Expense", balance: "85,000", status: "Active" },
      ]
    }
  ];

  const handleAccountClick = (code) => {
    navigate(`/finance/ledger/${code}`);
  };

  return (
    <div className="self-stretch px-0 pt-4 flex flex-col justify-start items-start gap-4">

      <div className="self-stretch flex flex-col gap-8 pb-10">
        {accountCategories.map((category, catIdx) => (
          <div key={catIdx} className="self-stretch flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-cyan-950 uppercase tracking-wider">{category.title}</h2>
              <div className="flex-1 h-[1px] bg-gray-200"></div>
            </div>

            <div className="self-stretch bg-white rounded-2xl shadow-sm outline outline-[0.80px] outline-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Code</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Balance (LKR)</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center w-32">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {category.accounts.map((account, accIdx) => (
                    <tr 
                      key={accIdx} 
                      onClick={() => handleAccountClick(account.code)}
                      className="hover:bg-cyan-50/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{account.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-cyan-950 group-hover:text-orange-600 transition-colors">{account.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{account.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">{account.balance}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-green-100 text-green-700">
                          {account.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartOfAccountsPage;
