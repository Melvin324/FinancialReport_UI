interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50]
}: PaginationProps) {
  if (totalPages <= 1 && total <= pageSizeOptions[0]) {
    // 数据少到不需要分页，但显示总数 + page size 选择器
    return (
      <div className="pagination">
        <span className="page-total">共 {total} 条</span>
        <div className="page-size-selector">
          <span className="page-size-label">每页</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="pagination">
      <span className="page-total">共 {total} 条</span>

      <div className="page-size-selector">
        <span className="page-size-label">每页</span>
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <button
        className="page-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ←
      </button>
      <span className="page-info">{currentPage} / {totalPages}</span>
      <button
        className="page-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        →
      </button>
    </div>
  );
}
