import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, PlusCircle, Loader, RefreshCw } from 'react-feather';
import axios from 'axios';
import QuickAccountModal from '../../component/Finance/QuickAccountModal';

const ChartOfAccountsPage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [modalData, setModalData] = useState({ isOpen: false, type: 'Asset', category: '' });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/accounts');
      if (res.data.success) {
        setAccounts(res.data.data);
      } else {
        setError('Failed to fetch accounts');
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Server error while loading accounts');
    } finally {
      setLoading(false);
    }
  };

  // Group accounts by type
  const groupedAccounts = [
    { title: "Assets", accounts: accounts.filter(a => a.Account_Type === 'Asset') },
    { title: "Liabilities", accounts: accounts.filter(a => a.Account_Type === 'Liability') },
    { title: "Equity", accounts: accounts.filter(a => a.Account_Type === 'Equity') },
    { title: "Revenue", accounts: accounts.filter(a => a.Account_Type === 'Revenue') },
    { title: "Expenses", accounts: accounts.filter(a => a.Account_Type === 'Expense') }
  ];

  const handleQuickAdd = (type) => {
    // Determine a default category label based on the type
    let defaultCategory = '';
    if (type === 'Asset') defaultCategory = 'Current Asset';
    if (type === 'Liability') defaultCategory = 'Current Liability';
    if (type === 'Expense') defaultCategory = 'Operating Expense';
    
    setModalData({ isOpen: true, type, category: defaultCategory });
  };

  const handleAccountClick = (code) => {
    navigate(`/finance/ledger/${code}`);
  };

  const fmt = (n) => parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <Loader className="animate-spin text-orange-500 mb-4" size={32} />
        <p className="text-gray-500 font-medium">Loading Chart of Accounts...</p>
      </div>
    );
  }

  return (
    <div className="self-stretch px-0 pt-4 flex flex-col justify-start items-start gap-4 w-full">
      
      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex justify-between items-center mb-4">
          <p className="text-sm font-medium">{error}</p>
          <button onClick={fetchAccounts} className="p-1 hover:bg-red-100 rounded transition"><RefreshCw size={16} /></button>
        </div>
      )}

      <div className="self-stretch flex flex-col gap-8 pb-10 w-full">
        {groupedAccounts.map((category, catIdx) => (
          <div key={catIdx} className="self-stretch flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold text-cyan-950 uppercase tracking-wider">{category.title}</h2>
              <button 
                onClick={() => handleQuickAdd(category.title.replace(/s$/, ''))}
                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-all active:scale-90"
                title={`Quick Add ${category.title.replace(/s$/, '')}`}
              >
                <PlusCircle size={16} />
              </button>
              <div className="flex-1 h-[1px] bg-gray-200"></div>
              <span className="text-xs text-gray-400 font-medium">{category.accounts.length} accounts</span>
            </div>

            {category.accounts.length > 0 ? (
              <div className="self-stretch bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider w-32">Code</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Account Name</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Balance (LKR)</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center w-32">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {category.accounts.map((account, accIdx) => (
                        <tr 
                          key={accIdx} 
                          onClick={() => handleAccountClick(account.Account_Code)}
                          className="hover:bg-cyan-50/30 cursor-pointer transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{account.Account_Code}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-cyan-950 group-hover:text-orange-600 transition-colors">{account.Account_Name}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-sm font-bold ${parseFloat(account.Current_Balance) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                              {fmt(account.Current_Balance)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase ${account.Is_Active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {account.Is_Active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-6 px-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-xs text-gray-400">No {category.title.toLowerCase()} configured yet.</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Add Modal */}
      <QuickAccountModal 
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        initialType={modalData.type}
        initialCategory={modalData.category}
        onAccountCreated={() => fetchAccounts()}
      />
    </div>
  );
};

export default ChartOfAccountsPage;
