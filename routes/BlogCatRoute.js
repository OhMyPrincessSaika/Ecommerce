const express = require('express');
const router = express.Router();
const {AuthMiddleware,AdminMiddleware} = require('../middlewares/AuthMiddleware');
const {createCategory, getAllCategories, getCategory, updateCategory, deleteCategory} = require('../controllers/BlogCatControl')
router.route('/').post(AuthMiddleware,AdminMiddleware,createCategory).get(getAllCategories);
router.route('/:id').get(getCategory).patch(AuthMiddleware,AdminMiddleware,updateCategory).delete(AuthMiddleware,AdminMiddleware,deleteCategory);
module.exports = router;