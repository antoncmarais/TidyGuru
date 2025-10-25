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
}

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

    // Title
    doc.setFontSize(20);
    doc.text("Sales Analytics Report", 14, 20);

    // Date range
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 28);
    doc.text(`Source: ${fileName}`, 14, 33);

    // KPI Summary
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Key Metrics", 14, 45);

    doc.setFontSize(10);
    doc.text(`Gross Sales: ${metrics.grossSales}`, 14, 53);
    doc.text(`Refunds: ${metrics.totalRefunds}`, 70, 53);
    doc.text(`Net Revenue: ${metrics.netRevenue}`, 126, 53);
    doc.text(`Orders: ${metrics.ordersCount}`, 14, 60);
    doc.text(`Avg Order Value: ${metrics.avgOrderValue}`, 70, 60);

    // Data table
    const tableData = data.map((row) => [
      format(row.date, "MMM dd, yyyy"),
      row.product.substring(0, 30), // Limit product name length
      `$${row.amount.toFixed(2)}`,
      `$${row.refund.toFixed(2)}`,
      `$${row.fees.toFixed(2)}`,
      `$${(row.amount - row.refund - row.fees).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [["Date", "Product", "Amount", "Refund", "Fees", "Net"]],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [79, 70, 229], // Primary color
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    // Save the PDF
    const pdfFileName = `sales-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    doc.save(pdfFileName);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate PDF report"
    );
  }
};
