import React from 'react';

/*****/
/** Nama Function: SortableHeader **/
/** Deskripsi Function: Header tabel yang dapat diklik untuk sorting data **/
/** Creator by: FID.Iyan **/
/*****/
function SortableHeader({ label, field, currentSortBy, currentSortOrder, onSort, align = 'left', className = '' }) {
  const isSorted = currentSortBy === field;
  const isAsc = sortOrder => sortOrder === 'asc';

  return (
    <th
      className={`px-6 py-3 text-${align} text-xs font-medium text-gray-500 uppercase tracking-wider ${field ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''} ${className}`}
      onClick={() => {
        if (field && onSort) {
          onSort(field);
        }
      }}
    >
      <div className={`flex items-center space-x-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
        <span>{label}</span>
        {field && (
          <span className="inline-flex flex-col text-[10px] leading-[10px] text-gray-400">
            {isSorted ? (
              isAsc(currentSortOrder) ? (
                <span className="text-blue-500 font-bold">↑</span>
              ) : (
                <span className="text-blue-500 font-bold">↓</span>
              )
            ) : (
              <span className="opacity-0">↑</span>
            )}
          </span>
        )}
      </div>
    </th>
  );
}

export default SortableHeader;
