import { useState } from 'react';
import type { SummaryResponse } from '../types/api';

interface ResultCardProps {
  data: SummaryResponse;
}

export function ResultCard({ data }: ResultCardProps) {
  const [showRaw, setShowRaw] = useState(false);

  const resolvedHint = data.resolvedFromQuery && data.resolvedFromQuery !== data.stockCode
    ? ` ← "${data.resolvedFromQuery}"`
    : '';

  // 把摘要里的 Markdown 简单转 HTML
  const renderSummary = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i}>{line.slice(3)}</h2>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i}><strong>{line.slice(2, -2)}</strong></p>;
        }
        if (line.trim() === '') return <br key={i} />;
        // 处理粗体标记
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      });
  };

  return (
    <div className="result-card visible">
      <div className="meta">
        <span className="badge">{data.companyName} ({data.stockCode}){resolvedHint}</span>
        <span>{data.rawData.period}</span>
        <span>{new Date(data.generatedAt).toLocaleString('zh-CN')}</span>
      </div>

      {data.rawData.isMock && (
        <div className="mock-banner">
          ⚠️ 真实财报接口暂不可用，以下为模拟演示数据，请勿作为投资参考
        </div>
      )}

      <div className="summary">{renderSummary(data.summary)}</div>

      <div className="raw-toggle" onClick={() => setShowRaw(!showRaw)}>
        {showRaw ? '▾ 收起原始数据' : '▸ 查看原始财务数据'}
      </div>
      {showRaw && (
        <pre className="raw-json visible">{JSON.stringify(data.rawData, null, 2)}</pre>
      )}
    </div>
  );
}
