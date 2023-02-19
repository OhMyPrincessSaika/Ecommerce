const express = require('express');
const router = express.Router();
const {AuthMiddleware,AdminMiddleware} = require('../middlewares/AuthMiddleware');
const {createBrand, getAllBrands, getBrand, updateBrand, deleteBrand} = require('../controllers/BrandCatControl')
router.route('/').post(AuthMiddleware,AdminMiddleware,createBrand).get(getAllBrands);
router.route('/:id').get(getBrand).patch(AuthMiddleware,AdminMiddleware,updateBrand).delete(AuthMiddleware,AdminMiddleware,deleteBrand);
module.exports = router;

