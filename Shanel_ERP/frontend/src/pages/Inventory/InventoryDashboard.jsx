import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Package, Clock, TrendingDown } from "react-feather";
import StockChart from "../../component/Inventory/Dashboard/StockChart";
import StockAlerts from "../../component/Inventory/Dashboard/StockAlerts";
import StockTransfers from "../../component/Inventory/Dashboard/StockTransfers";
import InventoryMetrics from "../../component/Inventory/Dashboard/InventoryMetrics";
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { useTranslation } from "react-i18next";

const InventoryDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    stockLevel: [],
    distribution: [],
    alerts: [],
    transfers: [],
    summary: {}
  });
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const fetchData = async () => {
    try {
      const [dashRes, prodRes, productsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.inventory.dashboardStats),
        axios.get(API_ENDPOINTS.production.stockOverview),
        axios.get(API_ENDPOINTS.inventory.products)
      ]);

      if (dashRes.data.success) {
        setData(dashRes.data);
        setError(null);
      }

      // Expiry alerts — approved batches expiring within 60 days
      if (prodRes.data.success && prodRes.data.wip) {
        const expiring = prodRes.data.wip
          .filter(b => b.Status === 'Approved' && b.DaysToExpire !== null && b.DaysToExpire <= 60);
        setExpiryAlerts(expiring);
      }

      // Out of stock products
      if (Array.isArray(productsRes.data)) {
        setOutOfStockProducts(productsRes.data.filter(p => parseFloat(p.stockCount || 0) <= 0));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Derive the 4 alert categories
  const alerts = data.alerts || [];
  const lowStockAlerts  = alerts.filter(a => a.current > 0 && a.current < a.min);
  const criticalAlerts  = alerts.filter(a => a.current === 0 || a.current < a.min / 2);
  const productionAlerts = alerts.filter(a => a.type === 'Company');

  // Alert box config — one per category
  const alertBoxes = [
    {
      key: 'low',
      label: 'Low Stock',
      count: lowStockAlerts.length,
      icon: <TrendingDown size={20} />,
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fcd34d',
      tab: 'low',
    },
    {
      key: 'out',
      label: 'Out of Stock',
      count: outOfStockProducts.length,
      icon: <Package size={20} />,
      color: '#dc2626',
      bg: '#fef2f2',
      border: '#fca5a5',
      tab: 'out-of-stock',
    },
    {
      key: 'expiry',
      label: 'Expiring Soon',
      count: expiryAlerts.length,
      icon: <Clock size={20} />,
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#c4b5fd',
      tab: 'expiry',
    },
    {
      key: 'production',
      label: 'Production Stock',
      count: productionAlerts.length,
      icon: <AlertTriangle size={20} />,
      color: '#0369a1',
      bg: '#eff6ff',
      border: '#93c5fd',
      tab: 'production',
    },
  ];

  const hasAnyAlerts = alertBoxes.some(b => b.count > 0);

  return (
    <div className="min-vh-100 bg-light p-4">

      {/* Error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-3 small" role="alert">
          <strong>{t('inventory.dashboard.error_prefix')}</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">{t('inventory.dashboard.loading')}</span>
          </div>
          <p className="text-muted">{t('inventory.dashboard.loading')}</p>
        </div>
      ) : (
        <>
          {/* ── 4 Alert Category Boxes ── */}
          {hasAnyAlerts && (
            <div className="row g-3 mb-4">
              {alertBoxes.map(box => (
                <div key={box.key} className="col-lg-3 col-md-6">
                  <div
                    className="rounded-3 px-4 py-3 d-flex align-items-center gap-3"
                    style={{
                      background: box.bg,
                      border: `1px solid ${box.border}`,
                      cursor: box.count > 0 ? 'pointer' : 'default',
                      opacity: box.count === 0 ? 0.45 : 1,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}
                    onClick={() => box.count > 0 && navigate(`/inventory/alerts?tab=${box.tab}`)}
                    onMouseEnter={e => { if (box.count > 0) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${box.border}88`; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* Icon */}
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 44, height: 44, background: `${box.border}55`, color: box.color }}
                    >
                      {box.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-grow-1 min-width-0">
                      <p className="mb-0 small fw-semibold text-uppercase" style={{ color: box.color, letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                        {box.label}
                      </p>
                      <p className="mb-0 fw-bold" style={{ fontSize: '1.45rem', color: box.color, lineHeight: 1.1 }}>
                        {box.count}
                        <span className="fw-normal ms-1" style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {box.count === 1 ? 'item' : 'items'}
                        </span>
                      </p>
                    </div>

                    {/* Arrow */}
                    {box.count > 0 && (
                      <span style={{ color: box.color, fontSize: '1rem', opacity: 0.7 }}>→</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Metrics */}
          <div className="mb-4">
            <InventoryMetrics metrics={data.summary} />
          </div>

          {/* Charts Section — full width stock chart, no pie */}
          <div className="mb-4">
            <StockChart data={data.stockLevel} />
          </div>

          {/* Lists Section */}
          <div className="row g-4">
            <div className="col-lg-6">
              <StockAlerts alerts={data.alerts ? data.alerts.slice(0, 5) : []} />
            </div>
            <div className="col-lg-6">
              <StockTransfers transfers={data.transfers} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryDashboard;
