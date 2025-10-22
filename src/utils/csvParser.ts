import Papa from "papaparse";
import { parse, isValid } from "date-fns";

export interface SalesData {
  date: Date;
  product: string;
  amount: number;
  refund: number;
  fees: number;
  rawData: Record<string, string | number>;
}

const DATE_FORMATS = [
  "yyyy-MM-dd",
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "MMM dd, yyyy",
  "MMMM dd, yyyy",
  "yyyy/MM/dd",
  "dd-MM-yyyy",
];

const parseCurrency = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) return 0;
  
  // Remove currency symbols and spaces
  const cleaned = String(value)
    .replace(/[$€£¥R₹]/g, "")
    .replace(/\s/g, "")
    .trim();
  
  // Handle negative values (refunds)
  const isNegative = cleaned.includes("-") || cleaned.startsWith("(");
  
  // Remove commas and parentheses
  const numStr = cleaned.replace(/[,()]/g, "").replace(/-/g, "");
  
  const num = parseFloat(numStr);
  return isNegative ? -Math.abs(num) : num;
};

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  for (const format of DATE_FORMATS) {
    const parsed = parse(dateStr, format, new Date());
    if (isValid(parsed)) return parsed;
  }
  
  // Try native Date parsing as fallback
  const nativeDate = new Date(dateStr);
  if (isValid(nativeDate)) return nativeDate;
  
  return null;
};

const detectColumns = (headers: string[]) => {
  const lower = headers.map((h) => h.toLowerCase());
  
  const dateCol = lower.findIndex((h) =>
    h.includes("date") || h.includes("time") || h.includes("created")
  );
  
  const productCol = lower.findIndex((h) =>
    h.includes("product") || h.includes("item") || h.includes("name") || h.includes("title")
  );
  
  const amountCol = lower.findIndex((h) =>
    h.includes("amount") || h.includes("price") || h.includes("total") || h.includes("gross")
  );
  
  const refundCol = lower.findIndex((h) =>
    h.includes("refund") || h.includes("return")
  );
  
  const feesCol = lower.findIndex((h) =>
    h.includes("fee") || h.includes("charge") || h.includes("commission")
  );
  
  return {
    dateCol: dateCol >= 0 ? headers[dateCol] : null,
    productCol: productCol >= 0 ? headers[productCol] : null,
    amountCol: amountCol >= 0 ? headers[amountCol] : null,
    refundCol: refundCol >= 0 ? headers[refundCol] : null,
    feesCol: feesCol >= 0 ? headers[feesCol] : null,
  };
};

export const parseCSV = (file: File): Promise<{
  data: SalesData[];
  columns: string[];
}> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const headers = results.meta.fields || [];
          const detected = detectColumns(headers);
          
          const salesData: SalesData[] = results.data.map((row: any) => {
            const dateStr = detected.dateCol ? row[detected.dateCol] : "";
            const date = parseDate(dateStr) || new Date();
            
            const product = detected.productCol
              ? String(row[detected.productCol] || "Unknown")
              : "Unknown";
            
            const amount = detected.amountCol
              ? parseCurrency(row[detected.amountCol])
              : 0;
            
            // Check if this row is a refund
            const isRefundRow = Object.values(row).some((val) =>
              String(val).toLowerCase().includes("refund")
            );
            
            const refund = detected.refundCol
              ? Math.abs(parseCurrency(row[detected.refundCol]))
              : isRefundRow
              ? Math.abs(amount)
              : amount < 0
              ? Math.abs(amount)
              : 0;
            
            const fees = detected.feesCol
              ? Math.abs(parseCurrency(row[detected.feesCol]))
              : 0;
            
            return {
              date,
              product,
              amount: isRefundRow || amount < 0 ? 0 : Math.abs(amount),
              refund,
              fees,
              rawData: row,
            };
          });
          
          resolve({ data: salesData, columns: headers });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
