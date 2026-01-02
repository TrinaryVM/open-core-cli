import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hash: string;
  expires: number;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryUsage: number;
  cacheHit: boolean;
  timestamp: number;
}

export class PerformanceOptimizer {
  private static cache = new Map<string, CacheEntry<any>>();
  private static metrics: PerformanceMetrics[] = [];
  private static readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes (optimized for CLI)
  private static readonly MAX_CACHE_SIZE = 200; // Increased for better performance
  private static readonly QUANTUM_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for quantum operations
  private static readonly CRYPTO_CACHE_TTL = 30 * 60 * 1000; // 30 minutes for crypto operations

  /**
   * Cache with automatic expiration and size management
   */
  static setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    // Clean expired entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.cleanExpiredEntries();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hash: this.generateHash(data),
      expires: Date.now() + ttl
    };

    this.cache.set(key, entry);
  }

  /**
   * Set cache with operation-specific TTL
   */
  static setCacheWithType<T>(key: string, data: T, operationType: 'quantum' | 'crypto' | 'vm' | 'default' = 'default'): void {
    let ttl = this.CACHE_TTL;
    
    switch (operationType) {
      case 'quantum':
        ttl = this.QUANTUM_CACHE_TTL;
        break;
      case 'crypto':
        ttl = this.CRYPTO_CACHE_TTL;
        break;
      case 'vm':
        ttl = this.CACHE_TTL;
        break;
      default:
        ttl = this.CACHE_TTL;
    }
    
    this.setCache(key, data, ttl);
  }

  /**
   * Get cached data with validation
   */
  static getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Execute operation with caching and performance tracking
   */
  static async executeWithCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Check cache first
    const cached = this.getCache<T>(key);
    if (cached !== null) {
      this.recordMetrics(key, Date.now() - startTime, process.memoryUsage().heapUsed - startMemory.heapUsed, true);
      return cached;
    }

    // Execute operation
    const result = await operation();
    
    // Cache result
    this.setCache(key, result, ttl);
    
    // Record metrics
    this.recordMetrics(key, Date.now() - startTime, process.memoryUsage().heapUsed - startMemory.heapUsed, false);
    
    return result;
  }

  /**
   * Execute multiple operations in parallel
   */
  static async executeParallel<T>(
    operations: Array<{ key: string; operation: () => Promise<T> }>,
    maxConcurrency: number = 5
  ): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const { key, operation } of operations) {
      const promise = this.executeWithCache(key, operation).then(result => {
        results.push(result);
      });

      executing.push(promise);

      // Limit concurrency
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        // Remove completed promises
        for (let i = executing.length - 1; i >= 0; i--) {
          if (await Promise.race([executing[i].then(() => true), Promise.resolve(false)])) {
            executing.splice(i, 1);
          }
        }
      }
    }

    // Wait for remaining operations
    await Promise.all(executing);
    return results;
  }

  /**
   * Batch process items with parallel execution
   */
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    maxConcurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(item => processor(item));
      
      // Limit concurrency within batch
      const batchResults = await this.limitConcurrency(batchPromises, maxConcurrency);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Limit concurrency for promise execution
   */
  private static async limitConcurrency<T>(promises: Promise<T>[], maxConcurrency: number): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const promise of promises) {
      const wrappedPromise = promise.then(result => {
        results.push(result);
      });

      executing.push(wrappedPromise);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        // Remove completed promises
        for (let i = executing.length - 1; i >= 0; i--) {
          try {
            await Promise.race([executing[i], Promise.resolve()]);
            executing.splice(i, 1);
          } catch {
            // Promise already completed
          }
        }
      }
    }

    await Promise.all(executing);
    return results;
  }

  /**
   * Record performance metrics
   */
  private static recordMetrics(operation: string, duration: number, memoryUsage: number, cacheHit: boolean): void {
    this.metrics.push({
      operation,
      duration,
      memoryUsage,
      cacheHit,
      timestamp: Date.now()
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): {
    totalOperations: number;
    averageDuration: number;
    cacheHitRate: number;
    memoryUsage: NodeJS.MemoryUsage;
    topOperations: Array<{ operation: string; count: number; avgDuration: number }>;
  } {
    const totalOperations = this.metrics.length;
    const averageDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    const cacheHitRate = totalOperations > 0 ? cacheHits / totalOperations : 0;

    // Group by operation
    const operationStats = new Map<string, { count: number; totalDuration: number }>();
    this.metrics.forEach(m => {
      const existing = operationStats.get(m.operation) || { count: 0, totalDuration: 0 };
      operationStats.set(m.operation, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + m.duration
      });
    });

    const topOperations = Array.from(operationStats.entries())
      .map(([operation, stats]) => ({
        operation,
        count: stats.count,
        avgDuration: stats.totalDuration / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalOperations,
      averageDuration,
      cacheHitRate,
      memoryUsage: process.memoryUsage(),
      topOperations
    };
  }

  /**
   * Clean expired cache entries
   */
  private static cleanExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generate hash for cache validation
   */
  private static generateHash(data: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Clear cache and metrics
   */
  static clear(): void {
    this.cache.clear();
    this.metrics = [];
  }

  /**
   * Save performance report to file
   */
  static saveReport(filePath: string): void {
    const stats = this.getPerformanceStats();
    const report = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      cacheSize: this.cache.size,
      recentMetrics: this.metrics.slice(-100)
    };

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }
}
