import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DistributionPie = ({ data }) => {
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="bg-white p-4 rounded shadow-sm border h-100">
      <h5 className="mb-3 fw-bold" style={{ color: '#7c5d47' }}>Inventory Distribution</h5>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionPie;