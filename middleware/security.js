// 安全中间件配置
const rateLimiterFlexible = require('rate-limiter-flexible');

// 速率限制配置
const opts = {
  points: 10, // 10次请求
  duration: 60, // 每分钟
};

const rateLimiter = new rateLimiterFlexible.RateLimiterMemory(opts);

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({ error: 'Too Many Requests' });
    });
};

module.exports = {
  rateLimiterMiddleware
};