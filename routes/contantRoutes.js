const express = require('express');

const router = express.Router();
const { handleContactRequest } = require("../controllers/contantController");


router.post('/contact', handleContactRequest);
module.exports = router;
