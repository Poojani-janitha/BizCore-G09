import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Briefcase, Activity, PieChart, Download,
  Calendar, RefreshCw, Loader, AlertCircle
} from 'react-feather';
import axios from 'axios';
import { downloadProfitLossPDF, downloadBalanceSheetPDF } from '../../utils/reportGenerators';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

const fmt = (val) => {
  const num = parseFloat(val) || 0;
  return 'LKR ' + num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const today = new Date().toISOString().split('T')[0];
const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

// ── Reusable Line Row ─────────────────────────────────────────────────────────
const LineRow = ({ label, value, bold = false, color = 'text-gray-900' }) => (
  <div className={`flex justify-between items-center text-sm py-1.5`}>
    <span className={`${bold ? 'font-bold text-gray-900' : 'text-gray-600'} flex-1 pr-4`}>{label}</span>
    <span className={`font-semibold ${color} text-right whitespace-nowrap`}>{fmt(value)}</span>
  </div>
);

// ── Section Header ─────────────────────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest pt-5 pb-2 border-t border-gray-100 first:border-0 first:pt-0">{title}</p>
);

// ── Summary Highlight Box ─────────────────────────────────────────────────────
const SummaryBox = ({ label, value, bgColor, borderColor, textColor }) => (
  <div className={`flex justify-between items-center px-5 py-3.5 ${bgColor} ${borderColor} rounded-xl`}>
    <span className="text-base font-bold text-gray-900">{label}</span>
    <span className={`text-lg font-black ${textColor}`}>{fmt(value)}</span>
  </div>
);

