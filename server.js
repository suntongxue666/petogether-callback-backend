const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const taskStore = require('./models/TaskStore');
const logger = require('./utils/logger');

const app = express();

// 安全中间件
app.use(helmet()); // 添加各种安全头部
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 限制请求体大小
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// API路由
app.use('/api', require('./routes/api'));

// 根路径健康检查
app.get('/', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({ 
    message: 'Petogether Callback Backend API', 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.path}`, { ip: req.ip });
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error('Unhandled application error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    ip: req.ip
  });
  res.status(500).json({ 
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error' 
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, { 
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;