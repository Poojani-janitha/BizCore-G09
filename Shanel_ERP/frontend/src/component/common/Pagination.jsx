import React from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';

/**
 * Reusable Pagination component
 * Props:
 *   currentPage  – 1-based current page
 *   totalItems   – total number of records
 *   pageSize     – records per page
 *   onPageChange – (newPage) => void
 *   onPageSizeChange – (newSize) => void  (optional)
 *   pageSizeOptions  – array of numbers   (optional, default [10,25,50,100])
 */
const Pagination = ({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 25, 50, 100],
}) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem   = Math.min(currentPage * pageSize, totalItems);

    // Build page number buttons (show max 5 pages around current)
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;
        const left  = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);

        if (left > 1) {
            pages.push(1);
            if (left > 2) pages.push('...');
        }
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < totalPages) {
            if (right < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    if (totalItems === 0) return null;

    return (
        <div
            className="d-flex align-items-center justify-content-between flex-wrap gap-3 px-1 pt-3 pb-1"
            style={{ fontSize: '13px' }}
        >
            {/* Left: showing X – Y of Z */}
            <span className="text-muted small">
                Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{' '}
                <strong>{totalItems}</strong> records
            </span>

            {/* Centre: page buttons */}
            <div className="d-flex align-items-center gap-1">
                {/* Prev */}
                <button
                    className="btn btn-sm btn-light border rounded-2 px-2 py-1"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    title="Previous page"
                >
                    <ChevronLeft size={14} />
                </button>

                {getPageNumbers().map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-muted">…</span>
                    ) : (
                        <button
                            key={p}
                            className={`btn btn-sm rounded-2 px-3 py-1 ${
                                p === currentPage
                                    ? 'btn-dark text-white'
                                    : 'btn-light border'
                            }`}
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    className="btn btn-sm btn-light border rounded-2 px-2 py-1"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    title="Next page"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Right: rows per page */}
            {onPageSizeChange && (
                <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Rows per page</span>
                    <select
                        className="form-select form-select-sm border rounded-2"
                        style={{ width: '70px' }}
                        value={pageSize}
                        onChange={(e) => {
                            onPageSizeChange(Number(e.target.value));
                            onPageChange(1); // reset to first page
                        }}
                    >
                        {pageSizeOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default Pagination;
