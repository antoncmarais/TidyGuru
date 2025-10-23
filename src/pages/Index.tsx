import { useState, useMemo } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { FileUpload } from "@/components/FileUpload";
import { HeroSection } from "@/components/HeroSection";
import { ImpactSection } from "@/components/ImpactSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { CTASection } from "@/components/CTASection";
import { KPICard } from "@/components/KPICard";
import { RevenueChart } from "@/components/RevenueChart";
import { TopProductsChart } from "@/components/TopProductsChart";
import { DataTable } from "@/components/DataTable";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { parseCSV, SalesData } from "@/utils/csvParser";
import { exportToPDF } from "@/utils/pdfExporter";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Download,
  X,
} from "lucide-react";
import {
  startOfWeek,
  subDays,
  isWithinInterval,
  format,
  startOfDay,
  endOfDay,
} from "date-fns";
import { DateRange } from "react-day-picker";

const Index = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [fileName, setFileName] = useState<string>("");
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      const { data, columns } = await parseCSV(file);
      setSalesData(data);
      setColumns(columns);
      setFileName(file.name);
      toast({
        title: "Upload successful",
        description: `Parsed ${data.length} rows from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Parse error",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = () => {
    setSalesData([]);
    setColumns([]);
    setFileName("");
    setDateRange(undefined);
    toast({
      title: "Data cleared",
      description: "All data has been removed",
    });
  };

  const handlePresetSelect = (preset: "week" | "month" | "all") => {
    const now = new Date();
    if (preset === "week") {
      setDateRange({
        from: startOfWeek(now),
        to: now,
      });
    } else if (preset === "month") {
      setDateRange({
        from: subDays(now, 30),
        to: now,
      });
    } else {
      setDateRange(undefined);
    }
  };

  const filteredData = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return salesData;
    
    return salesData.filter((row) => {
      const rowDate = startOfDay(row.date);
      const fromDate = dateRange.from ? startOfDay(dateRange.from) : null;
      const toDate = dateRange.to ? endOfDay(dateRange.to) : null;
      
      if (fromDate && toDate) {
        return isWithinInterval(rowDate, { start: fromDate, end: toDate });
      } else if (fromDate) {
        return rowDate >= fromDate;
      }
      return true;
    });
  }, [salesData, dateRange]);

  const metrics = useMemo(() => {
    const grossSales = filteredData.reduce((sum, row) => sum + row.amount, 0);
    const totalRefunds = filteredData.reduce((sum, row) => sum + row.refund, 0);
    const totalFees = filteredData.reduce((sum, row) => sum + row.fees, 0);
    const netRevenue = grossSales - totalRefunds - totalFees;
    const ordersCount = filteredData.filter((row) => row.amount > 0).length;
    const avgOrderValue = ordersCount > 0 ? grossSales / ordersCount : 0;

    return {
      grossSales: `$${grossSales.toFixed(2)}`,
      totalRefunds: `$${totalRefunds.toFixed(2)}`,
      netRevenue: `$${netRevenue.toFixed(2)}`,
      ordersCount: ordersCount.toString(),
      avgOrderValue: `$${avgOrderValue.toFixed(2)}`,
    };
  }, [filteredData]);

  const revenueChartData = useMemo(() => {
    const grouped = filteredData.reduce((acc, row) => {
      const dateKey = format(row.date, "MMM dd");
      if (!acc[dateKey]) {
        acc[dateKey] = 0;
      }
      acc[dateKey] += row.amount - row.refund - row.fees;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredData]);

  const topProductsData = useMemo(() => {
    const grouped = filteredData.reduce((acc, row) => {
      if (!acc[row.product]) {
        acc[row.product] = 0;
      }
      acc[row.product] += row.amount - row.refund - row.fees;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([product, revenue]) => ({
        product: product.length > 20 ? product.slice(0, 20) + "..." : product,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredData]);

  const handleExport = () => {
    exportToPDF(filteredData, metrics, fileName);
    toast({
      title: "Export successful",
      description: `Exported ${filteredData.length} rows to PDF`,
    });
  };

  if (salesData.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="TidyGuru Logo" className="h-8 w-8" />
              <span className="text-lg font-semibold text-foreground">TidyGuru</span>
            </div>
            <Button 
              size="sm" 
              className="shadow-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign Up Free
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <HeroSection />

        {/* Impact Section */}
        <ImpactSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* CTA Section */}
        <CTASection />

        {/* Footer */}
        <footer className="py-10 text-center border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Works with Shopify, Gumroad, Whop, Etsy, and more
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export to .pdf
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearData}>
              <X className="h-4 w-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </div>

        <DateRangeSelector
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onPresetSelect={handlePresetSelect}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Gross Sales"
            value={metrics.grossSales}
            icon={DollarSign}
          />
          <KPICard
            title="Refunds"
            value={metrics.totalRefunds}
            icon={TrendingDown}
          />
          <KPICard
            title="Net Revenue"
            value={metrics.netRevenue}
            icon={TrendingUp}
          />
          <KPICard
            title="Orders"
            value={metrics.ordersCount}
            icon={ShoppingCart}
          />
          <KPICard
            title="Avg Order Value"
            value={metrics.avgOrderValue}
            icon={Receipt}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={revenueChartData} />
          <TopProductsChart data={topProductsData} />
        </div>

        <DataTable
          data={filteredData.map((row) => row.rawData)}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default Index;
