import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * MULTI-TAB INTAKE LOCKING
 * 
 * Better behavior than warning:
 * - Allow multiple tabs
 * - BUT: Intake flow can only be active in ONE tab
 * - Other tabs become read-only or show warning
 */

interface IntakeLock {
    tabId: string;
    userId: string;
    timestamp: number;
    intakeId?: string;
}

export function useIntakeLock(userId: string | null) {
    const [hasLock, setHasLock] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [lockHolder, setLockHolder] = useState<string | null>(null);

    // This tab's unique ID
    const [tabId] = useState(() => {
        const existing = sessionStorage.getItem('alshifa_tab_id');
        if (existing) return existing;

        const newId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('alshifa_tab_id', newId);
        return newId;
    });

    // ============================================================================
    // ACQUIRE LOCK - Call this when starting intake
    // ============================================================================
    const acquireLock = useCallback((intakeId?: string): boolean => {
        if (!userId) return false;

        const LOCK_KEY = `alshifa_intake_lock_${userId}`;

        try {
            // Check if lock exists
            const existingLockData = localStorage.getItem(LOCK_KEY);

            if (existingLockData) {
                const existingLock: IntakeLock = JSON.parse(existingLockData);

                // Check if lock is stale (older than 5 minutes)
                const LOCK_TIMEOUT = 5 * 60 * 1000;
                const isStale = Date.now() - existingLock.timestamp > LOCK_TIMEOUT;

                if (!isStale && existingLock.tabId !== tabId) {
                    console.warn('⚠️ Intake is locked by another tab');
                    setIsLocked(true);
                    setLockHolder(existingLock.tabId);
                    toast.error('Medical intake is already active in another tab');
                    return false;
                }
            }

            // Acquire lock
            const newLock: IntakeLock = {
                tabId,
                userId,
                timestamp: Date.now(),
                intakeId,
            };

            localStorage.setItem(LOCK_KEY, JSON.stringify(newLock));
            setHasLock(true);
            setIsLocked(false);

            console.log('✅ Intake lock acquired:', tabId);
            return true;

        } catch (error) {
            console.error('❌ Failed to acquire intake lock:', error);
            return false;
        }
    }, [userId, tabId]);

    // ============================================================================
    // RELEASE LOCK - Call this when completing/exiting intake
    // ============================================================================
    const releaseLock = useCallback(() => {
        if (!userId) return;

        const LOCK_KEY = `alshifa_intake_lock_${userId}`;

        try {
            const existingLockData = localStorage.getItem(LOCK_KEY);

            if (existingLockData) {
                const existingLock: IntakeLock = JSON.parse(existingLockData);

                // Only release if this tab owns the lock
                if (existingLock.tabId === tabId) {
                    localStorage.removeItem(LOCK_KEY);
                    setHasLock(false);
                    console.log('✅ Intake lock released:', tabId);
                }
            }
        } catch (error) {
            console.error('❌ Failed to release intake lock:', error);
        }
    }, [userId, tabId]);

    // ============================================================================
    // HEARTBEAT - Keep lock alive while intake is active
    // ============================================================================
    useEffect(() => {
        if (!hasLock || !userId) return;

        const LOCK_KEY = `alshifa_intake_lock_${userId}`;

        const heartbeat = setInterval(() => {
            try {
                const lockData = localStorage.getItem(LOCK_KEY);
                if (lockData) {
                    const lock: IntakeLock = JSON.parse(lockData);

                    // Update timestamp if this tab owns the lock
                    if (lock.tabId === tabId) {
                        lock.timestamp = Date.now();
                        localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
                    }
                }
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(heartbeat);
    }, [hasLock, userId, tabId]);

    // ============================================================================
    // LISTEN FOR LOCK CHANGES (cross-tab communication)
    // ============================================================================
    useEffect(() => {
        if (!userId) return;

        const LOCK_KEY = `alshifa_intake_lock_${userId}`;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key !== LOCK_KEY) return;

            if (!e.newValue) {
                // Lock was released
                setIsLocked(false);
                setLockHolder(null);
                console.log('🔓 Intake lock released in another tab');
            } else {
                // Lock was acquired or updated
                const lock: IntakeLock = JSON.parse(e.newValue);

                if (lock.tabId !== tabId) {
                    setIsLocked(true);
                    setLockHolder(lock.tabId);

                    // If this tab had the lock, it was stolen
                    if (hasLock) {
                        setHasLock(false);
                        toast('Intake was started in another tab', {
                            icon: '⚠️',
                        });
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [userId, tabId, hasLock]);

    // ============================================================================
    // CLEANUP ON TAB CLOSE
    // ============================================================================
    useEffect(() => {
        return () => {
            if (hasLock) {
                releaseLock();
            }
        };
    }, [hasLock, releaseLock]);

    return {
        hasLock,
        isLocked,
        lockHolder,
        acquireLock,
        releaseLock,
    };
}
