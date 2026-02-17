import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Inventory_Dashboard = () => {
  const [data, setData] = useState({ stockLevel: [], distribution: [] });
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  useEffect(() => {
    //Fetch live data from Node.js backend
    axios.get('http://localhost:5000/api/inventory/dashboard-stats')
    .then(res =>{
      console.log("Backend data fetched:", res.data);
      setData(res.data);
    })
    .catch(err => console.error("Error fetching dashboard data:", err));
  }, []);

  return (
    <div className='p-4' style={{ backgroundColor: '#faf9f6', minHeight: '100vh' }}>
      <h2 className='mb-4 fw-bold' style={{color: '#7c5d47'}}>Inventory Overview</h2>

      <div className='row g-4'>
        {/* Bar chart for stock vs Min levels */}
        <div className='col-md-8'>
          <div className='bg-white p-4 rounded shadow-sm border'>
            <h5 className='mb-3'>Stock levels(Current vs Min)</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.stockLevel}>
                <CartesianGrid strokeDasharray="3.3" vertical={false}/>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="current" name="Current Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="min" name="Min Stock" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart  to Product Type Distribution */}
        <div className='col-md-4'>
          <div className='bg-white p-4 rounded shadow-sm border'>
            <h5 className='mb-3'>Inventory Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.distribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.distribution.map((entry, index) =>(
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory_Dashboard