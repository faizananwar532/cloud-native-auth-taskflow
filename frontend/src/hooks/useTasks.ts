import { useState, useEffect } from 'react';
import { Task } from '../types';
import { tasksAPI } from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async (params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tasksAPI.getTasks(params);
      setTasks(response.data.tasks);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await tasksAPI.createTask(task);
      setTasks(prev => [response.data.task, ...prev]);
      return response.data.task;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await tasksAPI.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? response.data.task : task));
      return response.data.task;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update task');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksAPI.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
};
