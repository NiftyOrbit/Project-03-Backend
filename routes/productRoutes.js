const express = require('express');
const { findAllProducts, uploadProduct, deleteProduct, updateProduct } = require('../controllers/productController');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('', findAllProducts);
router.post('/upload', upload.single('image'), uploadProduct);
router.delete('/:id', deleteProduct);
router.put('/:id', upload.single('image'), updateProduct);





module.exports = router;
