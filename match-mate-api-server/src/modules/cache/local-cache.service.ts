import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { ICacheService } from './cache.interface';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null; // null = no expiry
}

@Injectable()
export class LocalCacheService implements ICacheService, OnModuleDestroy {
  private readonly logger = new Logger(LocalCacheService.name);
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly persistPath: string;
  private cleanupTimer: NodeJS.Timeout;

  constructor(private readonly config: ConfigService) {
    // Persist cache to file so it survives restarts
    this.persistPath = path.join(
      process.cwd(),
      'local-db',
      'local-cache.json',
    );

    this.loadFromDisk();

    // Cleanup expired keys every 60 seconds
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);

    this.logger.log('✅ Local file cache initialized');
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer);
    this.saveToDisk();
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds
      ? Date.now() + ttlSeconds * 1000
      : null;

    this.store.set(key, { value, expiresAt });
    this.saveToDisk();
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    // Check expiry
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.saveToDisk();
      return null;
    }

    return entry.value;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    this.saveToDisk();
  }

  async delByPattern(pattern: string): Promise<void> {
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
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async flush(): Promise<void> {
    this.store.clear();
    this.saveToDisk();
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

      this.logger.log(
        `📂 Loaded ${this.store.size} entries from disk cache`,
      );
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