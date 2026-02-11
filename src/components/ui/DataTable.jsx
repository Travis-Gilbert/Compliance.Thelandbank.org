import React, { useState, useEffect, useMemo } from 'react';

/* Normalize column definitions — accept both `key` and `accessor` */
function colKey(col) {
  return col.key || col.accessor;
}

export function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found.',
  rowClassName,
  mobileColumns,
  mobileTitle,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Normalize columns once — attach resolved `key` to avoid repeated lookups
  const normalizedCols = useMemo(
    () => columns.map((c) => ({ ...c, _key: colKey(c) })),
    [columns]
  );

  // ── Mobile card layout ────────────────────────────
  if (isMobile && mobileColumns && mobileColumns.length > 0) {
    const titleKey = mobileTitle || mobileColumns[0];
    const titleCol = normalizedCols.find((c) => c._key === titleKey);
    const detailCols = normalizedCols.filter(
      (c) => mobileColumns.includes(c._key) && c._key !== titleKey
    );

    if (data.length === 0) {
      return (
        <div className="text-center py-12 text-sm text-muted bg-surface rounded-lg border border-border">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((row, rowIdx) => (
          <div
            key={row.id || rowIdx}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={[
              'bg-surface rounded-lg border border-border shadow-sm p-4 transition-colors',
              onRowClick ? 'cursor-pointer active:bg-surface-alt/60' : '',
              rowClassName ? rowClassName(row) : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {/* Title row */}
            {titleCol && (
              <div className="mb-2">
                {titleCol.render ? (
                  titleCol.render(row[titleCol._key], row)
                ) : (
                  <span className="text-sm font-medium text-text">
                    {row[titleCol._key]}
                  </span>
                )}
              </div>
            )}
            {/* Detail fields in 2-col grid */}
            {detailCols.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {detailCols.map((col, i) => (
                  <div key={i}>
                    <p className="text-[10px] font-mono font-medium text-muted uppercase tracking-wider mb-0.5">
                      {col.header}
                    </p>
                    <div className="text-sm">
                      {col.render
                        ? col.render(row[col._key], row)
                        : row[col._key]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Desktop table layout ──────────────────────────
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="bg-warm-100 border-b border-border">
              {normalizedCols.map((col, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left text-[11px] font-mono font-semibold uppercase tracking-wider text-muted"
                  style={col.width ? { minWidth: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={[
                    'border-b border-border/50 transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-surface-alt/60' : '',
                    rowClassName ? rowClassName(row) : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {normalizedCols.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-4 py-3.5 text-sm text-text-secondary"
                    >
                      {col.render
                        ? col.render(row[col._key], row)
                        : row[col._key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={normalizedCols.length}
                  className="text-center py-12 text-sm text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
