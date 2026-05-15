import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const DistributionPie = ({ data = [] }) => {
  const { t } = useTranslation();
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const chartData = Array.isArray(data)
    ? data
        .map(item => ({
          name: item.name || 'Unknown',
          value: Number(item.value) || 0
        }))
        .filter(item => item.value > 0)
    : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = Number(payload[0].value) || 0;
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
      
      return (
        <div className="bg-white border border-2 rounded-2 p-2 shadow-sm" style={{ fontSize: '12px' }}>
          <p className="mb-1 fw-bold text-dark">
            {payload[0].name}
          </p>
          <p className="mb-0 text-muted">
            {value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
      <div className="pt-4 px-4">
        <div>
          <h6 className="mb-1 fw-bold text-dark">{t('inventory.dashboard.distribution.title')}</h6>
          <p className="text-muted mb-0 small">{t('inventory.dashboard.distribution.subtitle')}</p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie 
                data={chartData} 
                innerRadius={50} 
                outerRadius={90} 
                paddingAngle={2} 
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="px-4 pb-3">
            <div className="d-flex flex-wrap gap-2">
              {chartData.map((item, index) => (
                <div key={index} className="d-flex align-items-center gap-2" style={{ fontSize: '12px' }}>
                  <div 
                    className="rounded-circle"
                    style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: COLORS[index % COLORS.length],
                      flexShrink: 0
                    }}
                  />
                  <span className="text-muted">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-5 text-muted">
          <p className="small mb-0">{t('inventory.dashboard.distribution.no_data')}</p>
        </div>
      )}
    </div>
  );
};

export default DistributionPie;
