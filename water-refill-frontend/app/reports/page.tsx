"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
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
  ShoppingCart,
  DollarSign,
  Package,
  Download,
  FileText,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Client {
  id: number;
  name: string;
}

interface ReportData {
  totalSales: number;
  totalRevenue: number;
  totalQuantity: number;
}

export default function ReportsPage() {
  const { convertAmount, currency } = useCurrency();
  const [clients, setClients] = useState<Client[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

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

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (selectedClientId && selectedClientId !== "all") params.append("clientId", selectedClientId);

      const response = await api.get(`/api/reports/sales?${params.toString()}`);
      setReportData(response.data);
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

    const token = localStorage.getItem("token");
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5179"}/api/reports/sales/csv?${params.toString()}`;

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

    const token = localStorage.getItem("token");
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5179"}/api/reports/sales/pdf?${params.toString()}`;

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Sales Reports"
          description="Generate and export comprehensive sales analytics"
        />

        {/* Filters */}
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
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Report Results */}
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
              prefix={currency === "USD" ? "$" : "₱"}
              icon={DollarSign}
              variant="slate"
            />
            <StatsCard
              title="Items Sold"
              value={reportData.totalQuantity}
              icon={Package}
              variant="gray"
            />
          </div>
        )}

        {/* Export Options */}
        {reportData && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleExportCSV}
                  variant="default"
                >
                  <FileSpreadsheet className="mr-2 h-5 w-5" />
                  Export as CSV
                </Button>
                <Button
                  onClick={handleExportPDF}
                  variant="default"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Export as PDF
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
