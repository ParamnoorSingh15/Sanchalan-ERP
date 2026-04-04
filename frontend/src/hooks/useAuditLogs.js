import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

/**
 * Fetches a paginated list of audit logs from the API.
 * @param {{ page?: number, limit?: number, event?: string }} options
 */
export function useAuditLogs({ page = 1, limit = 50, event } = {}) {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page, limit });
            if (event) params.set('event', event);
            const { data } = await api.get(`/admin/audit-logs?${params}`);
            setLogs(data.data ?? []);
            setMeta(data.meta ?? null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [page, limit, event]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return { logs, meta, loading, error, refetch: fetchLogs };
}
