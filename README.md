# 财报智能摘要 MVP — 前端

> React 19 + TypeScript + Vite，财报 AI 摘要的展示层。配合 [`FinancialReportSummary` 后端](https://github.com/Melvin324/FinancialReportSummary) 食用。

![react](https://img.shields.io/badge/React-19-61DAFB) ![ts](https://img.shields.io/badge/TypeScript-6-3178C6) ![vite](https://img.shields.io/badge/Vite-8-646CFF)

## 项目亮点

- **现代 React 19 栈**：函数组件 + Hooks + 严格 TypeScript
- **250ms 防抖搜索**：避免每个按键都打后端
- **分页历史 + 页大小切换**：原生分页控件（10/20/50/页）
- **Vite 反向代理**：`/api` 走 `http://localhost:5000` 网关，开发期无 CORS
- **可折叠原始数据**：摘要卡片下展开 East Money JSON，方便调试

## 目录结构

```
src/
├── main.tsx                    # React 19 createRoot 入口
├── App.tsx                     # 顶层编排：搜索 → 结果 → 历史
├── App.css / index.css         # 样式
├── api/
│   └── client.ts               # fetch 封装：4 个端点
├── components/
│   ├── SearchBox.tsx           # 输入框 + 250ms 防抖 + 联想下拉
│   ├── ResultCard.tsx          # 公司元数据 + AI 摘要 + 折叠原始数据
│   ├── HistoryPanel.tsx        # 搜索历史列表（接 Pagination）
│   └── Pagination.tsx          # 通用分页控件
└── types/
    └── api.ts                  # 与后端 DTO 对齐的 TypeScript 类型
```

## 端到端流程

```
用户在 SearchBox 输入「maotai」
  ↓ 250ms 防抖
GET /api/search?q=maotai
  ↓
下拉显示匹配项（茅台 + 拼音 alias）
  ↓ 用户点选
POST /api/summary {query: "600519"}
  ↓
ResultCard 渲染：股票基础信息 + AI 摘要（7-10s）
  ↓ 同时
StorageService 自动记录 search_history
  ↓
HistoryPanel 刷新显示本次搜索
```

## 快速启动

### 前置条件

- Node.js 20+
- 后端服务已启动（`http://localhost:5000` 网关）

### 安装与启动

```bash
npm install
npm run dev   # 默认 http://localhost:5173
```

如果 5173 被占，Vite 自动 fallback 到 5174/5175…

### 构建生产包

```bash
npm run build      # 产物在 dist/
npm run preview    # 本地预览生产包
```

### Lint

```bash
npm run lint       # Oxlint
```

## API 客户端

`src/api/client.ts` 暴露 4 个方法，类型与后端 DTO 一一对应：

```typescript
generateSummary(query: string): Promise<SummaryResponse>
searchCompanies(q: string): Promise<SearchResponse>
getHistory(page: number, pageSize: number): Promise<HistoryResponse>
clearHistory(): Promise<void>
```

错误统一抛 `Error`，调用方用 try/catch 捕获（App.tsx 里有 toast 提示）。

## 与后端的契约

| 前端方法 | 后端端点 | 说明 |
|---|---|---|
| `generateSummary` | `POST /api/summary` | `body: {query: string}`，返回 `{stock_code, company_name, industry, summary, raw_data}` |
| `searchCompanies` | `GET /api/search?q=` | 返回 `{results: [{code, name, industry, source}]}` |
| `getHistory` | `GET /api/history?page=&pageSize=` | 返回 `{items: [...], total, page, pageSize}` |
| `clearHistory` | `DELETE /api/history` | 返回 `{ok: true}` |

## 已知限制

- 无 i18n（中文 UI，海外岗位需扩展）
- 无错误边界（react-error-boundary 待引入）
- 无单元测试（Vitest + React Testing Library 待补）

## Roadmap

- [ ] 暗色模式（`prefers-color-scheme`）
- [ ] 移动端响应式（当前桌面优先）
- [ ] 摘要导出 Markdown
- [ ] 接入 Chart.js 画财务趋势
