// 环境变量配置
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  // 安全配置
  apiKey: process.env.API_KEY || 'default-api-key',
  // Nano Banana API回调验证密钥
  callbackSecret: process.env.CALLBACK_SECRET || 'default-callback-secret'
};

module.exports = config;