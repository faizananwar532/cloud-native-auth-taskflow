import React, { useState } from 'react';
import { Task } from '../types';
import { useTasks } from '../hooks/useTasks';
import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle, Edit, Trash2, Plus, CheckCircle, Circle, Play, BarChart3, TrendingUp, Target, Zap } from 'lucide-react';
import TaskForm from './TaskForm';

const TaskList: React.FC = () => {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<{ status?: string; priority?: string }>({});

  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createTask(taskData);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (taskData: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter.status && task.status !== filter.status) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in_progress').length,
    pending: tasks.filter(task => task.status === 'pending').length,
    highPriority: tasks.filter(task => task.priority === 'high').length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8">
      {/* Statistics Dashboard - 4 compact cards in a row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card-beautiful p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="card-beautiful p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.completionRate}%</p>
        </div>

        <div className="card-beautiful p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">In Progress</p>
          <p className="text-2xl font-semibold text-blue-600">{stats.inProgress}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>

        <div className="card-beautiful p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">High Priority</p>
          <p className="text-2xl font-semibold text-red-600">{stats.highPriority}</p>
          <p className="text-xs text-gray-500 mt-1">Urgent</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Task Form - Left Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-beautiful p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Add New Task</h2>
            <p className="text-sm text-gray-600 mb-4">Create and manage your tasks</p>
            
            <button
              onClick={() => setShowForm(true)}
              className="btn-beautiful w-full py-3 mb-6"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create Task
            </button>
            
            {/* Filters */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Tasks</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">By Status</label>
                  <select
                    value={filter.status || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value || undefined }))}
                    className="input-beautiful text-sm py-2"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">By Priority</label>
                  <select
                    value={filter.priority || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value || undefined }))}
                    className="input-beautiful text-sm py-2"
                  >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {(filter.status || filter.priority) && (
                  <button
                    onClick={() => setFilter({})}
                    className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-1"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks List - Right Main Area */}
        <div className="lg:col-span-2">
          <div className="card-beautiful p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Tasks</h2>
                <p className="text-sm text-gray-600">Showing {filteredTasks.length} of {tasks.length} tasks</p>
              </div>
              {(filter.status || filter.priority) && (
                <button
                  onClick={() => setFilter({})}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-4">
                    {tasks.length === 0 
                      ? "Get started by creating your first task"
                      : "No tasks match your current filters"
                    }
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn-beautiful px-6 py-2"
                  >
                    Create Task
                  </button>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-base font-semibold text-gray-900 pr-8">
                        {task.title}
                      </h3>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-50 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-50 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          onSubmit={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
          initialTask={editingTask}
          isEditing={true}
        />
      )}
    </div>
  );
};

export default TaskList;
