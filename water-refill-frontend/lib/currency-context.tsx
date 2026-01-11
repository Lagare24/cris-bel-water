"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "USD" | "PHP";

interface CurrencyContextType {
  currency: Currency;
  exchangeRate: number;
  lastFetched: string | null;
  setCurrency: (currency: Currency) => void;
  setExchangeRate: (rate: number) => void;
  fetchLiveRate: () => Promise<{ rate: number; timestamp: string }>;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency?: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const DEFAULT_EXCHANGE_RATE = 56.5; // Default PHP to USD rate

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("PHP");
  const [exchangeRate, setExchangeRateState] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCurrency = localStorage.getItem("currency") as Currency;
      const savedRate = localStorage.getItem("exchangeRate");
      const savedLastFetched = localStorage.getItem("lastFetched");

      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      }
      if (savedRate) {
        setExchangeRateState(parseFloat(savedRate));
      }
      if (savedLastFetched) {
        setLastFetched(savedLastFetched);
      }
    }
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  const setExchangeRate = (rate: number) => {
    setExchangeRateState(rate);
    localStorage.setItem("exchangeRate", rate.toString());
  };

  // Fetch live exchange rate from API
  const fetchLiveRate = async (): Promise<{ rate: number; timestamp: string }> => {
    try {
      // Using ExchangeRate-API (free, no API key required)
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");

      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate");
      }

      const data = await response.json();
      const phpRate = data.rates.PHP;

      if (!phpRate || typeof phpRate !== "number") {
        throw new Error("Invalid exchange rate data");
      }

      const timestamp = new Date().toISOString();

      // Update state and localStorage
      setExchangeRateState(phpRate);
      setLastFetched(timestamp);
      localStorage.setItem("exchangeRate", phpRate.toString());
      localStorage.setItem("lastFetched", timestamp);

      return { rate: phpRate, timestamp };
    } catch (error) {
      console.error("Error fetching live exchange rate:", error);
      throw error;
    }
  };

  // Format currency with proper symbol and decimals
  const formatCurrency = (amount: number): string => {
    const symbol = currency === "USD" ? "$" : "₱";
    const formattedAmount = amount.toFixed(2);
    return `${symbol}${formattedAmount}`;
  };

  // Convert amount from PHP (base currency in DB) to selected currency
  const convertAmount = (amount: number, fromCurrency: Currency = "PHP"): number => {
    if (currency === fromCurrency) {
      return amount;
    }

    // Convert from PHP to USD
    if (currency === "USD" && fromCurrency === "PHP") {
      return amount / exchangeRate;
    }

    // Convert from USD to PHP
    if (currency === "PHP" && fromCurrency === "USD") {
      return amount * exchangeRate;
    }

    return amount;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        exchangeRate,
        lastFetched,
        setCurrency,
        setExchangeRate,
        fetchLiveRate,
        formatCurrency,
        convertAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
