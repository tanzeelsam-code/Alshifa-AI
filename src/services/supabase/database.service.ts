/**
 * Supabase Database Service
 * Generic CRUD operations mirroring the Firestore service pattern
 */

import { supabase } from '../../lib/supabase';

/**
 * Create or update document (upsert)
 */
export const setDocument = async <T>(
    tableName: string,
    id: string,
    data: T
): Promise<void> => {
    try {
        const { error } = await supabase
            .from(tableName)
            .upsert({ id, ...data });

        if (error) throw error;

        if (import.meta.env.DEV) {
            console.log(`✅ Record created/updated in ${tableName}: ${id}`);
        }
    } catch (error: any) {
        console.error(`❌ Failed to set record:`, error);
        throw new Error(error.message || 'Failed to set record');
    }
};

/**
 * Get single record
 */
export const getDocument = async <T>(
    tableName: string,
    id: string
): Promise<T | null> => {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return data as T;
    } catch (error: any) {
        console.error(`❌ Failed to get record:`, error);
        throw new Error(error.message || 'Failed to get record');
    }
};

/**
 * Update record (partial update)
 */
export const updateDocument = async <T>(
    tableName: string,
    id: string,
    data: Partial<T>
): Promise<void> => {
    try {
        const { error } = await supabase
            .from(tableName)
            .update(data)
            .eq('id', id);

        if (error) throw error;

        if (import.meta.env.DEV) {
            console.log(`✅ Record updated in ${tableName}: ${id}`);
        }
    } catch (error: any) {
        console.error(`❌ Failed to update record:`, error);
        throw new Error(error.message || 'Failed to update record');
    }
};

/**
 * Delete record
 */
export const deleteDocument = async (
    tableName: string,
    id: string
): Promise<void> => {
    try {
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;

        if (import.meta.env.DEV) {
            console.log(`✅ Record deleted from ${tableName}: ${id}`);
        }
    } catch (error: any) {
        console.error(`❌ Failed to delete record:`, error);
        throw new Error(error.message || 'Failed to delete record');
    }
};

/**
 * Query records with filters
 */
export const queryDocuments = async <T>(
    tableName: string,
    filters: Record<string, any> = {},
    orderField?: string,
    orderDir: 'asc' | 'desc' = 'asc',
    recordLimit?: number
): Promise<T[]> => {
    try {
        let query = supabase.from(tableName).select('*');

        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
        });

        // Apply ordering
        if (orderField) {
            query = query.order(orderField, { ascending: orderDir === 'asc' });
        }

        // Apply limit
        if (recordLimit) {
            query = query.limit(recordLimit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as T[];
    } catch (error: any) {
        console.error(`❌ Failed to query records:`, error);
        throw new Error(error.message || 'Failed to query records');
    }
};

/**
 * Real-time listener for record
 */
export const listenToDocument = <T>(
    tableName: string,
    id: string,
    callback: (data: T | null) => void
): (() => void) => {
    const subscription = supabase
        .channel(`public:${tableName}:id=eq.${id}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: `id=eq.${id}`
        }, (payload) => {
            callback(payload.new as T);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(subscription);
    };
};
