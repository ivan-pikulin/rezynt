import { Resume } from './api/types';

interface CacheEntry {
  data: Resume;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ResumeCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Get resume data from cache if it exists and is not expired
   */
  get(resumeId: string): Resume | null {
    const entry = this.cache.get(resumeId);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry has expired, remove it
      this.cache.delete(resumeId);
      return null;
    }

    return entry.data;
  }

  /**
   * Store resume data in cache
   */
  set(resumeId: string, data: Resume, ttl?: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    };
    
    this.cache.set(resumeId, entry);
  }

  /**
   * Remove resume from cache
   */
  invalidate(resumeId: string): void {
    this.cache.delete(resumeId);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if resume exists in cache and is not expired
   */
  has(resumeId: string): boolean {
    return this.get(resumeId) !== null;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [resumeId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(resumeId);
      }
    }
  }
}

export const resumeCacheService = new ResumeCacheService();
