/**
 * RATE LIMITING UTILITY
 * Prevents abuse by limiting the number of requests within a time window
 */

interface RateLimitEntry {
    attempts: number[];
    blocked: boolean;
    blockedUntil?: number;
}

class RateLimiter {
    private limits: Map<string, RateLimitEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Clean up old entries every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Check if an action can proceed based on rate limits
     * @param key - Unique identifier for the action (e.g., 'login:user@example.com')
     * @param maxAttempts - Maximum number of attempts allowed
     * @param windowMs - Time window in milliseconds
     * @param blockDurationMs - How long to block after exceeding limit (optional)
     * @returns true if action can proceed, false if rate limited
     */
    canProceed(
        key: string,
        maxAttempts: number,
        windowMs: number,
        blockDurationMs?: number
    ): boolean {
        const now = Date.now();
        let entry = this.limits.get(key);

        // Initialize entry if it doesn't exist
        if (!entry) {
            entry = { attempts: [], blocked: false };
            this.limits.set(key, entry);
        }

        // Check if currently blocked
        if (entry.blocked && entry.blockedUntil) {
            if (now < entry.blockedUntil) {
                return false;
            } else {
                // Unblock and reset
                entry.blocked = false;
                entry.blockedUntil = undefined;
                entry.attempts = [];
            }
        }

        // Remove attempts outside the time window
        entry.attempts = entry.attempts.filter(time => now - time < windowMs);

        // Check if limit exceeded
        if (entry.attempts.length >= maxAttempts) {
            if (blockDurationMs) {
                entry.blocked = true;
                entry.blockedUntil = now + blockDurationMs;
            }
            return false;
        }

        // Record this attempt
        entry.attempts.push(now);
        return true;
    }

    /**
     * Get remaining attempts before rate limit
     */
    getRemainingAttempts(key: string, maxAttempts: number, windowMs: number): number {
        const entry = this.limits.get(key);
        if (!entry) return maxAttempts;

        const now = Date.now();
        const recentAttempts = entry.attempts.filter(time => now - time < windowMs);
        return Math.max(0, maxAttempts - recentAttempts.length);
    }

    /**
     * Get time until unblocked (in milliseconds)
     */
    getBlockedTime(key: string): number {
        const entry = this.limits.get(key);
        if (!entry || !entry.blocked || !entry.blockedUntil) return 0;

        const remaining = entry.blockedUntil - Date.now();
        return Math.max(0, remaining);
    }

    /**
     * Reset rate limit for a key
     */
    reset(key: string): void {
        this.limits.delete(key);
    }

    /**
     * Clean up old entries
     */
    private cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        this.limits.forEach((entry, key) => {
            // Remove if no recent attempts and not blocked
            if (entry.attempts.length === 0 && !entry.blocked) {
                keysToDelete.push(key);
            }
            // Remove if block has expired
            if (entry.blocked && entry.blockedUntil && now > entry.blockedUntil) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.limits.delete(key));
    }

    /**
     * Cleanup on destroy
     */
    destroy(): void {
        clearInterval(this.cleanupInterval);
    }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Common rate limit configurations
export const RATE_LIMITS = {
    LOGIN: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        blockDurationMs: 30 * 60 * 1000, // 30 minutes
    },
    API_CALL: {
        maxAttempts: 100,
        windowMs: 60 * 1000, // 1 minute
    },
    REGISTRATION: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
        blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    },
    PASSWORD_RESET: {
        maxAttempts: 3,
        windowMs: 60 * 60 * 1000, // 1 hour
    },
};
