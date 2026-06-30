export const EVIDENCE_ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const EVIDENCE_MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function validateEvidencePhotoFile(file) {
  if (!file) return '';
  if (!EVIDENCE_ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Tipe file harus JPEG, PNG, atau WebP';
  if (file.size > EVIDENCE_MAX_PHOTO_SIZE) return 'Ukuran file maksimal 5 MB';
  return '';
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function normalizeBase64DataUrl(fileData, fileType) {
  if (!fileData) return '';
  if (String(fileData).startsWith('data:')) return fileData;
  return `data:${fileType || 'application/octet-stream'};base64,${fileData}`;
}

export function downloadBase64File(fileData, fileName, fileType) {
  const link = document.createElement('a');
  link.href = normalizeBase64DataUrl(fileData, fileType);
  link.download = fileName || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function viewBase64File(fileData, fileType) {
  const dataUrl = normalizeBase64DataUrl(fileData, fileType);
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
