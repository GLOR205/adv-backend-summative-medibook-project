const { redis } = require('../config/redis');
const JOB_QUEUE = 'queue:jobs';

const waitlistKey = (doctorId, day) => `waitlist:${doctorId}:${day}`;
const enqueueJob = (job) => redis.lpush(JOB_QUEUE, JSON.stringify(job));

module.exports = { JOB_QUEUE, waitlistKey, enqueueJob };