// Task数据模型定义
class Task {
  constructor(taskId, status, resultUrl, createdAt, updatedAt) {
    this.taskId = taskId || this.generateTaskId();
    this.status = status || 'pending'; // pending, processing, completed, failed
    this.resultUrl = resultUrl || null;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // 生成唯一任务ID
  generateTaskId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 更新任务状态
  updateStatus(status, resultUrl = null) {
    this.status = status;
    this.updatedAt = new Date();
    if (resultUrl) {
      this.resultUrl = resultUrl;
    }
  }

  // 转换为JSON对象
  toJSON() {
    return {
      taskId: this.taskId,
      status: this.status,
      resultUrl: this.resultUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Task;