// ── Report Type Card ──────────────────────────────────────────────────────────
const ReportCard = ({ title, description, period, lastGenerated, icon, iconBg, onClick, active, onDownload, disabled }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border-2 p-6 flex flex-col gap-5 cursor-pointer transition-all hover:shadow-lg ${
      active ? 'border-orange-400 shadow-md shadow-orange-50' : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div className="flex flex-col gap-1 flex-1">
      <h3 className="text-base font-bold text-gray-900 leading-snug">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="flex flex-col gap-0.5 mt-2">
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <Calendar size={11} /> {period}
        </p>
        <p className="text-xs text-gray-400">Last: {lastGenerated}</p>
      </div>
    </div>
    <button 
      disabled={disabled}
      onClick={(e) => { 
        e.preventDefault();
        e.stopPropagation(); 
        console.log("Download button clicked for:", title);
        if (onDownload) onDownload(); 
      }}
      className={`w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
    >
      <Download size={15} /> Download PDF
    </button>
  </div>
);

// ── Date Filter Row ────────────────────────────────────────────────────────────
const DateInput = ({ label, value, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{label}</span>
    <input
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
    />
  </div>
);

// ── Panel Shell ───────────────────────────────────────────────────────────────
const Panel = ({ title, subtitle, filters, loading, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col min-h-0">
    {/* Header */}
    <div className="px-6 py-5 bg-gray-50 border-b border-gray-200 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap pt-2 border-t border-gray-100">
        {filters}
      </div>
    </div>

    {/* Body */}
    <div className="p-6 flex flex-col gap-1 overflow-y-auto max-h-[600px]">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader size={28} className="animate-spin text-orange-500" />
        </div>
      ) : children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('pl');
  const [plData, setPlData]     = useState(null);
  const [bsData, setBsData]     = useState(null);
  const [plLoading, setPlLoading] = useState(false);
  const [bsLoading, setBsLoading] = useState(false);
  const [error, setError]       = useState(null);
  const [plStart, setPlStart]   = useState(monthStart);
  const [plEnd, setPlEnd]       = useState(today);
  const [bsDate, setBsDate]     = useState(today);

  const fetchPL = async () => {
    try {
      setPlLoading(true); setError(null);
      const res = await axios.get(API_ENDPOINTS.financeDashboard.profitLoss(plStart, plEnd));
      if (res.data.success) setPlData(res.data.data);
    } catch { setError('Failed to load Profit & Loss data'); }
    finally { setPlLoading(false); }
  };

  const fetchBS = async () => {
    try {
      setBsLoading(true); setError(null);
      const res = await axios.get(API_ENDPOINTS.financeDashboard.balanceSheet(bsDate));
      if (res.data.success) setBsData(res.data.data);
    } catch { setError('Failed to load Balance Sheet data'); }
    finally { setBsLoading(false); }
  };

  useEffect(() => { fetchPL(); }, [plStart, plEnd]);
  useEffect(() => { fetchBS(); }, [bsDate]);

  const reportCards = [
    { 
      id: 'pl', 
      title: 'Profit & Loss Statement', 
      description: 'Income and expenses summary',   
      period: `${plStart} → ${plEnd}`,  
      lastGenerated: today, 
      icon: <TrendingUp size={20} className="text-blue-600" />, 
      iconBg: 'bg-blue-50',
      onDownload: () => plData && downloadProfitLossPDF(plData, `${plStart} to ${plEnd}`),
      disabled: !plData
    },
    { 
      id: 'bs', 
      title: 'Balance Sheet',           
      description: 'Assets, liabilities, equity',   
      period: `As of: ${bsDate}`,        
      lastGenerated: today, 
      icon: <Briefcase  size={20} className="text-green-600"  />, 
      iconBg: 'bg-green-50',
      onDownload: () => bsData && downloadBalanceSheetPDF(bsData, bsDate),
      disabled: !bsData
    },
    { 
      id: 'cf', 
      title: 'Cash Flow Statement',     
      description: 'Cash inflows and outflows',      
      period: 'Coming Soon',             
      lastGenerated: '—',   
      icon: <Activity   size={20} className="text-purple-600" />, 
      iconBg: 'bg-purple-50',
      onDownload: () => alert("Cash Flow report is coming soon!"),
      disabled: true
    },
    { 
      id: 'sr', 
      title: 'Sales Report',            
      description: 'Detailed sales analysis',        
      period: 'Coming Soon',             
      lastGenerated: '—',   
      icon: <PieChart   size={20} className="text-orange-600" />, 
      iconBg: 'bg-orange-50',
      onDownload: () => alert("Sales report is coming soon!"),
      disabled: true
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white p-6 md:p-8 font-['Inter']">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-8">

        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Reports</h1>
          <p className="text-gray-600 text-base">Generate and view financial statements and reports</p>
        </div>

        {/* Report Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {reportCards.map(card => (
            <ReportCard 
              key={card.id} 
              {...card} 
              active={activeReport === card.id}
              onClick={() => setActiveReport(card.id)}
            />
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
            <AlertCircle size={16} /> {error}
            <button onClick={() => { fetchPL(); fetchBS(); }} className="ml-auto hover:text-red-800">
              <RefreshCw size={14} />
            </button>
          </div>
        )}

        {/* Statement Panels */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

          {/* ── Profit & Loss ─────────────────────────────────────────────── */}
          <Panel
            title="Profit & Loss Statement"
            subtitle={`Period: ${plStart}  →  ${plEnd}`}
            loading={plLoading}
            onDownload={() => plData && downloadProfitLossPDF(plData, `${plStart} to ${plEnd}`)}
            filters={
              <>
                <DateInput label="From" value={plStart} onChange={setPlStart} />
                <DateInput label="To"   value={plEnd}   onChange={setPlEnd}   />
              </>
            }
          >
            {plData ? (
              <>
                {/* ── Operating Revenue ───────────────────────────────── */}
                <SectionHeader title="Operating Revenue" />
                <div className="flex flex-col divide-y divide-gray-50 pl-3 border-l-2 border-blue-100">
                  {plData.operatingRevenue.length === 0
                    ? <p className="text-xs text-gray-400 py-3">No operating revenue for this period</p>
                    : plData.operatingRevenue.map((r, i) => <LineRow key={i} label={r.account_name} value={r.amount} />)
                  }
                  {plData.otherIncome.length > 0 && (
                    <>
                      <div className="pt-1 pb-1">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest pt-2 pb-1">Other Income</p>
                        {plData.otherIncome.map((r, i) => <LineRow key={i} label={r.account_name} value={r.amount} />)}
                      </div>
                    </>
                  )}
                  <div className="pt-1">
                    <LineRow label="Total Revenue" value={plData.totals.totalRevenue} bold color="text-blue-600" />
                  </div>
                </div>

                {/* ── Cost of Goods Sold ──────────────────────────────── */}
                <SectionHeader title="Cost of Goods Sold (COGS)" />
                <div className="flex flex-col divide-y divide-gray-50 pl-3 border-l-2 border-red-200">
                  {plData.cogs.length === 0
                    ? <p className="text-xs text-gray-400 py-3">No COGS recorded for this period</p>
                    : plData.cogs.map((c, i) => <LineRow key={i} label={c.account_name} value={c.amount} color="text-red-500" />)
                  }
                  <div className="pt-1">
                    <LineRow label="Total COGS" value={plData.totals.totalCOGS} bold color="text-red-600" />
                  </div>
                </div>

                {/* ── Gross Profit ─────────────────────────────────────── */}
                <SummaryBox
                  label={`Gross Profit  ·  ${plData.totals.grossMargin}% margin`}
                  value={plData.totals.grossProfit}
                  bgColor="bg-orange-50"
                  borderColor="border border-orange-200"
                  textColor="text-orange-600"
                />

                {/* ── Operating Expenses ──────────────────────────────── */}
                <SectionHeader title="Operating Expenses" />
                <div className="flex flex-col divide-y divide-gray-50 pl-3 border-l-2 border-amber-100">
                  {plData.operatingExpenses.length === 0
                    ? <p className="text-xs text-gray-400 py-3">No operating expenses for this period</p>
                    : plData.operatingExpenses.map((e, i) => <LineRow key={i} label={e.account_name} value={e.amount} />)
                  }
                  <div className="pt-1">
                    <LineRow label="Total Operating Expenses" value={plData.totals.totalOperatingExpenses} bold color="text-amber-600" />
                  </div>
                </div>

                {/* ── Contra Revenue (Discounts) ───────────────────────── */}
                {plData.contraRevenue.length > 0 && (
                  <>
                    <SectionHeader title="Discounts & Returns" />
                    <div className="flex flex-col divide-y divide-gray-50 pl-3 border-l-2 border-pink-100">
                      {plData.contraRevenue.map((c, i) => <LineRow key={i} label={c.account_name} value={c.amount} />)}
                      <div className="pt-1">
                        <LineRow label="Total Discounts" value={plData.totals.totalContraRevenue} bold color="text-pink-600" />
                      </div>
                    </div>
                  </>
                )}

                {/* ── Net Profit ───────────────────────────────────────── */}
                <div className="flex flex-col gap-3 pt-2">
                  <SummaryBox
                    label="Net Profit"
                    value={plData.totals.netProfit}
                    bgColor={plData.totals.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}
                    borderColor={`border-2 ${plData.totals.netProfit >= 0 ? 'border-green-200' : 'border-red-200'}`}
                    textColor={plData.totals.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}
                  />
                  <p className="text-center text-xs text-gray-400">
                    Net Profit Margin: <span className="font-bold text-gray-600">{plData.totals.profitMargin}%</span>
                    &nbsp;·&nbsp;
                    Gross Margin: <span className="font-bold text-gray-600">{plData.totals.grossMargin}%</span>
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 py-16 text-center">Select a date range to generate the report</p>
            )}
          </Panel>

          {/* ── Balance Sheet ──────────────────────────────────────────────── */}
          <Panel
            title="Balance Sheet"
            subtitle={`As of: ${bsDate}`}
            loading={bsLoading}
            onDownload={() => bsData && downloadBalanceSheetPDF(bsData, bsDate)}
            filters={<DateInput label="As of" value={bsDate} onChange={setBsDate} />}
          >
            {bsData ? (
              <>
                {/* ── Assets ────────────────────────────────────────────────── */}
                <SectionHeader title="Assets" />
                
                {/* Current Assets */}
                <div className="pl-3 mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Current Assets</p>
                  <div className="flex flex-col divide-y divide-gray-50 pl-2 border-l border-blue-50">
                    {bsData.currentAssets.length === 0
                      ? <p className="text-xs text-gray-400 py-2">No current assets</p>
                      : bsData.currentAssets.map((a, i) => <LineRow key={i} label={a.account_name} value={a.balance} />)
                    }
                    <div className="pt-1">
                      <LineRow label="Total Current Assets" value={bsData.totals.totalCurrentAssets} bold color="text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Non-Current Assets */}
                <div className="pl-3 mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Non-Current Assets</p>
                  <div className="flex flex-col divide-y divide-gray-50 pl-2 border-l border-cyan-50">
                    {bsData.nonCurrentAssets.length === 0
                      ? <p className="text-xs text-gray-400 py-2">No non-current assets</p>
                      : bsData.nonCurrentAssets.map((a, i) => <LineRow key={i} label={a.account_name} value={a.balance} />)
                    }
                    <div className="pt-1">
                      <LineRow label="Total Non-Current Assets" value={bsData.totals.totalNonCurrentAssets} bold color="text-cyan-600" />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <LineRow label="Total Assets" value={bsData.totals.totalAssets} bold color="text-orange-600" />
                </div>

                {/* ── Liabilities ────────────────────────────────────────────── */}
                <SectionHeader title="Liabilities" />
                
                {/* Current Liabilities */}
                <div className="pl-3 mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Current Liabilities</p>
                  <div className="flex flex-col divide-y divide-gray-50 pl-2 border-l border-red-50">
                    {bsData.currentLiabilities.length === 0
                      ? <p className="text-xs text-gray-400 py-2">No current liabilities</p>
                      : bsData.currentLiabilities.map((l, i) => <LineRow key={i} label={l.account_name} value={l.balance} />)
                    }
                    <div className="pt-1">
                      <LineRow label="Total Current Liabilities" value={bsData.totals.totalCurrentLiabilities} bold color="text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Non-Current Liabilities */}
                <div className="pl-3 mb-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Non-Current Liabilities</p>
                  <div className="flex flex-col divide-y divide-gray-50 pl-2 border-l border-rose-50">
                    {bsData.nonCurrentLiabilities.length === 0
                      ? <p className="text-xs text-gray-400 py-2">No non-current liabilities</p>
                      : bsData.nonCurrentLiabilities.map((l, i) => <LineRow key={i} label={l.account_name} value={l.balance} />)
                    }
                    <div className="pt-1">
                      <LineRow label="Total Non-Current Liabilities" value={bsData.totals.totalNonCurrentLiabilities} bold color="text-rose-600" />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <LineRow label="Total Liabilities" value={bsData.totals.totalLiabilities} bold color="text-red-700" />
                </div>

                {/* ── Equity ────────────────────────────────────────────────── */}
                <SectionHeader title="Equity" />
                <div className="flex flex-col divide-y divide-gray-50 pl-3 border-l-2 border-purple-100 mb-4">
                  {bsData.equity.length === 0
                    ? <p className="text-xs text-gray-400 py-3">No equity accounts with activity</p>
                    : bsData.equity.map((e, i) => <LineRow key={i} label={e.account_name} value={e.balance} />)
                  }
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <SummaryBox label="Owner's Equity" value={bsData.totals.totalEquity} bgColor="bg-purple-50" borderColor="border-2 border-purple-200" textColor="text-purple-600" />
                  <p className="text-center text-xs text-gray-400">
                    Total Liabilities + Equity = <span className="font-bold text-gray-600">{fmt(bsData.totals.totalLiabilitiesAndEquity)}</span>
                  </p>
                  {Math.abs(bsData.totals.totalAssets - bsData.totals.totalLiabilitiesAndEquity) > 1 && (
                    <p className="text-center text-xs text-amber-500 font-medium">
                      ⚠ Sheet is not balanced — retained earnings may not be posted yet
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 py-16 text-center">Select a date to generate the balance sheet</p>
            )}
          </Panel>

        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
