import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  return (
    <div className="card border-0 shadow-sm rounded-3 h-100 bg-white">
      <div className="pt-4 px-4">
        <div>
          <h6 className="mb-1 fw-bold text-dark">Stock Levels Overview</h6>
          <p className="text-muted mb-0 small">Current vs Minimum Stock Levels</p>
        </div>
      </div>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ bottom: 40, left: 10, right: 10, top: 20 }}>
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
              dataKey="name" 
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
            <Bar dataKey="current" name="Current Stock" fill="url(#colorCurrent)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="min" name="Min Stock" fill="url(#colorMin)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-5 text-muted">
          <p className="small mb-0">No stock data available</p>
        </div>
      )}
    </div>
  );
};

export default StockChart;