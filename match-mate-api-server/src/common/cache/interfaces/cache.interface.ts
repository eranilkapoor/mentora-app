export interface ICacheService {
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  del(key: string): Promise<void>;
  delByPattern(pattern: string): Promise<void>;
  has(key: string): Promise<boolean>;
  flush(): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlSeconds: number): Promise<void>;
  incrementWithExpiry(
    key: string,
    ttlSeconds: number,
  ): Promise<{ value: number; ttlSeconds: number }>;
  setIfAbsent<T>(key: string, value: T, ttlSeconds: number): Promise<boolean>;
  consumeIfValueMatches<T>(key: string, expected: T): Promise<boolean>;
}

export type CacheService = ICacheService;
