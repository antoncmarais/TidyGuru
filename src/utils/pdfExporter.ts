import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { SalesData } from "./csvParser";
import { format } from "date-fns";

interface ExportMetrics {
  grossSales: string;
  totalRefunds: string;
  netRevenue: string;
  ordersCount: string;
  avgOrderValue: string;
  bestProduct?: string;
  bestProductRevenue?: string;
  conversionRate?: string;
  totalQuantity?: string;
}

// Helper function to draw a mini line chart
const drawMiniLineChart = (
  doc: jsPDF,
  data: { date: Date; value: number }[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: number[]
) => {
  if (data.length < 2) return;

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  // Draw chart area background
  doc.setFillColor(250, 250, 252);
  doc.rect(x, y, width, height, "F");

  // Draw grid lines
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  for (let i = 0; i <= 4; i++) {
    const gridY = y + (height / 4) * i;
    doc.line(x, gridY, x + width, gridY);
  }

  // Draw line
  doc.setDrawColor(...color);
  doc.setLineWidth(1.5);
  
  const points = data.map((d, i) => ({
    x: x + (width / (data.length - 1)) * i,
    y: y + height - ((d.value - minValue) / range) * height,
  }));

  for (let i = 0; i < points.length - 1; i++) {
    doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }

  // Draw points
  doc.setFillColor(...color);
  points.forEach((point) => {
    doc.circle(point.x, point.y, 1, "F");
  });
};

// Helper function to draw a mini bar chart
const drawMiniBarChart = (
  doc: jsPDF,
  data: { label: string; value: number }[],
  x: number,
  y: number,
  width: number,
  height: number,
  color: number[]
) => {
  if (data.length === 0) return;

  const maxValue = Math.max(...data.map((d) => d.value));
  const barWidth = (width - (data.length + 1) * 2) / data.length;

  // Draw chart area background
  doc.setFillColor(250, 250, 252);
  doc.rect(x, y, width, height, "F");

  // Draw bars
  data.forEach((item, i) => {
    const barHeight = (item.value / maxValue) * height * 0.9;
    const barX = x + 2 + i * (barWidth + 2);
    const barY = y + height - barHeight;

    // Bar with gradient effect (lighter at top)
    doc.setFillColor(...color);
    doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, "F");

    // Bar label (if space)
    if (barWidth > 8) {
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      const labelText = item.label.substring(0, 6);
      doc.text(labelText, barX + barWidth / 2, y + height + 3, {
        align: "center",
      });
    }
  });
};

