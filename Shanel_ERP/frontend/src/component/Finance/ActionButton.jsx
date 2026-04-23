import React from 'react';

const ActionButton = ({ 
  title, 
  subtitle, 
  icon, 
  onClick, 
  gradient 
}) => {
  return (
    <button
      onClick={onClick}
      className={`h-[76px] shadow-[0px_4px_6px_-1px_rgba(0,_0,_0,_0.1),_0px_2px_4px_-2px_rgba(0,_0,_0,_0.1)] rounded-[14px] flex flex-col items-start pt-4 pb-0 pl-4 pr-4 box-border max-w-full text-left text-lg text-white font-Inter border-none cursor-pointer transition-all hover:shadow-[0px_10px_15px_-3px_rgba(0,_0,_0,_0.15)] active:scale-95 w-full md:w-auto`}
      style={{ background: gradient }}
    >
      <div className="self-stretch h-11 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="h-11 flex flex-col items-start">
          <div className="h-7 flex items-center">
            <b className="leading-7 font-bold">{title}</b>
          </div>
          <div className="h-4 flex items-center text-xs opacity-75">
            <div className="leading-4">{subtitle}</div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ActionButton;
