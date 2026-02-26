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

export function useProviders(): UseProvidersResult {
  const [data, setData] = useState<ProvidersResponse>({ providers: [], models: {} });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/providers?_=' + Date.now())
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch providers: ${response.statusText}`);
        }
        return response.json() as Promise<ProvidersResponse>;
      })
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
