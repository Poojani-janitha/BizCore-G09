import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CustomizedAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word, index) => (
        <text key={index} x={0} y={index * 12} dy={16} textAnchor="middle" fill="#64748b" style={{ fontSize: '10px', fontWeight: '500' }}>
          {word}
        </text>
      ))}
    </g>
  );
};

const StockChart = ({ data = [] }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language?.startsWith('si');

  const chartData = data.map(item => ({
    ...item,
    displayName: (isSinhala && item.nameSinhala) ? item.nameSinhala : item.name
  }));

  return (
    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
      <div className="pt-4 px-4">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 className="mb-1 fw-bold text-dark">{t('inventory.dashboard.stock_chart.title')}</h6>
            <p className="text-muted mb-0 small">{t('inventory.dashboard.stock_chart.subtitle')}</p>
          </div>
          <button 
            type="button" 
            className="btn btn-sm fw-bold d-flex align-items-center gap-1"
            style={{ backgroundColor: 'transparent', color: '#3b82f6', fontSize: '12px', padding: '4px 8px' }}
            onClick={() => navigate('/inventory/company-items')}
            title="View complete product inventory"
          >
            {t('inventory.dashboard.stock_chart.view_all')} <ChevronRight size={14} />
          </button>
        </div>
        
        {/* Info Banner */}
        {chartData.length > 0 && (
          <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-2" style={{ backgroundColor: '#fef3c7', borderLeft: '3px solid #f59e0b' }}>
            <AlertCircle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <small style={{ color: '#92400e' }}>
              <strong>{t('inventory.dashboard.stock_chart.top15_label')}</strong> - {t('inventory.dashboard.stock_chart.top15_desc')}
            </small>
          </div>
        )}
      </div>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ bottom: 40, left: 10, right: 10, top: 20 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="displayName" 
              interval={0} 
              height={70} 
              tick={<CustomizedAxisTick />}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => value.toLocaleString()}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              iconType="line"
            />
            <Bar dataKey="current" name={t('inventory.dashboard.stock_chart.current_stock')} fill="url(#colorCurrent)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="min" name={t('inventory.dashboard.stock_chart.min_stock')} fill="url(#colorMin)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-5 text-muted">
          <p className="small mb-0">{t('inventory.dashboard.stock_chart.no_data')}</p>
        </div>
      )}
    </div>
  );
};

export default StockChart;