import { useState, useEffect } from 'react';
import type { SearchHistoryItem } from '../types/api';
import { getHistory, clearHistory } from '../api/client';
import { Pagination } from './Pagination';

interface HistoryPanelProps {
  refreshKey: number;
  onReplay: (query: string) => void;
}

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function HistoryPanel({ refreshKey, onReplay }: HistoryPanelProps) {
  const [items, setItems] = useState<SearchHistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getHistory(page, pageSize);
        if (!cancelled) {
          setItems(data.items);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, pageSize, refreshKey]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1); // 改变 page size 时重置到第 1 页
  };

  const handleClear = async () => {
    if (!confirm('确定清空所有搜索历史？')) return;
    await clearHistory();
    setItems([]);
    setTotal(0);
    setTotalPages(0);
    setPage(1);
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <h3>📋 搜索历史 <span className="total-badge">{total}</span></h3>
        {total > 0 && (
          <button className="clear-btn" onClick={handleClear}>清空</button>
        )}
      </div>

      {loading && items.length === 0 ? (
        <p className="history-empty">加载中...</p>
      ) : total === 0 ? (
        <p className="history-empty">还没有搜索记录</p>
      ) : (
        <>
          <ul className="history-list">
            {items.map((item, i) => (
              <li key={`${item.searchedAt}-${i}`} onClick={() => onReplay(item.query)}>
                <span className="history-query">{item.query}</span>
                {item.resolvedCompanyName && (
                  <span className="history-resolved">
                    → {item.resolvedCompanyName} ({item.resolvedStockCode})
                  </span>
                )}
                <span className="history-time">
                  {formatTime(item.searchedAt)}
                </span>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return d.toLocaleDateString('zh-CN');
}
