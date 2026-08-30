import { useState } from 'react';
import { SearchBox } from './components/SearchBox';
import { ResultCard } from './components/ResultCard';
import { HistoryPanel } from './components/HistoryPanel';
import { generateSummary } from './api/client';
import type { SummaryResponse } from './types/api';
import './App.css';

export default function App() {
  const [result, setResult] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateSummary(query);
      setResult(data);
      setHistoryKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>📊 财报智能摘要</h1>
        <p className="subtitle">支持股票代码 / 公司名 / 拼音搜索</p>
      </header>

      <SearchBox onSubmit={handleSearch} loading={loading} />

      {error && <div className="error-msg visible">❌ {error}</div>}

      {result && <ResultCard data={result} />}

      <HistoryPanel refreshKey={historyKey} onReplay={handleSearch} />

      <footer className="hint">
        <small>前后端分离 · React + TS + Vite · .NET 8 · SQLite 本地缓存</small>
      </footer>
    </div>
  );
}
