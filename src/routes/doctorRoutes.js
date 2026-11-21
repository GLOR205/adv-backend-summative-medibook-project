const router = require('express').Router();
const doctors = require('../controllers/doctorController');
const reports = require('../controllers/reportController');

router.route('/').get(doctors.getAll).post(doctors.create);
router.route('/:id').get(doctors.getOne).put(doctors.update).delete(doctors.remove);
router.get('/:id/stats', reports.doctorStats);

module.exports = router;