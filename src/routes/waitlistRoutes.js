const router = require('express').Router();
const c = require('../controllers/appointmentController');

router.post('/', c.joinWaitlist);

module.exports = router;