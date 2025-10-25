// Sample CSV data generator for demo purposes

export const generateSampleCSV = (): string => {
  const headers = "Date,Product,Amount,Refund,Fees";
  
  const sampleData = [
    "2025-01-15,Premium Analytics Dashboard,99.00,0,2.97",
    "2025-01-15,Starter Plan,29.00,0,0.87",
    "2025-01-16,Premium Analytics Dashboard,99.00,0,2.97",
    "2025-01-16,Pro Plan,49.00,0,1.47",
    "2025-01-17,Enterprise Plan,199.00,0,5.97",
    "2025-01-17,Premium Analytics Dashboard,99.00,0,2.97",
    "2025-01-18,Starter Plan,29.00,29.00,0.87",
    "2025-01-18,Pro Plan,49.00,0,1.47",
    "2025-01-19,Premium Analytics Dashboard,99.00,0,2.97",
    "2025-01-19,Premium Analytics Dashboard,99.00,0,2.97",
    "2025-01-20,Enterprise Plan,199.00,0,5.97",
    "2025-01-20,Pro Plan,49.00,0,1.47",
    "2025-01-21,Starter Plan,29.00,0,0.87",
    "2025-01-21,Premium Analytics Dashboard,99.00,0,2.97",
    "2025-01-22,Pro Plan,49.00,0,1.47",
    "2025-01-22,Premium Analytics Dashboard,99.00,0,2.97",
    "2025-01-23,Enterprise Plan,199.00,0,5.97",
    "2025-01-23,Premium Analytics Dashboard,99.00,0,2.97",
    "2025-01-24,Starter Plan,29.00,0,0.87",
    "2025-01-24,Pro Plan,49.00,0,1.47",
  ];
  
  return [headers, ...sampleData].join("\n");
};

export const downloadSampleCSV = () => {
  const csvContent = generateSampleCSV();
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", "tidyguru-sample-data.csv");
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

