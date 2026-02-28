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
    <label className="search-shell">
      <span className="search-icon" aria-hidden="true">
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="8.25" cy="8.25" r="5.25" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12.5 12.5L16.5 16.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="text"
        className="search-bar"
        placeholder="Search by title..."
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search articles by title"
      />
    </label>
  );
}
