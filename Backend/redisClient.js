const Redis = require('ioredis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 2) {
      return null; // Stop retrying so the server does not freeze if Redis is off
    }
    return 500;
  },
});

redis.connect().then(() => {
  console.log('⚡ Connected to Redis successfully.');
}).catch((err) => {
  console.warn('⚠️  Redis not running locally — continuing with PostgreSQL database only.');
});

module.exports = redis;
