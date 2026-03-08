import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomizedAxisTick = ({ x, y, payload }) => {
  const words = payload.value.split(' ');
  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word, index) => (
        <text key={index} x={0} y={index * 12} dy={16} textAnchor="middle" fill="#666" style={{ fontSize: '10px', fontWeight: '500' }}>
          {word}
        </text>
      ))}
    </g>
  );
};

const StockChart = ({ data = [] }) => (
  <div className="bg-white p-4 rounded shadow-sm border h-100">
    <h6 className="mb-3 fw-bold" style={{ color: '#7c5d47', fontSize: '13px' }}>Stock Levels (Current vs Min)</h6>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} height={60} tick={<CustomizedAxisTick />} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="current" name="Current Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="min" name="Min Stock" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default StockChart;