import React from 'react';
import { TrendingUp, TrendingDown } from 'react-feather';

const SummaryCard = ({ 
  title, 
  amount, 
  count, 
  percentage, 
  icon, 
  trend,
  bgColor,
  textColor 
}) => {
  const isPositive = percentage >= 0;
  
  return (
    <div className="shadow-[0px_1px_3px_rgba(0,_0,_0,_0.1),_0px_1px_2px_-1px_rgba(0,_0,_0,_0.1)] rounded-[14px] bg-white border-[#f3f4f6] border-solid border-[0.8px] flex flex-col items-start pt-[23px] pb-[23px] pl-6 pr-6 gap-2 max-w-full">
      <div className="flex items-start pb-2 gap-5 w-full">
        <div className={`h-12 w-12 rounded-[14px] flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: bgColor }}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex items-center justify-end flex-1 gap-1">
          {isPositive ? (
            <TrendingUp size={18} color={textColor} />
          ) : (
            <TrendingDown size={18} color={textColor} />
          )}
          <div className="h-5 relative leading-5 font-semibold text-sm" style={{ color: textColor }}>
            {isPositive ? '+' : ''}{percentage}%
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-1">
        <div className="h-5 relative leading-5 font-medium text-sm text-[#6a7282]">
          {title}
        </div>
        <div className="h-9 relative text-3xl font-bold leading-9 text-[#101828]">
          Rs. {amount.toLocaleString()}
        </div>
      </div>
      <div className="h-5 relative leading-5 text-sm text-[#6a7282]">
        {count}
      </div>
    </div>
  );
};

export default SummaryCard;
