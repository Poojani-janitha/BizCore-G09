import React, { useState, useEffect } from "react";
import axios from "axios";
import { AlertTriangle, Bell, AlertCircle, TrendingDown, Phone, ExternalLink } from "react-feather";
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Pagination from '../../component/common/Pagination';

const formatStock = (value) => {
    const num = parseFloat(value) || 0;
    return Number.isInteger(num) ? num : num.toFixed(2);
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("low");
  const [alertsPage, setAlertsPage] = useState(1);
  const [alertsPageSize, setAlertsPageSize] = useState(25);
  const PAGE_SIZE = alertsPageSize;
  const { t, i18n } = useTranslation();
  const isSinhala = i18n.language?.startsWith('si');
  const location = useLocation();

  // Read ?tab= from URL on mount and whenever URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
      setAlertsPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    fetchAlerts();
    fetchExpiryAlerts();
    fetchOutOfStockProducts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.inventory.dashboardStats);
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
      const res = await axios.get(API_ENDPOINTS.production.stockOverview);
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

  // const fetchProductExpiryAlerts = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:5000/api/inventory/products");
  //     if (Array.isArray(res.data)) {
  //       const today = new Date();
  //       today.setHours(0, 0, 0, 0);

  //       // Filter products expiring within 3 months (90 days) for Other/Raw/Company-Ishara items
  //       const expiringProducts = res.data
  //         .filter(p => p.expireDate && (p.type === 'Other' || p.type === 'Raw' || (p.type === 'Company' && p.isIsharaProduct)))
  //         .map(p => {
  //           const expDate = new Date(p.expireDate);
  //           expDate.setHours(0, 0, 0, 0);
  //           const daysUntilExpiry = Math.floor((expDate - today) / (1000 * 60 * 60 * 24));
  //           return { ...p, daysUntilExpiry };
  //         })
  //         .filter(p => p.daysUntilExpiry >= 0 && p.daysUntilExpiry <= 90)
  //         .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  //       setProductExpiryAlerts(expiringProducts);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching product expiry alerts:", err);
  //   }
  // };

  const fetchOutOfStockProducts = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.inventory.products);
      if (Array.isArray(res.data)) {
        const outOfStock = res.data
          .filter(p => parseFloat(p.stockCount || 0) <= 0)
          .sort((a, b) => a.name.localeCompare(b.name));
        setOutOfStockProducts(outOfStock);
      }
    } catch (err) {
      console.error("Error fetching out of stock products:", err);
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
  // Remove out of stock items from the main alerts display (they go only to the dedicated tab)
  const filteredMainAlerts = alerts.filter(a => a.current > 0);
  const activeAlerts = lowStockAlerts.length;
  const productionAlerts = alerts.filter(a => a.type === 'Company');
  const totalAlerts = filteredMainAlerts.length + expiryAlerts.length + outOfStockProducts.length;

  const getFilteredAlerts = () => {
    if (activeTab === "low") return lowStockAlerts;
    if (activeTab === "expiry") return expiryAlerts;
    if (activeTab === "out-of-stock") return outOfStockProducts;
    if (activeTab === "production") return productionAlerts;
    return [];
  };

  const filteredAlerts = getFilteredAlerts();
  const pagedAlerts = filteredAlerts.slice((alertsPage - 1) * PAGE_SIZE, alertsPage * PAGE_SIZE);

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
              className={`btn btn-sm border-0 fw-semibold ${activeTab === "low"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
                } rounded-0 pb-2`}
              onClick={() => { setActiveTab("low"); setAlertsPage(1); }}
              style={{ borderBottom: activeTab === "low" ? "3px solid #0d6efd" : "none" }}
            >
              {t('inventory.pages.alerts.tab_low')} ({lowStockAlerts.length})
            </button>
            <button
              className={`btn btn-sm border-0 fw-semibold ${activeTab === "expiry"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
                } rounded-0 pb-2 ms-3`}
              onClick={() => { setActiveTab("expiry"); setAlertsPage(1); }}
              style={{ borderBottom: activeTab === "expiry" ? "3px solid #0d6efd" : "none" }}
            >
              {t('inventory.pages.alerts.tab_expiry')} ({expiryAlerts.length})
            </button>
            <button
              className={`btn btn-sm border-0 fw-semibold ${activeTab === "production"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
                } rounded-0 pb-2 ms-3`}
              onClick={() => { setActiveTab("production"); setAlertsPage(1); }}
              style={{ borderBottom: activeTab === "production" ? "3px solid #0d6efd" : "none" }}
            >
              Production Stock ({productionAlerts.length})
            </button>
            {/* <button
              className={`btn btn-sm border-0 fw-semibold ${activeTab === "product-expiry"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
                } rounded-0 pb-2 ms-3`}
              onClick={() => setActiveTab("product-expiry")}
              style={{ borderBottom: activeTab === "product-expiry" ? "3px solid #0d6efd" : "none" }}
            >
              Expire Soon (Other Items) ({productExpiryAlerts.length})
            </button> */}
            <button
              className={`btn btn-sm border-0 fw-semibold ${activeTab === "out-of-stock"
                  ? "border-bottom border-primary text-primary"
                  : "text-muted"
                } rounded-0 pb-2 ms-3`}
              onClick={() => { setActiveTab("out-of-stock"); setAlertsPage(1); }}
              style={{ borderBottom: activeTab === "out-of-stock" ? "3px solid #0d6efd" : "none" }}
            >
              Out of Stock ({outOfStockProducts.length})
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
            <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead>                  <tr style={{ background: '#f8fafc' }}>
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
                    ) : activeTab === "out-of-stock" ? (
                      <>
                        <th className="fw-semibold text-dark ps-3">{t('inventory.table.col_id')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.table.col_name')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.table.col_type')}</th>
                        <th className="fw-semibold text-dark">{t('inventory.table.col_category')}</th>
                        <th className="fw-semibold text-dark text-end">{t('inventory.table.col_stock')}</th>
                        <th className="fw-semibold text-dark text-end">Min. Stock</th>
                        <th className="fw-semibold text-dark">{t('inventory.pages.alerts.col_status')}</th>
                      </>
                    ) : activeTab === "production" ? (
                      <>
                        <th className="fw-semibold text-dark ps-3">PRODUCT</th>
                        <th className="fw-semibold text-dark">CURRENT STOCK</th>
                        <th className="fw-semibold text-dark text-end">MIN. STOCK</th>
                        <th className="fw-semibold text-dark text-end">SHORTAGE</th>
                        <th className="fw-semibold text-dark">SEVERITY</th>
                        <th className="fw-semibold text-dark">SUPPLIER</th>
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
                  {pagedAlerts.map((alert, index) => {
                    if (activeTab === "product-expiry") {
                      // Product expiry alerts table row
                      return (
                        <tr key={index} className="border-bottom">
                          <td className="ps-3 fw-semibold text-primary">{alert.id}</td>
                          <td className="fw-semibold text-dark">{(isSinhala && alert.nameSinhala) ? alert.nameSinhala : alert.name}</td>
                          <td>
                            <span className={`badge ${alert.type === 'Company' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'} border px-2 py-1`}>
                              {alert.type}
                            </span>
                          </td>
                          <td className="text-center">
                            <span style={{ color: alert.daysUntilExpiry <= 90 ? '#dc3545' : '#6c757d', fontWeight: alert.daysUntilExpiry <= 90 ? 'bold' : 'normal' }}>
                              {alert.expireDate ? new Date(alert.expireDate).toLocaleDateString('en-LK') : 'N/A'}
                            </span>
                          </td>
                          <td className="text-end fw-semibold" style={{ color: alert.daysUntilExpiry <= 30 ? '#dc3545' : alert.daysUntilExpiry <= 60 ? '#fd7e14' : '#0dcaf0' }}>
                            {alert.daysUntilExpiry} days
                          </td>
                          <td className="text-end">{formatStock(alert.stockCount)} {alert.baseUnit || ''}</td>
                          <td>
                            <span className={`badge ${alert.daysUntilExpiry <= 30 ? 'bg-danger' : alert.daysUntilExpiry <= 60 ? 'bg-warning text-dark' : 'bg-info'}`}>
                              {alert.daysUntilExpiry <= 30 ? '🔴 URGENT' : alert.daysUntilExpiry <= 60 ? '🟠 WARNING' : '🔵 SOON'}
                            </span>
                          </td>
                        </tr>
                      );
                    } else if (activeTab === "out-of-stock") {
                      // Out of stock products table row
                      return (
                        <tr key={index} className="border-bottom">
                          <td className="ps-3 fw-semibold text-primary">{alert.id}</td>
                          <td className="fw-semibold text-dark">{(isSinhala && alert.nameSinhala) ? alert.nameSinhala : alert.name}</td>
                          <td>
                            <span className={`badge ${alert.type === 'Company' ? 'bg-info-subtle text-info' : alert.type === 'Raw' ? 'bg-warning-subtle text-warning' : 'bg-secondary-subtle text-secondary'} border px-2 py-1`}>
                              {alert.type}
                            </span>
                          </td>
                          <td className="text-muted">{alert.category || 'N/A'}</td>
                          <td className="text-end fw-semibold text-danger">{formatStock(alert.stockCount)} {alert.baseUnit || ''}</td>
                          <td className="text-end">{formatStock(alert.minStockLevel || 0)} {alert.baseUnit || ''}</td>
                          <td>
                            <span className="badge bg-danger text-white fw-bold">🔴 OUT OF STOCK</span>
                          </td>
                        </tr>
                      );
                    } else if (activeTab === "expiry") {
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
                    } else if (activeTab === "production") {
                      // Production stock alerts row
                      const shortage = Math.max(0, alert.min - alert.current);
                      const isCritical = alert.current <= 0;
                      const isLow = alert.current > 0 && alert.current < alert.min;
                      return (
                        <tr key={index} className="border-bottom">
                          <td className="ps-3 fw-semibold text-dark">
                            {(isSinhala && alert.nameSinhala) ? alert.nameSinhala : alert.name}
                          </td>
                          <td>
                            <span className={isCritical ? 'text-danger fw-bold' : 'text-warning fw-bold'}>
                              {formatStock(alert.current)} {alert.baseUnit}
                            </span>
                          </td>
                          <td className="text-end">{formatStock(alert.min)} {alert.baseUnit}</td>
                          <td className="text-end fw-bold text-danger">{formatStock(shortage)} {alert.baseUnit}</td>
                          <td>
                            {isCritical
                              ? <span className="badge bg-danger fw-bold">🔴 OUT OF STOCK</span>
                              : <span className="badge bg-warning text-dark fw-bold">🟡 LOW STOCK</span>
                            }
                          </td>
                          <td>
                            {alert.supplierName ? (
                              <a href={alert.supplierPhone ? `tel:${alert.supplierPhone}` : '#'} className="text-primary small d-flex flex-column text-decoration-none">
                                <span className="fw-bold d-flex align-items-center gap-1">
                                  <Phone size={12} /> {alert.supplierName}
                                </span>
                                {alert.supplierPhone && <small className="text-muted" style={{ marginLeft: '16px', fontSize: '11px' }}>{alert.supplierPhone}</small>}
                              </a>
                            ) : (
                              <small className="text-muted">No supplier</small>
                            )}
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
            <Pagination
              currentPage={alertsPage}
              totalItems={filteredAlerts.length}
              pageSize={PAGE_SIZE}
              onPageChange={setAlertsPage}
              onPageSizeChange={(size) => { setAlertsPageSize(size); setAlertsPage(1); }}
            />
            </>
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

