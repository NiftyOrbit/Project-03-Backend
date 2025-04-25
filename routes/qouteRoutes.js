const express = require('express');

const router = express.Router();
const { handleQuoteRequest } = require("../controllers/qouteController");


router.post('/quote', handleQuoteRequest);
module.exports = router;

