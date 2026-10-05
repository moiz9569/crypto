"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const REFRESH_MS = 15_000;

export function useMarketAnalysis(symbol) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const abortRef = useRef(null);

  const load = useCallback(
    async (isRefresh) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      if (isRefresh) setIsFetching(true);
      try {
        const res = await fetch(`/api/market/${symbol}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        setData(json);
        setError(null);
        setIsError(false);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err);
        setIsError(true);
      } finally {
        setIsPending(false);
        setIsFetching(false);
      }
    },
    [symbol],
  );

  useEffect(() => {
    setIsPending(true);
    setIsError(false);
    setData(null);
    load(false);

    const interval = setInterval(() => load(true), REFRESH_MS);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [symbol, load]);

  return {
    data,
    error,
    isPending,
    isFetching,
    isError,
    refetch: () => load(false),
  };
}
