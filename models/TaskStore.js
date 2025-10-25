// 任务存储管理器
const Task = require('./Task');

class TaskStore {
  constructor() {
    this.tasks = new Map(); // 使用Map存储任务，便于快速查找
  }

  // 创建新任务
  createTask(taskData) {
    const task = new Task(
      taskData.taskId,
      taskData.status,
      taskData.resultUrl,
      taskData.createdAt,
      taskData.updatedAt
    );
    this.tasks.set(task.taskId, task);
    return task;
  }

  // 获取任务
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }

  // 更新任务
  updateTask(taskId, status, resultUrl = null) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.updateStatus(status, resultUrl);
      return task;
    }
    return null;
  }

  // 获取所有任务
  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  // 删除任务
  deleteTask(taskId) {
    return this.tasks.delete(taskId);
  }
}

// 创建全局任务存储实例
const taskStore = new TaskStore();

module.exports = taskStore;