"use client";

import { createContext, useContext, useState } from "react";

const SearchContext = createContext({ query: "", setQuery: (_: string) => {} });

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  return <SearchContext.Provider value={{ query, setQuery }}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  return useContext(SearchContext);
}
