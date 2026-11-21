require('dotenv').config();
const Redis = require('ioredis');

const options = { host: process.env.REDIS_HOST, port: Number(process.env.REDIS_PORT) };
module.exports = {
  redis: new Redis(options),
  createRedisConnection: () => new Redis(options), // worker needs its own (blocking) connection
};