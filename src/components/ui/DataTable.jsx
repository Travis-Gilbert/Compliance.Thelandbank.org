import React from 'react';

export function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data found.',
  rowClassName,
}) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="bg-warm-100 border-b border-border">
              {columns.map((col, i) => (
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
                  ].filter(Boolean).join(' ')}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 text-sm text-text-secondary">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-sm text-muted">
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
