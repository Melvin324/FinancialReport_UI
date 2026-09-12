import type { SummaryResponse, SearchResponse, HistoryResponse } from '../types/api';

// Vite 代理：开发时 /api/* 转发到后端 5000 端口
const API_BASE = '/api';

export async function generateSummary(query: string): Promise<SummaryResponse> {
  const resp = await fetch(`${API_BASE}/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    throw new Error(data.detail ?? data.error ?? `请求失败 (${resp.status})`);
  }

  return resp.json();
}

export async function searchCompanies(keyword: string): Promise<SearchResponse> {
  if (!keyword.trim()) {
    return { keyword, count: 0, results: [] };
  }
  const resp = await fetch(`${API_BASE}/search?q=${encodeURIComponent(keyword)}`);
  if (!resp.ok) {
    return { keyword, count: 0, results: [] };
  }
  return resp.json();
}

export async function getHistory(page = 1, pageSize = 10): Promise<HistoryResponse> {
  const resp = await fetch(`${API_BASE}/history?page=${page}&pageSize=${pageSize}`);
  if (!resp.ok) {
    return { page: 1, pageSize, total: 0, totalPages: 0, items: [] };
  }
  return resp.json();
}

export async function clearHistory(): Promise<void> {
  const resp = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  if (!resp.ok) {
    throw new Error(`清空历史失败 (${resp.status})`);
  }
}
