import React from 'react';

const ActionButtons = () => {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      {/* Receive Payment Button */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-[#00C950] to-[#00A63E] text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-center rounded-full border-2 border-white/30 bg-white/20 w-10 h-10 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M9.16666 17.5C13.769 17.5 17.5 13.769 17.5 9.16668C17.5 4.5643 13.769 0.833344 9.16666 0.833344C4.56429 0.833344 0.833328 4.5643 0.833328 9.16668C0.833328 13.769 4.56429 17.5 9.16666 17.5Z" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 5L9 13" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9L13 9" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm">RECEIVE PAYMENT</p>
          <p className="text-xs opacity-90">From customers</p>
        </div>
      </div>

      {/* Make Payment Button */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-[#FB2C36] to-[#E7000B] text-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-center rounded-full border-2 border-white/30 bg-white/20 w-10 h-10 flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M9.16665 17.5C13.769 17.5 17.5 13.769 17.5 9.16668C17.5 4.5643 13.769 0.833344 9.16665 0.833344C4.56427 0.833344 0.833313 4.5643 0.833313 9.16668C0.833313 13.769 4.56427 17.5 9.16665 17.5Z" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 13L9 5" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 9L5 9" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm">MAKE PAYMENT</p>
          <p className="text-xs opacity-90">To suppliers</p>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
