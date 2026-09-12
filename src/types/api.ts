// 与后端 Models/Report.cs 对齐的类型定义

export interface RawReportData {
  stockCode: string;
  companyName: string;
  period: string;
  revenue: number;
  netProfit: number;
  profitGrowth: number;
  roe: number;
  grossMargin: number;
  debtRatio: number;
  eps: number;
  rawJson: string;
  /** true = 真实接口不可用/无法识别交易所，当前是模拟数据，不能当真实财报展示 */
  isMock: boolean;
}

export interface SummaryResponse {
  stockCode: string;
  companyName: string;
  resolvedFromQuery?: string;
  generatedAt: string;
  rawData: RawReportData;
  summary: string;
}

export interface CompanyInfo {
  code: string;
  name: string;
  pinyin: string;
  industry: string;
}

export interface SearchResponse {
  keyword: string;
  count: number;
  results: CompanyInfo[];
}

export interface SearchHistoryItem {
  query: string;
  resolvedStockCode: string | null;
  resolvedCompanyName: string | null;
  searchedAt: string;
}

export interface HistoryResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: SearchHistoryItem[];
}
