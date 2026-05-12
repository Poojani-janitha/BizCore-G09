/**
 * MetricsCard Component
 * 
 * Reusable card for displaying dashboard metrics
 * Supports icons, trends, custom colors, and loading states
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'react-feather';
import './MetricsCard.css';

const MetricsCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary',
    trend = null,
    trendValue = null,
    trendDirection = 'up',
    loading = false,
    onClick = null,
    subtitle = null
}) => {
    if (loading) {
        return (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <div className="placeholder-glow">
                    <span className="placeholder placeholder-lg col-12 rounded-3 mb-3"></span>
                    <span className="placeholder placeholder-sm col-8 rounded-2"></span>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`card border-0 shadow-sm rounded-4 p-4 bg-white h-100 transition-all ${onClick ? 'cursor-pointer hover-lift' : ''}`}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {/* Header with Icon and Trend */}
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div className={`p-3 rounded-3 bg-${color}-subtle text-${color}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`d-flex align-items-center gap-1 small fw-bold ${trendDirection === 'up' ? 'text-success' : 'text-danger'}`}>
                        {trendDirection === 'up' ? (
                            <ArrowUpRight size={14} />
                        ) : (
                            <ArrowDownRight size={14} />
                        )}
                        <span>{trendValue}%</span>
                    </div>
                )}
            </div>

            {/* Title */}
            <p 
                className="text-muted small fw-bold text-uppercase mb-2" 
                style={{ fontSize: '10px', letterSpacing: '0.5px' }}
            >
                {title}
            </p>

            {/* Main Value */}
            <h4 className="fw-bold text-dark mb-1">{value}</h4>

            {/* Optional Subtitle */}
            {subtitle && (
                <p className="text-muted small mb-0">{subtitle}</p>
            )}
        </div>
    );
};

export default MetricsCard;
