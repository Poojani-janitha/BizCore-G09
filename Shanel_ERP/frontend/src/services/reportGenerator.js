//Reusable PDF generation service for all reports

import jsPDF from 'jspdf';

export const generatePDF = (title, columns, data, fileName) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for wider tables
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;

    // Color scheme
    const headerColor = [249, 115, 22]; // Shanel Orange (#f97316)
    const lightGray = [245, 245, 245];

    // ===== PAGE HEADER SECTION =====
    // Header background
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Company Name
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('SHANEL PRODUCT', margin, 15);

    // ===== REPORT INFO SECTION =====
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const reportDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const reportTime = new Date().toLocaleTimeString();

    doc.text(`Report: ${title}`, margin, 32);
    doc.text(`Generated: ${reportDate}`, margin, 37);
    doc.text(`Time: ${reportTime}`, margin, 42);

    // Total Records
    const totalRecords = data.length;
    doc.text(`Total Records: ${totalRecords}`, pageWidth - margin - 40, 32);

    // Separator line
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(margin, 45, pageWidth - margin, 45);

    // ===== CREATE TABLE MANUALLY =====
    const colWidth = (pageWidth - 2 * margin) / columns.length;
    let yPosition = 50;
    const rowHeight = 7;
    const pageHeightLimit = doc.internal.pageSize.getHeight() - 15;

    // Format column headers
    const formattedHeaders = columns.map(col => 
        col
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    );

    // Draw table header
    doc.setFillColor(249, 115, 22);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);

    formattedHeaders.forEach((header, idx) => {
        const xPos = margin + idx * colWidth;
        doc.text(header, xPos + 2, yPosition + 5, { maxWidth: colWidth - 4, align: 'left' });
    });

    yPosition += rowHeight;

    // Draw table body
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    data.forEach((row, rowIdx) => {
        // Check if we need a new page
        if (yPosition > pageHeightLimit) {
            doc.addPage();
            yPosition = margin;

            // Repeat header on new page
            doc.setFillColor(249, 115, 22);
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.setFontSize(9);

            formattedHeaders.forEach((header, idx) => {
                const xPos = margin + idx * colWidth;
                doc.text(header, xPos + 2, yPosition + 5, { maxWidth: colWidth - 4, align: 'left' });
            });

            yPosition += rowHeight;
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'normal');
        }

        // Alternate row colors
        if (rowIdx % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPosition, pageWidth - 2 * margin, rowHeight, 'F');
        }

        // Draw row data
        columns.forEach((col, colIdx) => {
            const xPos = margin + colIdx * colWidth;
            const value = row[col];
            let displayValue = '-';

            if (value !== null && value !== undefined) {
                if (typeof value === 'number') {
                    if (col.includes('Amount') || col.includes('Spent') || col.includes('Price') || col.includes('Cost')) {
                        displayValue = value.toFixed(2);
                    } else if (col.includes('Days')) {
                        displayValue = value.toFixed(0);
                    } else {
                        displayValue = value.toFixed(2);
                    }
                } else {
                    displayValue = String(value);
                }
            }

            // Right align numbers
            const isNumeric = typeof row[col] === 'number';
            const align = isNumeric ? 'right' : 'left';
            const offset = isNumeric ? colWidth - 2 : 2;

            doc.text(displayValue, xPos + offset, yPosition + 5, { maxWidth: colWidth - 4, align });
        });

        // Draw row border
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.2);
        doc.line(margin, yPosition + rowHeight, pageWidth - margin, yPosition + rowHeight);

        yPosition += rowHeight;
    });

    // ===== FOOTER SECTION =====
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Shanel Product - Inventory Management System', margin, yPosition + 12);
    doc.text('Confidential - For Internal Use Only', margin, yPosition + 16);

    // ===== SAVE PDF =====
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`${fileName}_${timestamp}.pdf`);
};