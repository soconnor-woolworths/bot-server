import { createHash } from 'crypto';

export function hashUrl(url: string): string {
  return createHash('sha1').update(url).digest('base64');
}
