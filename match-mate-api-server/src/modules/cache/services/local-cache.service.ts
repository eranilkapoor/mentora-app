import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { ICacheService } from '../interfaces/cache.interface';
import { AppLogger } from 'src/common/logger/logger.service';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // null = no expiry
}

@Injectable()
export class LocalCacheService implements ICacheService, OnModuleDestroy {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly persistPath: string;
  private cleanupTimer: NodeJS.Timeout;

  constructor(private readonly logger: AppLogger) {
    // Persist cache to file so it survives restarts
    this.persistPath = path.join(process.cwd(), 'local-db', 'local-cache.json');

    this.loadFromDisk();

    // Cleanup expired keys every 60 seconds
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);

    this.logger.log('✅ Local file cache initialized');
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer);
    this.saveToDisk();
  }

  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;

    this.store.set(key, { value, expiresAt });
    this.saveToDisk();
    return Promise.resolve();
  }

  get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (!entry) return Promise.resolve(null);

    // Check expiry
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.saveToDisk();
      return Promise.resolve(null);
    }

    return Promise.resolve(entry.value);
  }

  del(key: string): Promise<void> {
    this.store.delete(key);
    this.saveToDisk();
    return Promise.resolve();
  }

  delByPattern(pattern: string): Promise<void> {
    // Convert glob pattern to regex: 'user:*' → /^user:.*/
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
    );

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }

    this.saveToDisk();
    return Promise.resolve();
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  flush(): Promise<void> {
    this.store.clear();
    this.saveToDisk();
    return Promise.resolve();
  }

  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + 1;

    await this.set(key, newValue);

    return newValue;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const value = await this.get<string>(key);
    const expiresAt = ttlSeconds;

    if (value) {
      this.store.set(key, { value, expiresAt });
      this.saveToDisk();
    }
  }

  // ─── Disk Persistence ─────────────────────────────────────────────────────
  private saveToDisk(): void {
    try {
      const dir = path.dirname(this.persistPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const data: Record<string, CacheEntry<unknown>> = {};
      for (const [key, entry] of this.store.entries()) {
        // Don't persist already-expired entries
        if (entry.expiresAt === null || Date.now() < entry.expiresAt) {
          data[key] = entry;
        }
      }

      fs.writeFileSync(this.persistPath, JSON.stringify(data), 'utf8');
    } catch (err) {
      this.logger.warn('⚠️ Failed to persist cache to disk:', err);
    }
  }

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.persistPath)) return;

      const raw = fs.readFileSync(this.persistPath, 'utf8');
      const data = JSON.parse(raw) as Record<string, CacheEntry<unknown>>;

      for (const [key, entry] of Object.entries(data)) {
        // Skip expired entries on load
        if (entry.expiresAt === null || Date.now() < entry.expiresAt) {
          this.store.set(key, entry);
        }
      }

      this.logger.log(`📂 Loaded ${this.store.size} entries from disk cache`);
    } catch {
      this.logger.warn('⚠️ Could not load cache from disk, starting fresh');
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`🧹 Cleaned ${cleaned} expired cache entries`);
      this.saveToDisk();
    }
  }
}
