const startsWith = (buffer: Buffer, signature: number[]): boolean =>
  signature.every((byte, index) => buffer[index] === byte);

export const detectFileCategory = (
  buffer: Buffer | undefined,
): 'image' | 'video' | 'audio' | 'document' | null => {
  if (!buffer || buffer.length < 12) return null;

  if (
    startsWith(buffer, [0xff, 0xd8, 0xff]) ||
    startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) ||
    (buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP')
  ) {
    return 'image';
  }

  if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') return 'video';
  if (
    buffer.subarray(0, 3).toString('ascii') === 'ID3' ||
    (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) ||
    (buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WAVE')
  ) {
    return 'audio';
  }
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'document';

  return null;
};
