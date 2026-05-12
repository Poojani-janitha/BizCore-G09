import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, Bell, AlertCircle, TrendingDown, Phone, ExternalLink } from "react-feather";
import { useTranslation } from 'react-i18next';

const formatStock = (value) => {
    const num = parseFloat(value) || 0;
    return Number.isInteger(num) ? num : num.toFixed(2);
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language?.startsWith('si');

  useEffect(() => {
    fetchAlerts();
    fetchExpiryAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/inventory/dashboard-stats");
      if (res.data.success && res.data.alerts) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiryAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/production/stock-overview");
      if (res.data.success && res.data.wip) {
        // Filter approved batches that are expiring soon (within 60 days)
        const expiringSoon = res.data.wip
          .filter(batch => batch.Status === 'Approved')
          .filter(batch => batch.DaysToExpire !== null && batch.DaysToExpire <= 60)
          .sort((a, b) => (a.DaysToExpire || 999) - (b.DaysToExpire || 999));

        setExpiryAlerts(expiringSoon);
      }
    } catch (err) {
      console.error("Error fetching expiry alerts:", err);
    }
  };

  const getAlertType = (current, min) => {
    if (current <= 0) return "Out of Stock";
    if (current < min) return "Low Stock";
    return "Active";
  };

  // Separate critical and low stock (excluding critical from low stock)
  const criticalAlerts = alerts.filter(a => a.current <= 0);
  const lowStockAlerts = alerts.filter(a => a.current > 0 && a.current < a.min);
  const activeAlerts = lowStockAlerts.length;
  const totalAlerts = alerts.length;

  const getFilteredAlerts = () => {
    if (activeTab === "all") return alerts;
    if (activeTab === "low") return lowStockAlerts;
    if (activeTab === "expiry") return expiryAlerts;
    return [];
  };

  const filteredAlerts = getFilteredAlerts();

  const MetricCard = ({ title, value, subtitle, icon, borderColor }) => (
    <div className={`card border-0 border-top border-4 border-${borderColor} shadow-sm rounded-3 overflow-hidden`} style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="text-muted small fw-bold text-uppercase mb-0" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>{title}</h6>
          <span className={`text-${borderColor} opacity-75`}>{icon}</span>
        </div>
        <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '22px' }}>{value}</h5>
        <p className="text-muted small mb-0">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-light min-vh-100">


      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-lg-3 col-md-6">
          <MetricCard
            title={t('inventory.pages.alerts.metric_total')}
            value={totalAlerts}
            subtitle={t('inventory.pages.alerts.metric_total_sub')}
            icon={<Bell size={20} className="text-primary" />}
            borderColor="primary"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <MetricCard
            title={t('inventory.pages.alerts.metric_active')}
            value={activeAlerts}
            subtitle={t('inventory.pages.alerts.metric_active_sub')}
            icon={<AlertTriangle size={20} className="text-warning" />}
            borderColor="warning"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <MetricCard
            title={t('inventory.pages.alerts.metric_critical')}
            value={criticalAlerts.length}
            subtitle={t('inventory.pages.alerts.metric_critical_sub')}
            icon={<AlertCircle size={20} className="text-danger" />}
            borderColor="danger"
          />
        </div>
        <div className="col-lg-3 col-md-6">
          <MetricCard
            title={t('inventory.pages.alerts.metric_low')}
            value={lowStockAlerts.length}
            subtitle={t('inventory.pages.alerts.metric_low_sub')}
            icon={<TrendingDown size={20} className="text-info" />}
            borderColor="info"
          />
        </div>
      </div>

      {/* Alert Management Section */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-body p-4">
          <h6 className="fw-bold text-dark mb-2">{t('inventory.pages.alerts.mgmt_title')}</h6>
          <p className="text-muted small mb-3">{t('inventory.pages.alerts.mgmt_subtitle')}</p>

          {/* Tabs */}
          <div className="d-flex gap-0 mb-4 border-bottom" style={{ overflow: 'auto' }}>
            <button
              className={`btn btn-sm border-0 fw-semibold ${activeTab === "all"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
                } rounded-0 pb-2`}
              onClick={() => setActiveTab("all")}
              style={{ borderBottom: activeTab === "all" ? "3px solid #0d6efd" : "none" }}
            >
              {t('inventory.pages.alerts.tab_all')} ({totalAlerts})
            </button>
            <button
              className={`btn btn-sm border-0 fw-semibold ${activeTab === "low"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
                } rounded-0 pb-2 ms-3`}
              onClick={() => setActiveTab("low")}
              style={{ borderBottom: activeTab === "low" ? "3px solid #0d6efd" : "none" }}
            >
              {t('inventory.pages.alerts.tab_low')} ({lowStockAlerts.length})
            </button>
            <button
              className={`btn btn-sm border-0 fw-semibold ${activeTab === "expiry"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
                } rounded-0 pb-2 ms-3`}
              onClick={() => setActiveTab("expiry")}
              style={{ borderBottom: activeTab === "expiry" ? "3px solid #0d6efd" : "none" }}
            >
              {t('inventory.pages.alerts.tab_expiry')} ({expiryAlerts.length})
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredAlerts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {activeTab === "expiry" ? (
                      <>
                        <th className="fw-semibold text-dark ps-3">{t('inventory.pages.alerts.col_batch')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_product')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_prod_date')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_exp_date')}</th>
                        <th className="fw-semibold text-dark text-end">{t('inventory.pages.alerts.col_days')}</th>
                        <th className="fw-semibold text-dark text-end">{t('inventory.pages.alerts.col_qty')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_status')}</th>
                      </>
                    ) : (
                      <>
                        <th className="fw-semibold text-dark ps-3">{t('inventory.pages.alerts.col_alert_type')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_product')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_location')}</th>
                        <th className="fw-semibold text-dark text-end">{t('inventory.pages.alerts.col_current')}</th>
                        <th className="fw-semibold text-dark text-end">{t('inventory.pages.alerts.col_min')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_shortage')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_status')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_contact')}</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert, index) => {
                    if (activeTab === "expiry") {
                      // Expiry alerts table row
                      const daysToExpiry = alert.DaysToExpire || 0;
                      const statusBadge = daysToExpiry <= 7 ? "bg-danger" : daysToExpiry <= 30 ? "bg-warning text-dark" : "bg-info";
                      const formattedDate = (dateStr) => {
                        if (!dateStr) return 'N/A';
                        if (typeof dateStr === 'object') {
                          return new Date(dateStr).toLocaleDateString();
                        }
                        return dateStr;
                      };

                      return (
                        <tr key={index} className="border-bottom">
                          <td className="ps-3">
                            <span className="text-primary fw-semibold">{alert.Batch_No || 'N/A'}</span>
                          </td>
                          <td className="fw-semibold text-dark">{(isSinhala && alert.P_Name_Sinhala) ? alert.P_Name_Sinhala : (alert.P_Name || 'N/A')}</td>
                          <td className="text-muted">{formattedDate(alert.Production_Date)}</td>
                          <td className="text-muted">{formattedDate(alert.Exp_Date)}</td>
                          <td className="text-end fw-semibold text-danger">{daysToExpiry} days</td>
                          <td className="text-end">{formatStock(alert.Total_Qty_Produced || 0)} {alert.Base_Unit}</td>
                          <td>
                            <span className={`badge ${statusBadge}`}>
                              {daysToExpiry <= 7 ? `🔴 ${t('inventory.pages.alerts.badge_urgent')}` : daysToExpiry <= 30 ? `🟠 ${t('inventory.pages.alerts.badge_warning')}` : `🔵 ${t('inventory.pages.alerts.badge_soon')}`}
                            </span>
                          </td>
                        </tr>
                      );
                    } else {
                      // Stock alerts table row
                      const shortage = Math.max(0, alert.min - alert.current);
                      const alertType = getAlertType(alert.current, alert.min);
                      return (
                        <tr key={index} className="border-bottom">
                          <td className="ps-3">
                            {alertType === "Low Stock" ? (
                              <span className="badge bg-warning text-dark fw-bold">{t('inventory.pages.alerts.badge_low')}</span>
                            ) : alertType === "Out of Stock" ? (
                              <span className="badge bg-danger text-white fw-bold">{t('inventory.pages.alerts.badge_out')}</span>
                            ) : (
                              <span className="badge bg-secondary text-white fw-bold">{t('inventory.pages.alerts.badge_active')}</span>
                            )}
                          </td>
                          <td className="fw-semibold text-dark">{(isSinhala && alert.nameSinhala) ? alert.nameSinhala : alert.name}</td>
                          <td className="text-muted">{alert.type || 'N/A'}</td>
                          <td className="text-end fw-semibold text-danger">{formatStock(alert.current)} {alert.baseUnit}</td>
                          <td className="text-end">{formatStock(alert.min)} {alert.baseUnit}</td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark">{formatStock(shortage)} {alert.baseUnit}</span>
                          </td>
                          <td>
                            <small className="text-capitalize text-muted">
                              {alertType === "Low Stock" ? t('inventory.pages.alerts.status_low') : alertType}
                            </small>
                          </td>
                          <td>
                            {alert.supplierName ? (
                              <a href={alert.supplierPhone ? `tel:${alert.supplierPhone}` : '#'} className="text-primary small d-flex flex-column text-decoration-none" title={alert.supplierPhone ? `Call ${alert.supplierName}` : 'No phone number available'}>
                                <span className="fw-bold d-flex align-items-center gap-1">
                                  <Phone size={12} /> {alert.supplierName}
                                </span>
                                {alert.supplierPhone && <small className="text-muted" style={{ marginLeft: '16px', fontSize: '11px' }}>{alert.supplierPhone}</small>}
                              </a>
                            ) : (
                              <small className="text-muted">{t('inventory.pages.alerts.no_contact')}</small>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <AlertCircle size={48} className="text-success mb-2" />
              <h6 className="fw-bold text-dark">{t('inventory.pages.alerts.all_clear')}</h6>
              <p className="text-muted mb-0">{t('inventory.pages.alerts.no_alerts_cat')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;

