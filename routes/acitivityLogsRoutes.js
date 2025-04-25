const express = require('express');
const { findAllLogs, findUser, getActivityLogs, findByOrder } = require('../controllers/activityLogsController');
const router = express.Router();

router.get('/activity-logs', findAllLogs);
router.get('/activity-logs/detail', findUser);
router.get('/activity-logs/UserEmail', getActivityLogs);
router.get('/activity-logs/Orderid', findByOrder);




module.exports = router;
