"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { LineChart } from "@/components/charts/line-chart";
import { useCurrency } from "@/lib/currency-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Download,
  FileText,
  FileSpreadsheet,
  Filter,
  Eye,
  CalendarRange,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Client {
  id: number;
  name: string;
}

interface ReportSale {
  saleId: number;
  saleDate: string;
  clientId: number | null;
  clientName: string;
  totalAmount: number;
  itemCount: number;
}

interface DetailedSaleItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface DetailedSaleClient {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface DetailedSale {
  id: number;
  client: DetailedSaleClient | null;
  saleDate: string;
  totalAmount: number;
  items: DetailedSaleItem[];
}

interface ReportData {
  totalSales: number;
  totalRevenue: number;
  totalItemsSold: number;
  sales: ReportSale[];
}

export default function ReportsPage() {
  const { convertAmount, formatCurrency, currency, exchangeRate } = useCurrency();
  const [clients, setClients] = useState<Client[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [detailedSales, setDetailedSales] = useState<DetailedSale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const salesPreview = useMemo(() => {
    if (!reportData?.sales) return [];

    return reportData.sales.map((sale) => ({
      ...sale,
      formattedDate: new Date(sale.saleDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      convertedAmount: convertAmount(sale.totalAmount),
    }));
  }, [reportData, convertAmount]);

  const trendData = useMemo(() => {
    if (!reportData?.sales?.length) return [];

    const totalsByDate = reportData.sales.reduce<Record<string, number>>((acc, sale) => {
      const dateKey = sale.saleDate.slice(0, 10);
      acc[dateKey] = (acc[dateKey] || 0) + sale.totalAmount;
      return acc;
    }, {});

    return Object.entries(totalsByDate)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: Number(convertAmount(revenue).toFixed(2)),
      }));
  }, [reportData, convertAmount]);

  const averageOrderValue = useMemo(() => {
    if (!reportData || reportData.totalSales === 0) return 0;
    return convertAmount(reportData.totalRevenue / reportData.totalSales);
  }, [reportData, convertAmount]);

