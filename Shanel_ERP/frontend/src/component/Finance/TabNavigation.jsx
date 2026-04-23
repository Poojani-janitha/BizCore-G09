import React from 'react';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'received', label: 'Received' },
    { id: 'paid', label: 'Paid Out' }
  ];

  return (
    <div className="inline-flex gap-1 p-1 rounded-lg border border-[#E5E7EB] bg-white shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-[#009689] to-[#00786F] text-white shadow-sm'
              : 'bg-white text-[#4A5565] hover:bg-gray-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
