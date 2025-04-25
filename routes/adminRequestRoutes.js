const express = require('express');
const router = express.Router();
const {
  createAdminRequest,
  updateApprovalStatus,
  findAllAdminRequests
} = require('../controllers/adminRequestController');

router.post('', createAdminRequest);
router.put('/updateStatus', updateApprovalStatus);
router.get('', findAllAdminRequests);

module.exports = router;
