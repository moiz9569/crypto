"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchMarketAnalysis } from "@/lib/market/adapter";

export function useMarketAnalysis(symbol) {
  const query = useQuery({
    queryKey: ["market-analysis", symbol],
    queryFn: () => fetchMarketAnalysis(symbol),
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: 1,
  });

  // error aaye to purana data mat dikhao
  return query.isError ? { ...query, data: undefined } : query;
}