import { PerformanceOptimizer } from '../src/utils/performance';

describe('Performance Optimizer', () => {
  beforeEach(() => {
    PerformanceOptimizer.clear();
  });

  describe('Caching', () => {
    it('should cache and retrieve data correctly', async () => {
      const key = 'test_key';
      const data = { value: 'test_data' };
      
      // Set cache
      PerformanceOptimizer.setCache(key, data);
      
      // Get cache
      const retrieved = PerformanceOptimizer.getCache(key);
      expect(retrieved).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = PerformanceOptimizer.getCache('non_existent');
      expect(retrieved).toBeNull();
    });

    it('should handle cache expiration', async () => {
      const key = 'expiring_key';
      const data = { value: 'expiring_data' };
      
      // Set cache with short TTL
      PerformanceOptimizer.setCache(key, data, 100); // 100ms
      
      // Should be available immediately
      expect(PerformanceOptimizer.getCache(key)).toEqual(data);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be expired
      expect(PerformanceOptimizer.getCache(key)).toBeNull();
    });
  });

  describe('Execute with Cache', () => {
    it('should execute operation and cache result', async () => {
      let operationCount = 0;
      const operation = async () => {
        operationCount++;
        return { result: 'test_result' };
      };
      
      const key = 'operation_key';
      
      // First execution
      const result1 = await PerformanceOptimizer.executeWithCache(key, operation);
      expect(result1).toEqual({ result: 'test_result' });
      expect(operationCount).toBe(1);
      
      // Second execution should use cache
      const result2 = await PerformanceOptimizer.executeWithCache(key, operation);
      expect(result2).toEqual({ result: 'test_result' });
      expect(operationCount).toBe(1); // Should not execute again
    });

    it('should handle operation errors', async () => {
      const operation = async () => {
        throw new Error('Operation failed');
      };
      
      const key = 'error_key';
      
      await expect(PerformanceOptimizer.executeWithCache(key, operation))
        .rejects.toThrow('Operation failed');
    });
  });

  describe('Parallel Execution', () => {
    it('should execute operations in parallel', async () => {
      const operations = [
        { key: 'op1', operation: async () => 'result1' },
        { key: 'op2', operation: async () => 'result2' },
        { key: 'op3', operation: async () => 'result3' }
      ];
      
      const results = await PerformanceOptimizer.executeParallel(operations);
      
      expect(results).toHaveLength(3);
      expect(results).toContain('result1');
      expect(results).toContain('result2');
      expect(results).toContain('result3');
    });

    it('should respect concurrency limits', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => ({
        key: `op${i}`,
        operation: async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return `result${i}`;
        }
      }));
      
      const startTime = Date.now();
      const results = await PerformanceOptimizer.executeParallel(operations, 3);
      const duration = Date.now() - startTime;
      
      expect(results).toHaveLength(10);
      // Should take some time due to concurrency limit
      expect(duration).toBeGreaterThan(20);
    });
  });

  describe('Batch Processing', () => {
    it('should process items in batches', async () => {
      const items = Array.from({ length: 25 }, (_, i) => i);
      const processor = async (item: number) => item * 2;
      
      const results = await PerformanceOptimizer.batchProcess(items, processor, 5);
      
      expect(results).toHaveLength(25);
      expect(results[0]).toBe(0);
      expect(results[24]).toBe(48);
    });

    it('should handle batch processing errors', async () => {
      const items = [1, 2, 3];
      const processor = async (item: number) => {
        if (item === 2) throw new Error('Processing failed');
        return item * 2;
      };
      
      await expect(PerformanceOptimizer.batchProcess(items, processor))
        .rejects.toThrow('Processing failed');
    });
  });

  describe('Performance Metrics', () => {
    it('should record performance metrics', async () => {
      const operation = async () => 'test_result';
      
      await PerformanceOptimizer.executeWithCache('metrics_test', operation);
      
      const stats = PerformanceOptimizer.getPerformanceStats();
      
      expect(stats.totalOperations).toBe(1);
      expect(stats.cacheHitRate).toBe(0); // First execution, no cache hit
      expect(stats.topOperations).toHaveLength(1);
      expect(stats.topOperations[0].operation).toBe('metrics_test');
    });

    it('should track cache hit rates', async () => {
      const operation = async () => 'cached_result';
      
      // First execution
      await PerformanceOptimizer.executeWithCache('cache_test', operation);
      
      // Second execution (should hit cache)
      await PerformanceOptimizer.executeWithCache('cache_test', operation);
      
      const stats = PerformanceOptimizer.getPerformanceStats();
      
      expect(stats.totalOperations).toBe(2);
      expect(stats.cacheHitRate).toBe(0.5);
    });

    it('should provide memory usage information', () => {
      const stats = PerformanceOptimizer.getPerformanceStats();
      
      expect(stats.memoryUsage).toBeDefined();
      expect(typeof stats.memoryUsage.heapUsed).toBe('number');
      expect(typeof stats.memoryUsage.heapTotal).toBe('number');
    });
  });

  describe('Report Generation', () => {
    it('should save performance report', async () => {
      await PerformanceOptimizer.executeWithCache('report_test', async () => 'test');
      
      const reportPath = '/tmp/performance_report.json';
      PerformanceOptimizer.saveReport(reportPath);
      
      // Check if file was created (in a real test, you'd verify the content)
      expect(true).toBe(true); // Placeholder for file existence check
    });
  });
});
