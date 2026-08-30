import { useState, useEffect, useRef } from 'react';
import type { CompanyInfo } from '../types/api';
import { searchCompanies } from '../api/client';

interface SearchBoxProps {
  onSubmit: (query: string) => void;
  loading: boolean;
}

const isStockCode = (s: string) => /^\d{5,6}$/.test(s.trim());

export function SearchBox({ onSubmit, loading }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CompanyInfo[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 防抖搜索建议
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!q || isStockCode(q)) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchCompanies(q);
        setSuggestions(data.results);
      } catch {
        setSuggestions([]);
      }
    }, 250);
  }, [query]);

  // 点击外部关闭建议
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (code: string) => {
    setQuery(code);
    setShowSugg(false);
    onSubmit(code);
  };

  const handleSubmit = () => {
    const q = query.trim();
    if (!q) return;
    setShowSugg(false);
    onSubmit(q);
  };

  return (
    <div className="search-card" ref={containerRef}>
      <div className="input-row">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowSugg(true); }}
          onFocus={() => setShowSugg(true)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSubmit();
            else if (e.key === 'Escape') setShowSugg(false);
          }}
          placeholder="公司名 / 拼音 / 股票代码"
          maxLength={20}
          autoComplete="off"
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="spinner" /> : <span>生成摘要</span>}
        </button>
      </div>

      {showSugg && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map(c => (
            <div
              key={c.code}
              className="suggestion-item"
              onMouseDown={() => handleSelect(c.code)}
            >
              <div>
                <strong>{c.name}</strong>
                <span className="code">{c.code}</span>
              </div>
              <span className="industry">{c.industry}</span>
            </div>
          ))}
        </div>
      )}

      <div className="examples">
        试试：
        {['600519', '茅台', 'maotai', '宁德', '银行'].map(t => (
          <span key={t} onClick={() => { setQuery(t); onSubmit(t); }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
