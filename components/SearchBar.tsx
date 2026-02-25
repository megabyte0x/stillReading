"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <input
      type="text"
      className="search-bar"
      placeholder="Search articles..."
      autoComplete="off"
      spellCheck={false}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
