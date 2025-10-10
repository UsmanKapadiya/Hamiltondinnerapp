import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for API calls with loading, error handling, and request cancellation
 * @param {Function} apiFunction - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, refetch, cancel }
 */
export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = false,
    onSuccess,
    onError,
    showToast = false,
    initialData = null
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (...args) => {
    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);

      const response = await apiFunction(...args);

      if (!isMountedRef.current) return;

      setData(response);
      
      if (onSuccess) {
        onSuccess(response);
      }

      if (showToast && response?.ResponseText) {
        toast.success(response.ResponseText);
      }

      return response;
    } catch (err) {
      if (!isMountedRef.current) return;

      // Don't set error state for aborted requests
      if (err.name === 'AbortError' || err.message === 'canceled') {
        return;
      }

      const errorMessage = err.response?.data?.ResponseText || 
                          err.response?.data?.message || 
                          err.message || 
                          'An unexpected error occurred';

      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      if (showToast) {
        toast.error(errorMessage);
      }

      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunction, onSuccess, onError, showToast]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // Only run on mount if immediate is true

  return {
    data,
    loading,
    error,
    execute,
    cancel,
    refetch: execute
  };
};

/**
 * Hook for API calls that need to be triggered manually
 */
export const useLazyApi = (apiFunction, options = {}) => {
  return useApi(apiFunction, { ...options, immediate: false });
};

/**
 * Hook for pagination with API
 */
export const usePaginatedApi = (apiFunction, options = {}) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allData, setAllData] = useState([]);

  const { data, loading, error, execute } = useApi(apiFunction, {
    ...options,
    immediate: false,
    onSuccess: (response) => {
      if (response?.data) {
        setAllData(prev => page === 1 ? response.data : [...prev, ...response.data]);
        setHasMore(response.hasMore || response.data.length > 0);
      }
      options.onSuccess?.(response);
    }
  });

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      execute(page);
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore, page, execute]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  return {
    data: allData,
    loading,
    error,
    loadMore,
    reset,
    hasMore
  };
};