  const topItems = useMemo(() => {
    if (!detailedSales.length) return [];

    const itemMap = detailedSales.reduce<Record<string, { name: string; quantity: number; revenue: number }>>(
      (acc, sale) => {
        sale.items.forEach((item) => {
          const current = acc[item.productName] || {
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };

          current.quantity += item.quantity;
          current.revenue += item.subtotal;
          acc[item.productName] = current;
        });

        return acc;
      },
      {}
    );

    return Object.values(itemMap)
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 5)
      .map((item) => ({
        ...item,
        convertedRevenue: convertAmount(item.revenue),
      }));
  }, [detailedSales, convertAmount]);

  const selectedClientName =
    selectedClientId === "all"
      ? "All clients"
      : clients.find((client) => client.id.toString() === selectedClientId)?.name || "Selected client";

  const hasClientFilter = selectedClientId !== "all";

  const fetchClients = async () => {
    try {
      const response = await api.get("/api/clients");
      setClients(response.data || []);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setReportData(null);
    setDetailedSales([]);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (selectedClientId && selectedClientId !== "all") params.append("clientId", selectedClientId);

      const query = params.toString();
      const reportUrl = query ? `/api/reports/sales?${query}` : "/api/reports/sales";
      const salesUrl = query ? `/api/sales?${query}` : "/api/sales";

      const [reportResponse, salesResponse] = await Promise.all([
        api.get(reportUrl),
        api.get(salesUrl),
      ]);

      setReportData(reportResponse.data);
      setDetailedSales(salesResponse.data || []);
      toast.success("Report generated successfully");
    } catch (err) {
      console.error("Error generating report:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (selectedClientId && selectedClientId !== "all") params.append("clientId", selectedClientId);
    params.append("currency", currency);
    params.append("exchangeRate", exchangeRate.toString());

    const token = localStorage.getItem("token");
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/reports/sales/csv?${params.toString()}`;

    toast.promise(
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `sales_report_${new Date().toISOString().split("T")[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }),
      {
        loading: "Generating CSV...",
        success: "CSV downloaded successfully",
        error: "Failed to download CSV",
      }
    );
  };

  const handleExportPDF = () => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (selectedClientId && selectedClientId !== "all") params.append("clientId", selectedClientId);
    params.append("currency", currency);
    params.append("exchangeRate", exchangeRate.toString());

    const token = localStorage.getItem("token");
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/reports/sales/pdf?${params.toString()}`;

    toast.promise(
      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = `sales_report_${new Date().toISOString().split("T")[0]}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }),
      {
        loading: "Generating PDF...",
        success: "PDF downloaded successfully",
        error: "Failed to download PDF",
      }
    );
  };

  const downloadBlob = (blob: Blob, fileName: string) => {
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleExportSaleCSV = (sale: DetailedSale) => {
    const rows = [
      ["Sale ID", sale.id.toString()],
      ["Date", new Date(sale.saleDate).toISOString()],
      ["Client", sale.client?.name || "Walk-in"],
      ["Currency", currency],
      ["Total Amount", formatCurrency(convertAmount(sale.totalAmount))],
      [],
      ["Product", "Quantity", "Unit Price", "Subtotal"],
      ...sale.items.map((item) => [
        item.productName,
        item.quantity.toString(),
        formatCurrency(convertAmount(item.unitPrice)),
        formatCurrency(convertAmount(item.subtotal)),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = cell ?? "";
            return /[",\n]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
          })
          .join(",")
      )
      .join("\n");

    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `sale_${sale.id}.csv`);
    toast.success(`Sale #${sale.id} exported as CSV`);
  };

  const handleExportSalePdf = async (saleId: number) => {
    const token = localStorage.getItem("token");
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

    toast.promise(
      (async () => {
        const createResponse = await fetch(`${apiBase}/api/invoices/from-sale/${saleId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: "{}",
        });

        let invoiceId: number | null = null;

        if (createResponse.ok) {
          const invoice = await createResponse.json();
          invoiceId = invoice.id;
        } else if (createResponse.status === 409) {
          const existing = await createResponse.json();
          invoiceId = existing.invoiceId;
        } else {
          throw new Error("Failed to prepare invoice PDF");
        }

        if (!invoiceId) {
          throw new Error("Invoice ID was not returned");
        }

        const pdfUrl = new URL(`${apiBase}/api/invoices/${invoiceId}/pdf`);
        pdfUrl.searchParams.set("currency", currency);
        pdfUrl.searchParams.set("exchangeRate", exchangeRate.toString());

        const pdfResponse = await fetch(pdfUrl.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!pdfResponse.ok) {
          throw new Error("Failed to download invoice PDF");
        }

        const blob = await pdfResponse.blob();
        downloadBlob(blob, `sale_${saleId}_invoice.pdf`);
      })(),
      {
        loading: `Preparing invoice for sale #${saleId}...`,
        success: `Invoice PDF downloaded for sale #${saleId}`,
        error: "Failed to export sale PDF",
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Sales Reports"
          description="Generate, preview, and export sales analytics before downloading."
        />

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client (Optional)</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatsCard
              title="Total Sales"
              value={reportData.totalSales}
              icon={ShoppingCart}
              variant="navy"
            />
            <StatsCard
              title="Total Revenue"
              value={convertAmount(reportData.totalRevenue).toFixed(2)}
              prefix={formatCurrency(0).replace("0.00", "")}
              icon={DollarSign}
              variant="slate"
            />
            <StatsCard
              title="Items Sold"
              value={reportData.totalItemsSold}
              icon={Package}
              variant="gray"
            />
          </div>
        )}

        {reportData && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6 mb-6">
            <LineChart
              title="Revenue Preview"
              data={trendData}
              dataKey="revenue"
              xAxisKey="date"
              color="#0044ad"
            />

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-background/60 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Average sale value</p>
                  <p className="text-2xl font-semibold">{formatCurrency(averageOrderValue)}</p>
                </div>
                <div className="rounded-lg border bg-background/60 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Sales rows in preview</p>
                  <p className="text-2xl font-semibold">{salesPreview.length}</p>
                </div>
                <div className="rounded-lg border bg-background/60 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Client scope</p>
                  <p className="font-medium">{selectedClientName}</p>
                </div>
                <div className="rounded-lg border bg-background/60 p-4">
                  <p className="text-sm text-muted-foreground mb-1">Date range</p>
                  <p className="font-medium flex items-center gap-2">
                    <CalendarRange className="h-4 w-4" />
                    {startDate || "Any start"} to {endDate || "Any end"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportData && (
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                  {topItems.map((item) => (
                    <div key={item.name} className="rounded-lg border bg-background/60 p-4">
                      <p className="font-medium line-clamp-2 min-h-[3rem]">{item.name}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Qty sold: <span className="font-medium text-foreground">{item.quantity}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Revenue: <span className="font-medium text-foreground">{formatCurrency(item.convertedRevenue)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No item data available for this report.</p>
              )}
            </CardContent>
          </Card>
        )}

        {reportData && (
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Report Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesPreview.length > 0 ? (
                    salesPreview.map((sale) => (
                      <TableRow key={sale.saleId}>
                        <TableCell className="font-medium">#{sale.saleId}</TableCell>
                        <TableCell>{sale.formattedDate}</TableCell>
                        <TableCell>{sale.clientName}</TableCell>
                        <TableCell>{sale.itemCount}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(sale.convertedAmount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No sales matched the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {reportData && (
          <Card className="glass-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detailed Sales Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {detailedSales.length > 0 ? (
                detailedSales.map((sale) => (
                  <div key={sale.id} className="rounded-xl border bg-background/50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Sale #{sale.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sale.saleDate).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-muted-foreground">
                          {sale.client?.name || "Walk-in"}
                        </p>
                        <p className="text-xl font-semibold text-primary">
                          {formatCurrency(convertAmount(sale.totalAmount))}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 md:justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportSaleCSV(sale)}
                          >
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Sale CSV
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleExportSalePdf(sale.id)}
                          >
                            <Receipt className="mr-2 h-4 w-4" />
                            Invoice PDF
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sale.items.map((item, index) => (
                          <TableRow key={`${sale.id}-${item.productId}-${index}`}>
                            <TableCell className="font-medium">{item.productName}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(convertAmount(item.unitPrice))}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(convertAmount(item.subtotal))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No detailed sales matched the selected filters.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {reportData && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleExportCSV} variant="default">
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  {hasClientFilter ? `Export ${selectedClientName} Statement CSV` : "Export All Filtered CSV"}
                </Button>
                <Button onClick={handleExportPDF} variant="default">
                  <FileText className="mr-2 h-5 w-5" />
                  {hasClientFilter ? `Export ${selectedClientName} Statement PDF` : "Export All Filtered PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!reportData && !loading && (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No report generated yet</p>
              <p className="text-sm mt-2">
                Select filters above and click &quot;Generate Report&quot;
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
