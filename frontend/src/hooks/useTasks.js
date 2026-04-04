import { useState, useCallback } from 'react';
import api from '@/lib/axios';

/**
 * Hook for managing tasks data.
 * Can be used by Admin, Manager, and Employee.
 */
export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/tasks');
            setTasks(data.data || []);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    }, []);

    const createTask = async (payload) => {
        const { data } = await api.post('/tasks/create', payload);
        fetchTasks();
        return data;
    };

    const updateStatus = async (taskId, action, payload = {}) => {
        // action can be 'start', 'complete', 'block', 'progress', 'reassign'
        const { data } = await api.put(`/tasks/${taskId}/${action}`, payload);
        fetchTasks();
        return data;
    };

    const updateTask = async (taskId, payload) => {
        const { data } = await api.put(`/tasks/${taskId}/update`, payload);
        fetchTasks();
        return data;
    };

    const deleteTask = async (taskId) => {
        await api.delete(`/tasks/${taskId}`);
        fetchTasks();
    };

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateStatus,
        updateTask,
        deleteTask
    };
}
