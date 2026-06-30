import { useState } from 'react';

/*****/
/** Nama Function: useTableSort **/
/** Deskripsi Function: Mengelola state sorting tabel dan toggle asc/desc **/
/** Creator by: FID.Iyan **/
/*****/
function useTableSort(defaultSortBy = 'createdAt', defaultSortOrder = 'desc') {
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState(defaultSortOrder);

  const handleSort = (field, resetPageCallback) => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }

    if (resetPageCallback) {
      resetPageCallback();
    }
  };

  return {
    sortBy,
    sortOrder,
    handleSort
  };
}

export default useTableSort;
