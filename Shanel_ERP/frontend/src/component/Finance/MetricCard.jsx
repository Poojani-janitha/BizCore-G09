import React from 'react';

const MetricCard = ({ metric }) => {
  const getIcon = (iconType) => {
    switch (iconType) {
      case 'received':
        return (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" stroke={metric.percentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1 1L5 5L9 1" stroke={metric.percentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'paid':
        return (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M11 21C16.5228 21 21 16.5228 21 11C21 5.47715 16.5228 1 11 1C5.47715 1 1 5.47715 1 11C1 16.5228 5.47715 21 11 21Z" stroke={metric.percentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 5L5 1L1 5" stroke={metric.percentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'cashflow':
        return (
          <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3.5">
            <path d="M12 1H4.5C3.57174 1 2.6815 1.36875 2.02513 2.02513C1.36875 2.6815 1 3.57174 1 4.5C1 5.42826 1.36875 6.3185 2.02513 6.97487C2.6815 7.63125 3.57174 8 4.5 8H9.5C10.4283 8 11.3185 8.36875 11.9749 9.02513C12.6313 9.6815 13 10.5717 13 11.5C13 12.4283 12.6313 13.3185 11.9749 13.9749C11.3185 14.6313 10.4283 15 9.5 15H1" stroke={metric.percentColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border border-[#F3F4F6] bg-white shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center justify-center rounded-lg p-3 w-12 h-12" style={{ backgroundColor: metric.bgColor }}>
          {getIcon(metric.icon)}
        </div>
        <div className="flex items-center gap-1">
          <svg width="14" height="8" viewBox="0 0 15 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-2">
            {metric.percentage.startsWith('+') ? (
              <path d="M14 0.666656L8.33332 6.33332L4.99999 2.99999L0.666656 7.33332" stroke={metric.percentColor} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M14 7.33332L8.33335 1.66666L5.00002 4.99999L0.666687 0.666656" stroke={metric.percentColor} strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          <span className="text-sm font-semibold" style={{ color: metric.percentColor }}>
            {metric.percentage}
          </span>
        </div>
      </div>

      <p className="text-[#6A7282] text-xs font-medium mb-2 uppercase tracking-wide">
        {metric.title}
      </p>
      <h3 className="text-[#101828] text-2xl font-bold mb-3">
        {metric.amount}
      </h3>
      <p className="text-[#6A7282] text-sm">
        {metric.subtitle}
      </p>
    </div>
  );
};

export default MetricCard;
