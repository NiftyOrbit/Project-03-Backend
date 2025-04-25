const express = require('express');
const { handleNewsletterSubscription } = require('../controllers/newsLetterController');

const router = express.Router();


router.post('/newsletter', handleNewsletterSubscription);
module.exports = router;
