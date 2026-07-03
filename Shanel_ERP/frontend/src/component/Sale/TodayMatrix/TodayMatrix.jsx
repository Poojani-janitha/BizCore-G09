import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { API_ENDPOINTS } from '../../../config/apiEndpoints';

const TodayMatrix = () => {
  const [todayMatrixData, setTodayMatrixData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalDiscount: 0,
    totalTax: 0,
    totalTransactions: 0
  });

  const fetchTodayMatrixData = async () => {
    try {
      const response = await fetch('/api/sales-management/metrics/today');
      const data = await response.json();
      setTodayMatrixData({
        totalSales: data.totalSales,
        totalRevenue: data.totalRevenue,
        totalDiscount: data.totalDiscount,
        totalTax: data.totalTax,
        totalTransactions: data.totalTransactions
      });
    } catch (error) {
      console.error('Error fetching today matrix data:', error);

    }
  };

  useEffect(() => {
    fetchTodayMatrixData();
  }, []);

  return (
    <div>

    </div>
  )
}

export default TodayMatrix
