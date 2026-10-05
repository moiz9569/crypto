// "use client";
// import { useCallback, useEffect, useRef, useState } from "react";

// const REFRESH_MS = 15_000;

// export function useMarketAnalysis(symbol) {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const [isPending, setIsPending] = useState(true);
//   const [isFetching, setIsFetching] = useState(false);
//   const [isError, setIsError] = useState(false);
//   const abortRef = useRef(null);

//   const load = useCallback(
//     async (isRefresh) => {
//       abortRef.current?.abort();
//       const controller = new AbortController();
//       abortRef.current = controller;
//       if (isRefresh) setIsFetching(true);
//       try {
//         const res = await fetch(`/api/market/${symbol}`, {
//           signal: controller.signal,
//         });
//         if (!res.ok) throw new Error(`Request failed: ${res.status}`);
//         const json = await res.json();
//         setData(json);
//         setError(null);
//         setIsError(false);
//       } catch (err) {
//         if (err.name === "AbortError") return;
//         setError(err);
//         setIsError(true);
//       } finally {
//         setIsPending(false);
//         setIsFetching(false);
//       }
//     },
//     [symbol],
//   );

//   useEffect(() => {
//     setIsPending(true);
//     setIsError(false);
//     setData(null);
//     load(false);

//     const interval = setInterval(() => load(true), REFRESH_MS);
//     return () => {
//       clearInterval(interval);
//       abortRef.current?.abort();
//     };
//   }, [symbol, load]);

//   return {
//     data,
//     error,
//     isPending,
//     isFetching,
//     isError,
//     refetch: () => load(false),
//   };
// }
"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchMarketAnalysisOrDemo } from "@/lib/market/adapter";

export function useMarketAnalysis(symbol) {
  return useQuery({
    queryKey: ["market-analysis", symbol],
    queryFn: () => fetchMarketAnalysisOrDemo(symbol), // never throws: falls back to demo data
    refetchInterval: 15_000, // re-read the backend every 15s (also lets demo mode recover to live automatically)
    staleTime: 10_000,
    retry: false, // the fallback already handles failures
  });
}