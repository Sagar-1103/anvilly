import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          try {
            setStoredValue(JSON.parse(item));
          } catch {
            // Fallback for non-JSON strings
            setStoredValue(item as unknown as T);
          }
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== "undefined") {
        if (valueToStore === null || valueToStore === undefined || valueToStore === "") {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(
            key,
            typeof valueToStore === "string"
              ? valueToStore
              : JSON.stringify(valueToStore)
          );
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
