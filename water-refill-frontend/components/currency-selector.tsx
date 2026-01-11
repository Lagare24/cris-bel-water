"use client";

import * as React from "react";
import { Settings, DollarSign, RefreshCw } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CurrencySelector() {
  const { currency, exchangeRate, lastFetched, setCurrency, setExchangeRate, fetchLiveRate } = useCurrency();
  const [showSettings, setShowSettings] = React.useState(false);
  const [tempRate, setTempRate] = React.useState(exchangeRate.toString());
  const [fetchingRate, setFetchingRate] = React.useState(false);

  const handleSaveSettings = () => {
    const rate = parseFloat(tempRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please enter a valid exchange rate");
      return;
    }

    setExchangeRate(rate);
    setShowSettings(false);
    toast.success("Currency settings updated");
  };

  const handleCurrencyChange = (newCurrency: "USD" | "PHP") => {
    setCurrency(newCurrency);
    toast.success(`Currency changed to ${newCurrency === "USD" ? "Dollar ($)" : "Peso (₱)"}`);
  };

  const handleFetchLiveRate = async () => {
    setFetchingRate(true);
    try {
      const { rate } = await fetchLiveRate();
      setTempRate(rate.toFixed(4));
      toast.success(`Live rate fetched: 1 USD = ${rate.toFixed(2)} PHP`);
    } catch (error) {
      toast.error("Failed to fetch live exchange rate. Please try again.");
    } finally {
      setFetchingRate(false);
    }
  };

  const formatLastFetched = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Currency Toggle */}
        <Select value={currency} onValueChange={handleCurrencyChange}>
          <SelectTrigger className="w-[100px] bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass-card">
            <SelectItem value="USD">$ USD</SelectItem>
            <SelectItem value="PHP">₱ PHP</SelectItem>
          </SelectContent>
        </Select>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setTempRate(exchangeRate.toString());
            setShowSettings(true);
          }}
          className="bg-white/10 hover:bg-white/20 text-white transition-all"
          title="Currency Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="glass-card sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Currency Settings
            </DialogTitle>
            <DialogDescription>
              Configure your preferred currency and exchange rate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Display Currency</Label>
              <Select value={currency} onValueChange={(val) => setCurrency(val as "USD" | "PHP")}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="PHP">Philippine Peso (₱)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rate">Exchange Rate (1 USD = ? PHP)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFetchLiveRate}
                  disabled={fetchingRate}
                  className="h-8"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${fetchingRate ? "animate-spin" : ""}`} />
                  {fetchingRate ? "Fetching..." : "Live Rate"}
                </Button>
              </div>
              <Input
                id="rate"
                type="number"
                step="0.01"
                min="0"
                value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                placeholder="56.50"
              />
              <p className="text-xs text-muted-foreground">
                Current rate: 1 USD = {exchangeRate.toFixed(2)} PHP
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated: {formatLastFetched(lastFetched)}
              </p>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
              <p className="text-sm font-medium">Preview:</p>
              <p className="text-xs text-muted-foreground">
                $100.00 USD = ₱{(100 * parseFloat(tempRate || "0")).toFixed(2)} PHP
              </p>
              <p className="text-xs text-muted-foreground">
                ₱1,000.00 PHP = ${(1000 / parseFloat(tempRate || "1")).toFixed(2)} USD
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