export const exportToPDF = (
  data: SalesData[],
  metrics: ExportMetrics,
  fileName: string
): void => {
  try {
    if (!data || data.length === 0) {
      throw new Error("No data to export");
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Color palette matching dashboard
    const colors = {
      primary: [79, 70, 229],      // Indigo
      primaryLight: [129, 120, 255], // Light indigo
      success: [34, 197, 94],      // Green
      successLight: [134, 239, 172], // Light green
      danger: [239, 68, 68],       // Red
      dangerLight: [252, 165, 165], // Light red
      warning: [245, 158, 11],     // Amber
      warningLight: [253, 230, 138], // Light amber
      info: [59, 130, 246],        // Blue
      infoLight: [147, 197, 253],  // Light blue
      dark: [15, 23, 42],          // Slate-900
      gray: [100, 116, 139],       // Slate-500
      lightGray: [241, 245, 249],  // Slate-100
      white: [255, 255, 255],
      bgGray: [248, 250, 252],     // Background gray
    };

    // ===== HEADER SECTION =====
    // Gradient-like header effect
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 50, "F");
    
    // Subtle accent line
    doc.setFillColor(...colors.primaryLight);
    doc.rect(0, 46, pageWidth, 4, "F");

    // Company name with modern styling
    doc.setTextColor(...colors.white);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("TidyGuru", 20, 22);

    // Report title
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Sales Analytics Report", 20, 35);

    // Report metadata (top right) - styled as a card
    doc.setFontSize(8);
    const reportDate = format(new Date(), "MMM dd, yyyy");
    const reportTime = format(new Date(), "HH:mm");
    doc.text(reportDate, pageWidth - 20, 20, { align: "right" });
    doc.text(reportTime, pageWidth - 20, 26, { align: "right" });
    doc.setFontSize(7);
    doc.text(`Source: ${fileName.substring(0, 30)}`, pageWidth - 20, 32, {
      align: "right",
    });

    // ===== KEY METRICS CARDS (Dashboard style) =====
    let yPos = 65;

    // Create visual metric cards
    const cardWidth = 85;
    const cardHeight = 35;
    const cardSpacing = 5;
    const cardsPerRow = 2;

    const metricsCards = [
      {
        label: "Gross Sales",
        value: metrics.grossSales,
        color: colors.primary,
        bgColor: [238, 242, 255],
        icon: "$",
      },
      {
        label: "Net Revenue",
        value: metrics.netRevenue,
        color: colors.success,
        bgColor: [220, 252, 231],
        icon: "↑",
      },
      {
        label: "Total Orders",
        value: metrics.ordersCount,
        color: colors.info,
        bgColor: [219, 234, 254],
        icon: "#",
      },
      {
        label: "Avg Order",
        value: metrics.avgOrderValue,
        color: colors.warning,
        bgColor: [254, 243, 199],
        icon: "Ø",
      },
    ];

    metricsCards.forEach((card, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      const x = 20 + col * (cardWidth + cardSpacing);
      const y = yPos + row * (cardHeight + cardSpacing);

      // Card background with gradient effect
      doc.setFillColor(...card.bgColor);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "F");

      // Card border
      doc.setDrawColor(...card.color);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "S");

      // Left colored accent
      doc.setFillColor(...card.color);
      doc.roundedRect(x, y, 3, cardHeight, 3, 3, "F");

      // Icon circle background
      doc.setFillColor(255, 255, 255);
      doc.circle(x + 15, y + 12, 6, "F");
      doc.setDrawColor(...card.color);
      doc.setLineWidth(0.5);
      doc.circle(x + 15, y + 12, 6, "S");

      // Icon (text based)
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...card.color);
      doc.text(card.icon, x + 15, y + 14, { align: "center" });

      // Label
      doc.setTextColor(...colors.gray);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(card.label.toUpperCase(), x + 25, y + 10);

      // Value (large and bold)
      doc.setTextColor(...card.color);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(card.value, x + 25, y + 22);
    });

    yPos += Math.ceil(metricsCards.length / cardsPerRow) * (cardHeight + cardSpacing) + 12;

    // ===== SECONDARY METRICS ROW =====
    const secondaryMetrics = [
      {
        label: "Refunds",
        value: metrics.totalRefunds,
        color: colors.danger,
        icon: "↩",
      },
      {
        label: "Quantity Sold",
        value: metrics.totalQuantity || "N/A",
        color: colors.info,
        icon: "Σ",
      },
      {
        label: "Best Product",
        value: metrics.bestProduct || "N/A",
        color: colors.success,
        icon: "★",
        small: true,
      },
    ];

    const smCardWidth = 56;
    const smCardHeight = 22;
    
    secondaryMetrics.forEach((metric, index) => {
      const x = 20 + index * (smCardWidth + cardSpacing);
      const y = yPos;

      // Card background
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, smCardWidth, smCardHeight, 2, 2, "F");

      // Subtle border
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, smCardWidth, smCardHeight, 2, 2, "S");

      // Icon
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...metric.color);
      doc.text(metric.icon, x + 4, y + 9);

      // Label
      doc.setTextColor(...colors.gray);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(metric.label, x + 4, y + 14);

      // Value
      doc.setTextColor(...metric.color);
      doc.setFontSize(metric.small ? 8 : 10);
      doc.setFont("helvetica", "bold");
      const valueText = metric.value.length > 12 ? metric.value.substring(0, 12) + "..." : metric.value;
      doc.text(valueText, x + 4, y + 20);
    });

    yPos += smCardHeight + 12;

    // ===== REVENUE TREND CHART =====
    // Section title with icon
    doc.setFillColor(...colors.primary);
    doc.circle(22, yPos - 2, 3, "F");
    
    doc.setTextColor(...colors.dark);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Revenue Trend", 30, yPos);

    yPos += 2;

    // Prepare revenue data for chart
    const revenueData = data
      .reduce((acc, row) => {
        const dateKey = format(row.date, "MMM dd");
        const existing = acc.find((item) => item.date === dateKey);
        const revenue = row.amount - row.refund - row.fees;

        if (existing) {
          existing.value += revenue;
        } else {
          acc.push({ date: row.date, dateLabel: dateKey, value: revenue });
        }
        return acc;
      }, [] as { date: Date; dateLabel: string; value: number }[])
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(-10); // Last 10 data points

    // Chart card
    const chartWidth = pageWidth - 40;
    const chartHeight = 45;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, yPos, chartWidth, chartHeight, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, chartWidth, chartHeight, 2, 2, "S");

    // Draw the line chart
    drawMiniLineChart(
      doc,
      revenueData.map((d) => ({ date: d.date, value: d.value })),
      25,
      yPos + 5,
      chartWidth - 10,
      chartHeight - 10,
      colors.primary
    );

    yPos += chartHeight + 12;

    // ===== TOP PRODUCTS CHART =====
    // Section title with icon
    doc.setFillColor(...colors.success);
    doc.circle(22, yPos - 2, 3, "F");
    
    doc.setTextColor(...colors.dark);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Top 5 Products", 30, yPos);

    yPos += 2;

    // Prepare top products data
    const topProducts = data
      .reduce((acc, row) => {
        const revenue = row.amount - row.refund - row.fees;
        const existing = acc.find((item) => item.label === row.product);

        if (existing) {
          existing.value += revenue;
        } else {
          acc.push({ label: row.product, value: revenue });
        }
        return acc;
      }, [] as { label: string; value: number }[])
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Chart card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, yPos, chartWidth, chartHeight, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, chartWidth, chartHeight, 2, 2, "S");

    // Draw the bar chart
    drawMiniBarChart(
      doc,
      topProducts,
      25,
      yPos + 5,
      chartWidth - 10,
      chartHeight - 15,
      colors.success
    );

    yPos += chartHeight + 12;

    // Check if we need a new page
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = 20;
    }

    // ===== TRANSACTION DETAILS SECTION =====
    // Section title with icon
    doc.setFillColor(...colors.info);
    doc.circle(22, yPos - 2, 3, "F");
    
    doc.setTextColor(...colors.dark);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Details", 30, yPos);

    yPos += 5;

    // Data table
    const tableData = data.map((row) => [
      format(row.date, "MMM dd, yyyy"),
      row.product.substring(0, 30),
      `$${row.amount.toFixed(2)}`,
      `$${row.refund.toFixed(2)}`,
      `$${row.fees.toFixed(2)}`,
      `$${(row.amount - row.refund - row.fees).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [["Date", "Product", "Amount", "Refund", "Fees", "Net"]],
      body: tableData,
      startY: yPos,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
        textColor: [...colors.dark],
      },
      headStyles: {
        fillColor: [...colors.primary],
        textColor: [...colors.white],
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [...colors.lightGray],
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 65 },
        2: { cellWidth: 20, halign: "right" },
        3: { cellWidth: 18, halign: "right" },
        4: { cellWidth: 18, halign: "right" },
        5: {
          cellWidth: 20,
          halign: "right",
          fontStyle: "bold",
          textColor: [...colors.success],
        },
      },
      margin: { left: 20, right: 20 },
      didDrawPage: (tableData) => {
        // Footer on every page
        const footerY = pageHeight - 12;
        doc.setFontSize(7);
        doc.setTextColor(...colors.gray);
        doc.setFont("helvetica", "normal");

        // Left footer - branding
        doc.text("Generated by TidyGuru", 20, footerY);

        // Right footer - page number
        const pageNum = `Page ${tableData.pageNumber}`;
        doc.text(pageNum, pageWidth - 20, footerY, { align: "right" });

        // Footer line
        doc.setDrawColor(...colors.lightGray);
        doc.setLineWidth(0.3);
        doc.line(20, footerY - 4, pageWidth - 20, footerY - 4);
      },
    });

    // Save the PDF
    const pdfFileName = `TidyGuru-Report-${format(new Date(), "yyyy-MM-dd-HHmm")}.pdf`;
    doc.save(pdfFileName);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate PDF report"
    );
  }
};
