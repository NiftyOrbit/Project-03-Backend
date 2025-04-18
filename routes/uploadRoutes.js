// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const { uploadBulkData, uploadBulkDataCategory, uploadBulkDataBrand, uploadBulkDataSubcategory, uploadBulkDataBrandcategory } = require('../controllers/uploadController');
const upload = require('../middleware/upload');

router.post('/product', upload.single('file'), uploadBulkData);
router.post('/category', upload.single('file'), uploadBulkDataCategory);
router.post('/brand', upload.single('file'), uploadBulkDataBrand);
router.post('/subcategory', upload.single('file'), uploadBulkDataSubcategory);
router.post('/brandcategory', upload.single('file'), uploadBulkDataBrandcategory);



module.exports = router;
