import { useState, useEffect } from 'react';

interface Provider {
  id: string;
  name: string;
}

interface ProvidersResponse {
  providers: Provider[];
  models: Record<string, any>;
}

interface UseProvidersResult {
  providers: Provider[];
  models: Record<string, any>;
  loading: boolean;
  error: Error | null;
}

let cachedData: ProvidersResponse | null = null;
let cachePromise: Promise<ProvidersResponse> | null = null;

export function useProviders(): UseProvidersResult {
  const [data, setData] = useState<ProvidersResponse>(() => cachedData || { providers: [], models: {} });
  const [loading, setLoading] = useState<boolean>(!cachedData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Return cached data immediately if available
    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError(null);
      return;
    }

    // Reuse in-flight promise if exists
    if (cachePromise) {
      cachePromise
        .then((result) => {
          cachedData = result;
          setData(result);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
      return;
    }

    const fetchPromise = fetch('/api/providers')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch providers: ${response.statusText}`);
        }
        return response.json() as Promise<ProvidersResponse>;
      })
      .then((result) => {
        cachedData = result;
        cachePromise = null;
        return result;
      });

    cachePromise = fetchPromise;

    fetchPromise
      .then((result) => {
        setData(result);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return {
    providers: data.providers,
    models: data.models,
    loading,
    error,
  };
}
