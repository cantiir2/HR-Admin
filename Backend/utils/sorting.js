/*****/
/** Nama Function: validateSortParams **/
/** Deskripsi Function: Memvalidasi parameter sorting berdasarkan whitelist kolom **/
/** Creator by: FID.Iyan **/
/*****/
function validateSortParams(sortBy, sortOrder, allowedSortFields, defaultSort) {
  let validSortBy = defaultSort.sortBy;
  let validSortOrder = defaultSort.sortOrder || 'desc';

  if (sortBy && allowedSortFields.includes(sortBy)) {
    validSortBy = sortBy;
  }

  if (sortOrder && ['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    validSortOrder = sortOrder.toLowerCase();
  }

  return { sortBy: validSortBy, sortOrder: validSortOrder };
}

/*****/
/** Nama Function: buildOrderBy **/
/** Deskripsi Function: Membuat Prisma orderBy berdasarkan hasil validasi sorting **/
/** Creator by: FID.Iyan **/
/*****/
function buildOrderBy(sortBy, sortOrder, allowedSortFields, defaultSort) {
  const { sortBy: validSortBy, sortOrder: validSortOrder } = validateSortParams(
    sortBy,
    sortOrder,
    allowedSortFields,
    defaultSort
  );

  // Jika sorting berelasi misal: "user.name"
  if (validSortBy.includes('.')) {
    const parts = validSortBy.split('.');
    let current = {};
    let root = current;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = validSortOrder;
    return root;
  }

  return { [validSortBy]: validSortOrder };
}

module.exports = {
  validateSortParams,
  buildOrderBy
};
