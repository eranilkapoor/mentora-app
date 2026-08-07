function csvScalar(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  return JSON.stringify(value);
}

export function csvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = Array.isArray(value)
    ? value.map((item) => csvScalar(item)).join('; ')
    : csvScalar(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function withStringId<T extends Record<string, unknown>>(
  record: T,
): T & { id: string } {
  const objectId = record._id as { toString(): string } | undefined;
  if (objectId !== undefined) {
    return { ...record, id: objectId.toString() };
  }
  const existingId = record.id;
  return { ...record, id: typeof existingId === 'string' ? existingId : '' };
}

export function buildCsv(
  headers: string[],
  records: Array<Record<string, unknown>>,
): string {
  return [
    headers.join(','),
    ...records.map((record) =>
      headers.map((header) => csvValue(record[header])).join(','),
    ),
  ].join('\n');
}

export function buildCsvExportFile(
  filenamePrefix: string,
  headers: string[],
  records: Array<Record<string, unknown>>,
): { filename: string; contentType: string; rows: unknown[]; csv: string } {
  return {
    filename: `mentora-${filenamePrefix}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`,
    contentType: 'text/csv',
    rows: records,
    csv: buildCsv(headers, records),
  };
}
