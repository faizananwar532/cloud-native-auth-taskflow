import axios from 'axios';
import { AuthResponse, Task, TasksResponse } from '../types';

const API_BASE_URL = (window as any)._env_?.REACT_APP_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (username: string, email: string, password: string): Promise<{ data: AuthResponse }> =>
    api.post('/auth/register', { username, email, password }),
  
  login: (email: string, password: string): Promise<{ data: AuthResponse }> =>
    api.post('/auth/login', { email, password }),
};

export const tasksAPI = {
  getTasks: (params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: TasksResponse }> =>
    api.get('/tasks', { params }),
  
  getTask: (id: string): Promise<{ data: Task }> =>
    api.get(`/tasks/${id}`),
  
  createTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<{ data: { message: string; task: Task } }> =>
    api.post('/tasks', task),
  
  updateTask: (id: string, task: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<{ data: { message: string; task: Task } }> =>
    api.put(`/tasks/${id}`, task),
  
  deleteTask: (id: string): Promise<{ data: { message: string } }> =>
    api.delete(`/tasks/${id}`),
};

export default api;
