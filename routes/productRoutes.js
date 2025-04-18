const express = require('express');
const { findAllProducts } = require('../controllers/productController');
const router = express.Router();

router.get('', findAllProducts);




module.exports = router;
