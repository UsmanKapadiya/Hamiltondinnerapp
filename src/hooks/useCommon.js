import { useState, useEffect } from 'react';
import _ from 'lodash';

/**
 * Custom hook for local storage with state synchronization
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = _.isFunction(value) ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

/**
 * Hook for debouncing values (useful for search inputs)
 * Using Lodash debounce for better performance
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const debouncedSetter = _.debounce((val) => {
      setDebouncedValue(val);
    }, delay);
    
    debouncedSetter(value);

    return () => {
      debouncedSetter.cancel();
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for media queries
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    // Legacy browsers
    else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [query]);

  return matches;
};

/**
 * Hook for previous value
 */
export const usePrevious = (value) => {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState(null);

  useEffect(() => {
    if (!_.isEqual(value, current)) {
      setPrevious(current);
      setCurrent(value);
    }
  }, [value, current]);

  return previous;
};

/**
 * Hook for throttled callback
 */
export const useThrottle = (callback, delay = 500) => {
  const throttledCallback = _.throttle(callback, delay);
  
  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);
  
  return throttledCallback;
};

