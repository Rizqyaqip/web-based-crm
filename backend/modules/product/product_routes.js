const express = require('express');
const productController = require('./product_controller');
const { uploadProductImageMiddleware } = require('../../middlewares');

const router = express.Router();

router.get('/', (req, res) => productController.getAll(req, res));
router.get('/best-sellers', (req, res) => productController.getBestSellers(req, res));
router.get('/categories', (req, res) => productController.getCategories(req, res));
router.post('/categories/ensure-dir', (req, res) => productController.ensureCategoryDir(req, res));
router.post('/upload-image', uploadProductImageMiddleware, (req, res) => productController.uploadImage(req, res));
router.get('/:id', (req, res) => productController.getById(req, res));
router.post('/', (req, res) => productController.create(req, res));
router.put('/:id', (req, res) => productController.update(req, res));
router.delete('/:id', (req, res) => productController.delete(req, res));

module.exports = router;

