const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

function getDataUrlMimeType(fileData) {
  const match = String(fileData || '').match(/^data:([^;]+);base64,/);
  return match?.[1] || null;
}

function calculateBase64FileSize(fileData) {
  const base64 = String(fileData || '').split(',').pop() || '';
  return Math.ceil((base64.length * 3) / 4);
}

/*****/
/** Nama Function: validateBase64File **/
/** Deskripsi Function: Memvalidasi tipe dan ukuran file Base64 **/
/** Creator by: FID.Iyan **/
/*****/
function validateBase64File(options = {}) {
  const {
    fileData,
    fileName,
    mimeType,
    allowedMimeTypes = [],
    maxSizeBytes = DEFAULT_MAX_FILE_SIZE,
    maxSizeLabel = `${Math.floor(maxSizeBytes / 1024 / 1024)}MB`,
    requireFileName = true
  } = options;

  if (!fileData || (requireFileName && !fileName)) return 'File dan nama file wajib diisi';
  if (!mimeType || !allowedMimeTypes.includes(mimeType)) return 'Tipe file tidak diizinkan';

  const dataUrlMimeType = getDataUrlMimeType(fileData);
  if (dataUrlMimeType && dataUrlMimeType !== mimeType) return 'Tipe file tidak sesuai dengan data file';

  if (calculateBase64FileSize(fileData) > maxSizeBytes) return `Ukuran file maksimal ${maxSizeLabel}`;

  return null;
}

module.exports = {
  calculateBase64FileSize,
  getDataUrlMimeType,
  validateBase64File
};
