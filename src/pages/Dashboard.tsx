import { useState, useMemo, useEffect } from "react";
import logoIcon from "@/assets/logo-icon.png";
import { KPICard } from "@/components/KPICard";
import { RevenueChart } from "@/components/RevenueChart";
import { TopProductsChart } from "@/components/TopProductsChart";
import { DataTable } from "@/components/DataTable";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAuth } from "@/contexts/AuthContext";
import { parseCSV, SalesData, exportToCSV } from "@/utils/csvParser";
import { exportToPDF } from "@/utils/pdfExporter";
import { FileUpload } from "@/components/FileUpload";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShoppingCart,
  Receipt,
  Download,
  X,
  Settings,
  LogOut,
  User,
  Upload,
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
import { useNavigate } from "react-router-dom";

interface SerializedSalesData {
  date: string;
  product: string;
  amount: number;
  refund: number;
  fees: number;
  rawData: Record<string, string | number>;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use localStorage for persistent data
  const [storedData, setStoredData] = useLocalStorage<SerializedSalesData[]>(
    "tidyguru-sales-data",
    []
  );
  const [columns, setColumns] = useLocalStorage<string[]>("tidyguru-columns", []);
  const [fileName, setFileName] = useLocalStorage<string>("tidyguru-filename", "");

  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Restore dates from localStorage on mount
  useEffect(() => {
    if (storedData.length > 0) {
      const restoredData = storedData.map((item) => ({
        ...item,
        date: new Date(item.date),
      }));
      setSalesData(restoredData);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const { data, columns } = await parseCSV(file);

      // Store data in state
      setSalesData(data);
      setColumns(columns);
      setFileName(file.name);

      // Serialize dates for localStorage
      const serializedData = data.map((item) => ({
        ...item,
        date: item.date.toISOString(),
      }));
      setStoredData(serializedData);

      toast({
        title: "Upload successful",
        description: `Parsed ${data.length} rows from ${file.name}`,
      });
      setShowUploadDialog(false);
    } catch (error) {
      toast({
        title: "Parse error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    setSalesData([]);
    setColumns([]);
    setFileName("");
    setDateRange(undefined);

    // Clear localStorage
    setStoredData([]);

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
    const grouped = filteredData.reduce(
      (acc, row) => {
        const dateKey = row.date.getTime();
        if (!acc[dateKey]) {
          acc[dateKey] = { date: row.date, revenue: 0 };
        }
        acc[dateKey].revenue += row.amount - row.refund - row.fees;
        return acc;
      },
      {} as Record<number, { date: Date; revenue: number }>
    );

    return Object.values(grouped)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, revenue }) => ({
        date: format(date, "MMM dd"),
        revenue,
      }));
  }, [filteredData]);

  const topProductsData = useMemo(() => {
    const grouped = filteredData.reduce(
      (acc, row) => {
        if (!acc[row.product]) {
          acc[row.product] = 0;
        }
        acc[row.product] += row.amount - row.refund - row.fees;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(grouped)
      .map(([product, revenue]) => ({
        product,
        fullProduct: product,
        displayProduct:
          product.length > 20 ? product.slice(0, 20) + "..." : product,
        revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredData]);

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredData, metrics, fileName);
      toast({
        title: "Export successful",
        description: `Exported ${filteredData.length} rows to PDF`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to export data to PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const csvFileName = `sales-data-${format(new Date(), "yyyy-MM-dd")}.csv`;
      exportToCSV(filteredData, csvFileName);
      toast({
        title: "Export successful",
        description: `Exported ${filteredData.length} rows to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to export data to CSV",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(
    salesData.length > 0
      ? [
          {
            key: "e",
            ctrl: true,
            action: handleExportPDF,
            description: "Export to PDF",
          },
          {
            key: "e",
            ctrl: true,
            shift: true,
            action: handleExportCSV,
            description: "Export to CSV",
          },
          {
            key: "k",
            ctrl: true,
            action: () => {
              const searchInput = document.querySelector(
                'input[placeholder="Search..."]'
              ) as HTMLInputElement;
              searchInput?.focus();
            },
            description: "Focus search",
          },
        ]
      : []
  );

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  if (salesData.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="TidyGuru Logo" className="h-8 w-8" />
              <span className="text-lg font-semibold text-foreground">
                TidyGuru
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="text-center max-w-md space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Welcome to TidyGuru!</h2>
              <p className="text-muted-foreground">
                Upload your first CSV file to start analyzing your sales data
              </p>
            </div>
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="TidyGuru Logo" className="h-8 w-8" />
            <span className="text-lg font-semibold text-foreground">TidyGuru</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
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
          <KPICard title="Gross Sales" value={metrics.grossSales} icon={DollarSign} />
          <KPICard title="Refunds" value={metrics.totalRefunds} icon={TrendingDown} />
          <KPICard title="Net Revenue" value={metrics.netRevenue} icon={TrendingUp} />
          <KPICard title="Orders" value={metrics.ordersCount} icon={ShoppingCart} />
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

        <DataTable data={filteredData.map((row) => row.rawData)} columns={columns} />
      </div>
    </div>
  );
};

export default Dashboard;

