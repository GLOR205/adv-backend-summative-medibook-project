const router = require('express').Router();
const c = require('../controllers/appointmentController');

router.post('/', c.book);
router.delete('/:id', c.cancel);

module.exports = router;