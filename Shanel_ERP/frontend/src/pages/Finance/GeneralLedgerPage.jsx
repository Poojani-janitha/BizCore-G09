import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Box, Calendar, Layers,
  Download, PlusCircle, PieChart, Activity
} from 'react-feather';
import ChartOfAccountsPage from './ChartOfAccountsPage';

const GeneralLedgerPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('journal_entries');

  const tabs = [
    { id: 'chart_of_accounts', label: 'Chart of Accounts', icon: (color) => <Box size={18} color={color} /> },
    { id: 'journal_entries', label: 'Journal Entries', icon: (color) => <FileText size={18} color={color} /> },
    { id: 'fiscal_periods', label: 'Fiscal Periods', icon: (color) => <Calendar size={18} color={color} /> },
    { id: 'subledger_integration', label: 'Subledger Integration', icon: (color) => <Layers size={18} color={color} /> }
  ];

  const renderJournalEntries = () => (
    <div style={{ alignSelf: 'stretch', paddingTop: 16, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex' }}>
      <div style={{ alignSelf: 'stretch', background: 'white', boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)', overflow: 'hidden', borderRadius: 14, outline: '0.80px #E5E7EB solid', outlineOffset: '-0.80px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
        <div style={{ alignSelf: 'stretch', position: 'relative', overflow: 'hidden' }}>
          <div style={{ alignSelf: 'stretch', height: 40.39, background: '#F9FAFB', borderBottom: '0.80px #F3F4F6 solid', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
            <div style={{ flex: 1.2, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Date</div>
            <div style={{ flex: 1.5, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>JE Number</div>
            <div style={{ flex: 2.5, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Description</div>
            <div style={{ flex: 1.2, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Reference</div>
            <div style={{ flex: 1.2, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Total Debit</div>
            <div style={{ flex: 1.2, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Total Credit</div>
            <div style={{ flex: 1, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Status</div>
          </div>
          <div style={{ alignSelf: 'stretch' }}>
            {[
              { date: '2026-05-01', je: 'JE-2026-001', desc: 'Monthly Sales Recognition', ref: 'INV-1245', debit: '45,000', credit: '45,000', status: 'Posted' },
              { date: '2026-05-02', je: 'JE-2026-002', desc: 'Utility Bill Payment', ref: 'PAY-882', debit: '8,500', credit: '8,500', status: 'Posted' },
            ].map((row, idx) => (
              <div key={idx} style={{ alignSelf: 'stretch', height: 56.80, borderBottom: '0.80px #F3F4F6 solid', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                <div style={{ flex: 1.2, color: '#364153', fontSize: 14, fontFamily: 'Inter', fontWeight: '400' }}>{row.date}</div>
                <div style={{ flex: 1.5, color: '#0F3D3E', fontSize: 14, fontFamily: 'Inter', fontWeight: '500' }}>{row.je}</div>
                <div style={{ flex: 2.5, color: '#6A7282', fontSize: 14, fontFamily: 'Inter', fontWeight: '400' }}>{row.desc}</div>
                <div style={{ flex: 1.2, color: '#6A7282', fontSize: 14, fontFamily: 'Inter', fontWeight: '400' }}>{row.ref}</div>
                <div style={{ flex: 1.2, color: '#101828', fontSize: 14, fontFamily: 'Inter', fontWeight: '500' }}>{row.debit}</div>
                <div style={{ flex: 1.2, color: '#101828', fontSize: 14, fontFamily: 'Inter', fontWeight: '500' }}>{row.credit}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-flex', padding: '4px 10px', background: '#DCFCE7', borderRadius: 9999, alignItems: 'center' }}>
                    <div style={{ color: '#008236', fontSize: 12, fontFamily: 'Inter', fontWeight: '500' }}>{row.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFiscalPeriods = () => (
    <div style={{ alignSelf: 'stretch', paddingTop: 16, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex' }}>
      <div style={{ alignSelf: 'stretch', height: 97.60, position: 'relative', display: 'flex', gap: 24 }}>
        {[
          { label: 'Current Period', value: 'May 2026', color: '#00A63E', bg: '#DCFCE7' },
          { label: 'Fiscal Year', value: 'FY 2026-27', color: '#F54900', bg: '#FFEDD4' },
          { label: 'System Status', value: 'Ready for Posting', color: '#155DFC', bg: '#DBEAFE' }
        ].map((card, idx) => (
          <div key={idx} style={{ flex: 1, height: 97.60, padding: 24, background: 'white', boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)', borderRadius: 14, outline: '0.80px #E5E7EB solid', outlineOffset: '-0.80px', justifyContent: 'flex-start', alignItems: 'center', gap: 16, display: 'inline-flex' }}>
            <div style={{ width: 48, height: 48, paddingLeft: 12, paddingRight: 12, background: card.bg, borderRadius: 9999, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
              {idx === 0 && <Calendar size={20} color={card.color} />}
              {idx === 1 && <Activity size={20} color={card.color} />}
              {idx === 2 && <PieChart size={20} color={card.color} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#99A1AF', fontSize: 12, fontFamily: 'Inter', fontWeight: '700', textTransform: 'uppercase', lineHeight: '16px' }}>{card.label}</div>
              <div style={{ color: '#0F3D3E', fontSize: 18, fontFamily: 'Inter', fontWeight: '700', lineHeight: '28px' }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ alignSelf: 'stretch', background: 'white', boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)', overflow: 'hidden', borderRadius: 14, outline: '0.80px #E5E7EB solid', outlineOffset: '-0.80px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
        <div style={{ alignSelf: 'stretch', position: 'relative', overflow: 'hidden' }}>
          <div style={{ alignSelf: 'stretch', height: 40.39, background: '#F9FAFB', borderBottom: '0.80px #F3F4F6 solid', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
            <div style={{ flex: 2, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Period Name</div>
            <div style={{ flex: 1.5, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Start Date</div>
            <div style={{ flex: 1.5, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>End Date</div>
            <div style={{ flex: 1.5, color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Status</div>
            <div style={{ flex: 1.5, textAlign: 'right', color: '#4A5565', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.60 }}>Actions</div>
          </div>
          <div style={{ alignSelf: 'stretch' }}>
            {[
              { name: 'January 2026', start: '2026-01-01', end: '2026-01-31', status: 'LOCKED', color: '#C10007', bg: '#FEF2F2', border: '#FFE2E2' },
              { name: 'February 2026', start: '2026-02-01', end: '2026-02-28', status: 'LOCKED', color: '#C10007', bg: '#FEF2F2', border: '#FFE2E2' },
              { name: 'March 2026', start: '2026-03-01', end: '2026-03-31', status: 'CLOSED', color: '#CA3500', bg: '#FFF7ED', border: '#FFEDD4' },
              { name: 'April 2026', start: '2026-04-01', end: '2026-04-30', status: 'OPEN', color: '#008236', bg: '#F0FDF4', border: '#DCFCE7' },
              { name: 'May 2026', start: '2026-05-01', end: '2026-05-31', status: 'OPEN', color: '#008236', bg: '#F0FDF4', border: '#DCFCE7' },
            ].map((row, idx) => (
              <div key={idx} style={{ alignSelf: 'stretch', height: 57.40, borderBottom: '0.80px #F3F4F6 solid', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                <div style={{ flex: 2, color: '#0F3D3E', fontSize: 14, fontFamily: 'Inter', fontWeight: '500' }}>{row.name}</div>
                <div style={{ flex: 1.5, color: '#6A7282', fontSize: 14, fontFamily: 'Inter', fontWeight: '400' }}>{row.start}</div>
                <div style={{ flex: 1.5, color: '#6A7282', fontSize: 14, fontFamily: 'Inter', fontWeight: '400' }}>{row.end}</div>
                <div style={{ flex: 1.5 }}>
                  <div style={{ display: 'inline-flex', padding: '4px 10px', background: row.bg, borderRadius: 9999, outline: `0.80px ${row.border} solid`, alignItems: 'center' }}>
                    <div style={{ color: row.color, fontSize: 10, fontFamily: 'Inter', fontWeight: '700' }}>{row.status}</div>
                  </div>
                </div>
                <div style={{ flex: 1.5, textAlign: 'right' }}>
                  <div style={{ color: '#FF6B35', fontSize: 12, fontFamily: 'Inter', fontWeight: '600', cursor: 'pointer' }}>Change Status</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ alignSelf: 'stretch', minHeight: '931.55px', paddingTop: 24, paddingLeft: 24, paddingRight: 24, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
      <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 24, display: 'flex' }}>

        {/* Header Section */}
        <div style={{ alignSelf: 'stretch', height: 64, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
          <div style={{ width: 383.50, height: 64, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex' }}>
            <div style={{ alignSelf: 'stretch', height: 36, position: 'relative' }}>
              <div style={{ left: 0, top: -1.60, position: 'absolute', color: '#0F3D3E', fontSize: 30, fontFamily: 'Inter', fontWeight: '600', lineHeight: '36px', wordWrap: 'break-word' }}>General Ledger</div>
            </div>
            <div style={{ alignSelf: 'stretch', height: 24, position: 'relative' }}>
              <div style={{ left: 0, top: -2.20, position: 'absolute', color: '#4A5565', fontSize: 16, fontFamily: 'Inter', fontWeight: '400', lineHeight: '24px', wordWrap: 'break-word' }}>Comprehensive financial control and recording system</div>
            </div>
          </div>
          
          {/* Header Action Buttons (Tab Specific) */}
          <div style={{ display: 'flex', gap: 12 }}>
            {activeTab === 'journal_entries' && (
              <div style={{ padding: '8px 16px', background: '#FF6B35', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>
                <PlusCircle size={18} color="white" />
                <span style={{ color: 'white', fontSize: 15, fontWeight: '500' }}>Create Journal Entry</span>
              </div>
            )}
            {activeTab === 'fiscal_periods' && (
              <div style={{ padding: '8px 16px', background: '#0F3D3E', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}>
                <Calendar size={18} color="white" />
                <span style={{ color: 'white', fontSize: 15, fontWeight: '500' }}>New Fiscal Year</span>
              </div>
            )}
            {activeTab === 'chart_of_accounts' && (
              <div 
                onClick={() => navigate('/finance/create-account')}
                style={{ padding: '8px 16px', background: '#FF6B35', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0px 1px 2px rgba(0,0,0,0.1)' }}
              >
                <PlusCircle size={18} color="white" />
                <span style={{ color: 'white', fontSize: 15, fontWeight: '500' }}>Add New Account</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Section */}
        <div style={{ alignSelf: 'stretch', height: 46.40, paddingBottom: 8, overflow: 'hidden', borderBottom: '0.80px #E5E7EB solid', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 4, display: 'inline-flex' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const color = isActive ? '#FF6B35' : '#6A7282';
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  height: 37.60,
                  position: 'relative',
                  background: isActive ? 'rgba(255, 247, 237, 0.30)' : 'transparent',
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderBottom: isActive ? `1.60px ${color} solid` : '1.60px rgba(0, 0, 0, 0) solid',
                  cursor: 'pointer',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                {tab.icon(color)}
                <div style={{ textAlign: 'center', color: color, fontSize: 14, fontFamily: 'Inter', fontWeight: '500', lineHeight: '20px', wordWrap: 'break-word' }}>{tab.label}</div>
              </div>
            );
          })}
        </div>

        {/* Content Section */}
        {activeTab === 'journal_entries' && renderJournalEntries()}
        {activeTab === 'fiscal_periods' && renderFiscalPeriods()}
        {activeTab === 'chart_of_accounts' && <ChartOfAccountsPage />}
        {activeTab === 'subledger_integration' && (
          <div style={{ padding: 40, color: '#6A7282', textAlign: 'center', width: '100%' }}>
            SUBLEDGER INTEGRATION View Coming Soon
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralLedgerPage;
