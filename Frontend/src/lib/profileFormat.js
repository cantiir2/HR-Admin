export function displaySystemValue(value, masters = []) {
  if (!value) return '-';
  const found = masters.find(item => item.code === value || item.name === value);
  return found ? found.name : value;
}

export function parseWorkingExperience(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    return [{
      companyName: '',
      role: '',
      detail: value,
      startDate: '',
      endDate: '',
      isPresent: false
    }];
  }
  return [];
}

export function stringifyWorkingExperience(items) {
  const cleaned = items
    .map(item => ({
      companyName: item.companyName?.trim() || '',
      role: item.role?.trim() || '',
      detail: item.detail?.trim() || '',
      startDate: item.startDate || '',
      endDate: item.isPresent ? '' : item.endDate || '',
      isPresent: Boolean(item.isPresent)
    }))
    .filter(item => item.companyName || item.role || item.detail || item.startDate || item.endDate);

  return cleaned.length ? JSON.stringify(cleaned) : '';
}

export function formatWorkingPeriod(item) {
  const start = item.startDate ? new Date(item.startDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-';
  const end = item.isPresent ? 'Present' : item.endDate ? new Date(item.endDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-';
  return `${start} - ${end}`;
}
