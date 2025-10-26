const express = require('express');
const router = express.Router();
const taskStore = require('../models/TaskStore');
const config = require('../config');
const logger = require('../utils/logger');
const { rateLimiterMiddleware } = require('../middleware/security');

// 验证回调请求的中间件
const validateCallback = (req, res, next) => {
  const secret = req.headers['x-callback-secret'] || req.query.secret;
  if (secret !== config.callbackSecret) {
    logger.warn('Unauthorized callback attempt', { 
      ip: req.ip, 
      secretProvided: !!secret,
      userAgent: req.get('User-Agent')
    });
    return res.status(401).json({ error: 'Unauthorized: Invalid callback secret' });
  }
  next();
};

// Nano Banana API回调处理函数
const handleNanoBananaCallback = (req, res) => {
  try {
    logger.info('Received Nano Banana callback:', req.body);
    
    // 验证callbackSecret - 检查请求头或请求体中的密钥
    const expectedSecret = config.callbackSecret;
    const providedSecret = req.headers['x-callback-secret'] || req.body.callbackSecret;
    
    if (providedSecret !== expectedSecret) {
      logger.warn('Invalid callback secret', { 
        expected: expectedSecret ? '***' : 'undefined',
        provided: providedSecret ? '***' : 'undefined'
      });
      return res.status(401).json({ error: 'Invalid callback secret' });
    }
    
    // 处理回调逻辑
    const { taskId, status, result } = req.body;
    logger.info(`Processing task ${taskId} with status ${status}`);
    
    // 这里添加您的业务逻辑
    // 例如：通知iOS应用、存储结果等
    if (!taskId) {
      logger.warn('Nano Banana API callback received without taskId');
      return res.status(400).json({ error: 'taskId is required' });
    }
    
    // 更新或创建任务
    let task = taskStore.getTask(taskId);
    if (task) {
      taskStore.updateTask(taskId, status, result?.url || null);
      logger.info('Nano Banana API task updated', { taskId, status });
    } else {
      task = taskStore.createTask({ taskId, status, resultUrl: result?.url || null });
      logger.info('Nano Banana API new task created', { taskId, status });
    }
    
    // 通知iOS应用或其他服务（这里可以添加推送通知等逻辑）
    logger.info('Task processing completed, ready to notify client', { taskId, status });
    
    res.status(200).json({ message: 'Callback received and processed successfully' });
  } catch (error) {
    logger.error('Nano Banana API callback processing error', { 
      error: error.message, 
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 1. 回调接口 (/api/callback) - 接收Nano Banana API的通知
router.post('/callback', validateCallback, rateLimiterMiddleware, (req, res) => {
  try {
    const { taskId, status, resultUrl } = req.body;
    
    if (!taskId) {
      logger.warn('Callback received without taskId', { ip: req.ip });
      return res.status(400).json({ error: 'taskId is required' });
    }
    
    logger.info('Callback received', { taskId, status, hasResultUrl: !!resultUrl });
    
    // 更新或创建任务
    let task = taskStore.getTask(taskId);
    if (task) {
      taskStore.updateTask(taskId, status, resultUrl);
      logger.info('Task updated', { taskId, status });
    } else {
      task = taskStore.createTask({ taskId, status, resultUrl });
      logger.info('New task created', { taskId, status });
    }
    
    res.json({ 
      message: 'Callback received successfully',
      task: task.toJSON()
    });
  } catch (error) {
    logger.error('Callback processing error', { 
      error: error.message, 
      stack: error.stack,
      taskId: req.body.taskId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 1b. Nano Banana API 专用回调接口 (/api/nanobananaapi-callback) - 接收Nano Banana API的通知
// 使用新的处理函数
router.post('/nanobananaapi-callback', handleNanoBananaCallback);

// Nano Banana API回调接口测试路由 (GET方法)
router.get('/nanobananaapi-callback', (req, res) => {
  res.status(200).json({ 
    message: 'Nano Banana API callback endpoint is available, please use POST method',
    timestamp: new Date().toISOString()
  });
});

// 2. 任务状态查询接口 (/api/task/:taskId) - 供前端查询结果
router.get('/task/:taskId', rateLimiterMiddleware, (req, res) => {
  try {
    const { taskId } = req.params;
    const task = taskStore.getTask(taskId);
    
    if (!task) {
      logger.warn('Task not found', { taskId, ip: req.ip });
      return res.status(404).json({ error: 'Task not found' });
    }
    
    logger.info('Task retrieved', { taskId, status: task.status });
    res.json(task.toJSON());
  } catch (error) {
    logger.error('Get task error', { 
      error: error.message, 
      stack: error.stack,
      taskId: req.params.taskId
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. 任务列表接口 (/api/tasks) - 管理所有任务
router.get('/tasks', rateLimiterMiddleware, (req, res) => {
  try {
    const tasks = taskStore.getAllTasks();
    logger.info('Tasks list retrieved', { count: tasks.length });
    res.json(tasks.map(task => task.toJSON()));
  } catch (error) {
    logger.error('Get tasks error', { 
      error: error.message, 
      stack: error.stack
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;