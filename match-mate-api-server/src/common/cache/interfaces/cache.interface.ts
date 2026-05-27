export interface ICacheService {
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  del(key: string): Promise<void>;
  delByPattern(pattern: string): Promise<void>;
  has(key: string): Promise<boolean>;
  flush(): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
}

//  Use a string token instead of interface as type reference
export const CACHE_SERVICE = 'CACHE_SERVICE';

//  Export a type alias for use in type positions only
export type CacheService = ICacheService;
