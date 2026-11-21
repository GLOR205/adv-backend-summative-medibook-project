require('dotenv').config();
const { createRedisConnection, redis } = require('./config/redis');
const { JOB_QUEUE, waitlistKey } = require('./utils/queue');
const { audit } = require('./utils/auditLogger');
const { bookAppointment } = require('./services/bookingService');
const appointmentModel = require('./models/appointmentModel');

const blockingRedis = createRedisConnection(); // BRPOP blocks, so it needs its own connection

async function handleConfirmation(job) {
  const appt = await appointmentModel.findById(job.appointmentId);
  await audit('notification_sent', {
    type: 'confirmation', appointmentId: job.appointmentId,
    message: `Confirmation sent for appointment on ${appt ? appt.appt_datetime : 'unknown'}`,
  });
}

async function handleSlotFreed(job) {
  const key = waitlistKey(job.doctorId, job.apptDatetime.slice(0, 10));
  const raw = await redis.lpop(key);                 // take the first waiting patient
  if (!raw) return;

  const entry = JSON.parse(raw);
  try {
    const appt = await bookAppointment({
      patientId: entry.patientId, doctorId: job.doctorId, apptDatetime: job.apptDatetime,
    });
    await audit('waitlist_promoted', { patientId: entry.patientId, appointmentId: appt.id });
  } catch (err) {
    await redis.lpush(key, raw);                     // put them BACK at the front: never lost
    await audit('waitlist_promotion_failed', { patientId: entry.patientId, reason: err.message });
  }
}

async function run() {
  console.log('Worker started, waiting for jobs...');
  while (true) {
    const [, payload] = await blockingRedis.brpop(JOB_QUEUE, 0);
    try {
      const job = JSON.parse(payload);
      if (job.type === 'confirmation') await handleConfirmation(job);
      else if (job.type === 'slot_freed') await handleSlotFreed(job);
    } catch (err) {
      await audit('job_error', { error: err.message });
    }
  }
}
run();