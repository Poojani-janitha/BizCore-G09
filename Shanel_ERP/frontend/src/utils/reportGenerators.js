import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const businessName = "Shanel ERP Solutions";

const fmt = (val) => {
  const num = parseFloat(val) || 0;
  return 'LKR ' + num.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const downloadProfitLossPDF = (data, period) => {
  try {
    console.log("Starting P&L PDF Generation...", data);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(18);
    doc.text(businessName, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text("Profit & Loss Statement", pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Period: ${period}`, pageWidth / 2, 32, { align: 'center' });

    let finalY = 40;

    // 1. Revenue (Operating + Other Income)
    const revenueBody = [
      ...data.operatingRevenue.map(r => [r.account_name, fmt(r.amount)])
    ];
    if (data.otherIncome && data.otherIncome.length > 0) {
      revenueBody.push([{ content: 'Other Income', styles: { fontStyle: 'bold', fillColor: [245, 245, 245] } }, '']);
      data.otherIncome.forEach(r => {
        revenueBody.push([`  ${r.account_name}`, fmt(r.amount)]);
      });
    }
    revenueBody.push([{ content: 'Total Revenue', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalRevenue), styles: { fontStyle: 'bold' } }]);

    autoTable(doc, {
      startY: finalY,
      head: [['Revenue', 'Amount']],
      body: revenueBody,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] }
    });
    finalY = doc.lastAutoTable.finalY + 5;

    // 2. Cost of Goods Sold
    autoTable(doc, {
      startY: finalY,
      head: [['Cost of Goods Sold (COGS)', 'Amount']],
      body: [
        ...data.cogs.map(c => [c.account_name, fmt(c.amount)]),
        [{ content: 'Total COGS', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalCOGS), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'striped',
      headStyles: { fillColor: [192, 57, 43] }
    });
    finalY = doc.lastAutoTable.finalY + 5;

    // Gross Profit Box
    doc.setFillColor(255, 243, 224); // Light orange
    doc.rect(14, finalY, pageWidth - 28, 10, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(230, 81, 0);
    doc.text(`GROSS PROFIT (${data.totals.grossMargin}% Margin)`, 18, finalY + 7);
    doc.text(fmt(data.totals.grossProfit), pageWidth - 18, finalY + 7, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    finalY += 15;

    // 3. Operating Expenses
    autoTable(doc, {
      startY: finalY,
      head: [['Operating Expenses', 'Amount']],
      body: [
        ...data.operatingExpenses.map(e => [e.account_name, fmt(e.amount)]),
        [{ content: 'Total Operating Expenses', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalOperatingExpenses), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'striped',
      headStyles: { fillColor: [243, 156, 18] }
    });
    finalY = doc.lastAutoTable.finalY + 5;

    // 4. Discounts & Returns (Contra Revenue)
    if (data.contraRevenue && data.contraRevenue.length > 0) {
      autoTable(doc, {
        startY: finalY,
        head: [['Discounts & Returns', 'Amount']],
        body: [
          ...data.contraRevenue.map(c => [c.account_name, fmt(c.amount)]),
          [{ content: 'Total Discounts & Returns', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalContraRevenue), styles: { fontStyle: 'bold' } }]
        ],
        theme: 'striped',
        headStyles: { fillColor: [236, 72, 153] } // Pink
      });
      finalY = doc.lastAutoTable.finalY + 5;
    }

    // Net Profit Box
    const isProfit = data.totals.netProfit >= 0;
    doc.setFillColor(isProfit ? 232 : 255, isProfit ? 245 : 235, isProfit ? 233 : 238); 
    doc.rect(14, finalY, pageWidth - 28, 12, 'F');
    doc.setFontSize(12);
    doc.setTextColor(isProfit ? 46 : 192, isProfit ? 125 : 57, isProfit ? 50 : 43);
    doc.text("NET PROFIT", 18, finalY + 8);
    doc.text(fmt(data.totals.netProfit), pageWidth - 18, finalY + 8, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Net Profit Margin: ${data.totals.profitMargin}%`, pageWidth / 2, finalY + 20, { align: 'center' });

    doc.save(`Profit_Loss_${period.replace(/ /g, '_')}.pdf`);
    console.log("P&L PDF Saved Successfully");
  } catch (err) {
    console.error("PDF Generation Error (P&L):", err);
    alert("Failed to generate PDF. Please check the console for details.");
  }
};

export const downloadBalanceSheetPDF = (data, date) => {
  try {
    console.log("Starting Balance Sheet PDF Generation...", data);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(18);
    doc.text(businessName, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text("Balance Sheet", pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`As at: ${date}`, pageWidth / 2, 32, { align: 'center' });

    let finalY = 40;

    // ASSETS
    doc.setFont("helvetica", "bold");
    doc.text("ASSETS", 14, finalY);
    finalY += 5;

    autoTable(doc, {
      startY: finalY,
      head: [['Current Assets', 'Balance']],
      body: [
        ...data.currentAssets.map(a => [a.account_name, fmt(a.balance)]),
        [{ content: 'Total Current Assets', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalCurrentAssets), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] }
    });
    finalY = doc.lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: finalY,
      head: [['Non-Current Assets', 'Balance']],
      body: [
        ...data.nonCurrentAssets.map(a => [a.account_name, fmt(a.balance)]),
        [{ content: 'Total Non-Current Assets', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalNonCurrentAssets), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] }
    });
    finalY = doc.lastAutoTable.finalY + 5;

    doc.setFont("helvetica", "bold");
    doc.text("TOTAL ASSETS", 14, finalY);
    doc.text(fmt(data.totals.totalAssets), pageWidth - 14, finalY, { align: 'right' });
    finalY += 10;

    // LIABILITIES
    doc.setFont("helvetica", "bold");
    doc.text("LIABILITIES", 14, finalY);
    finalY += 5;

    autoTable(doc, {
      startY: finalY,
      head: [['Current Liabilities', 'Balance']],
      body: [
        ...data.currentLiabilities.map(l => [l.account_name, fmt(l.balance)]),
        [{ content: 'Total Current Liabilities', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalCurrentLiabilities), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'grid',
      headStyles: { fillColor: [231, 76, 60] }
    });
    finalY = doc.lastAutoTable.finalY + 5;

    autoTable(doc, {
      startY: finalY,
      head: [['Non-Current Liabilities', 'Balance']],
      body: [
        ...data.nonCurrentLiabilities.map(l => [l.account_name, fmt(l.balance)]),
        [{ content: 'Total Non-Current Liabilities', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalNonCurrentLiabilities), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'grid',
      headStyles: { fillColor: [192, 57, 43] }
    });
    finalY = doc.lastAutoTable.finalY + 5;

    // EQUITY
    autoTable(doc, {
      startY: finalY,
      head: [['Equity', 'Balance']],
      body: [
        ...data.equity.map(e => [e.account_name, fmt(e.balance)]),
        [{ content: 'Total Equity', styles: { fontStyle: 'bold' } }, { content: fmt(data.totals.totalEquity), styles: { fontStyle: 'bold' } }]
      ],
      theme: 'grid',
      headStyles: { fillColor: [142, 68, 173] }
    });
    finalY = doc.lastAutoTable.finalY + 10;

    // Footer summary
    doc.setFillColor(240, 240, 240);
    doc.rect(14, finalY, pageWidth - 28, 12, 'F');
    doc.setFontSize(11);
    doc.text("TOTAL LIABILITIES + EQUITY", 18, finalY + 8);
    doc.text(fmt(data.totals.totalLiabilitiesAndEquity), pageWidth - 18, finalY + 8, { align: 'right' });

    doc.save(`Balance_Sheet_${date}.pdf`);
    console.log("Balance Sheet PDF Saved Successfully");
  } catch (err) {
    console.error("PDF Generation Error (Balance Sheet):", err);
    alert("Failed to generate PDF. Please check the console for details.");
  }
};

export const downloadPeriodTransactionsPDF = (data) => {
  try {
    const { periodName, startDate, endDate, transactions } = data;
    console.log(`Starting PDF generation for period ${periodName} transactions...`, transactions);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFontSize(18);
    doc.text(businessName, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Transactions Report - Period: ${periodName}`, pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Date Range: ${startDate} to ${endDate}`, pageWidth / 2, 32, { align: 'center' });

    let finalY = 40;

    // Prepare table lines
    const rows = [];
    transactions.forEach(entry => {
      entry.Lines.forEach((line, idx) => {
        rows.push([
          idx === 0 ? entry.Entry_Date : '',
          idx === 0 ? entry.Journal_No : '',
          idx === 0 ? entry.Description : '',
          `${line.Account?.Account_Name} (${line.Account?.Account_Code})`,
          parseFloat(line.Debit_Amount) > 0 ? fmt(line.Debit_Amount) : '—',
          parseFloat(line.Credit_Amount) > 0 ? fmt(line.Credit_Amount) : '—',
        ]);
      });
    });

    if (rows.length === 0) {
      rows.push([
        { content: 'No transactions found in this period.', colSpan: 6, styles: { halign: 'center', fontStyle: 'italic' } }
      ]);
    }

    autoTable(doc, {
      startY: finalY,
      head: [['Date', 'JE Number', 'Description', 'Account', 'Debit', 'Credit']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 28 },
        2: { cellWidth: 40 },
        3: { cellWidth: 50 },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' }
      }
    });

    doc.save(`Period_${periodName}_Transactions.pdf`);
    console.log("Period transactions PDF saved successfully");
  } catch (err) {
    console.error("PDF Generation Error (Period Transactions):", err);
    alert("Failed to generate PDF. Please check the console for details.");
  }
};
