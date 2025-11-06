import { useEffect, useState } from "react";

/**
 * Custom hook to read and listen to URL query parameters
 * Returns the current query parameters and updates when they change
 */
export function useQueryParams() {
  const [searchParams, setSearchParams] = useState(
    () => new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    const handlePopState = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return searchParams;
}
