const express = require('express');
const { getAllProductWithBrandAndCategory, getPartName,getBrandsByCategory, getAllCategoriesOfAllBrand } = require('../controllers/brandController');
const router = express.Router();

router.get('/product', getAllProductWithBrandAndCategory);
router.get('', getPartName );
router.get('/brands', getBrandsByCategory );
router.get('/categories', getAllCategoriesOfAllBrand);




module.exports = router;