"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Link from "next/link";

interface Suggestion {
  type: "product" | "category";
  name: string;
  slug: string;
  image?: string;
  price?: number;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search-suggestions?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <div className="relative" ref={ref}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search homemade products..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.map((s, i) => (
            <Link
              key={`${s.type}-${s.slug}-${i}`}
              href={s.type === "product" ? `/products/${s.slug}` : `/products?category=${s.slug}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              onClick={() => setShowSuggestions(false)}
            >
              {s.image && (
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-8 h-8 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                <p className="text-xs text-gray-500 capitalize">{s.type}</p>
              </div>
              {s.price && (
                <span className="text-sm font-medium text-orange-600">
                  ₹{s.price.toLocaleString("en-IN")}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
