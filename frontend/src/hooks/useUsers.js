import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

/**
 * Fetches a paginated list of users from the API.
 * @param {{ page?: number, limit?: number }} options
 */
export function useUsers({ page = 1, limit = 50 } = {}) {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get(`/users?page=${page}&limit=${limit}`);
            setUsers(data.data ?? []);
            setMeta(data.meta ?? null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users, meta, loading, error, refetch: fetchUsers };
}
