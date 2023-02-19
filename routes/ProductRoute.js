const express = require('express');
const { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct, addToWishList, rating, uploadImages } = require('../controllers/Product_Ctrl');
const router = express.Router();
const {AdminMiddleware,AuthMiddleware}= require('../middlewares/AuthMiddleware');
const { uploadPhoto, productImgResize } = require('../middlewares/UploadImages');

router.post('/',[AuthMiddleware,AdminMiddleware],createProduct)
router.get('/',getAllProducts)
router.get('/:id',getProduct)
router.patch('/:id',[AuthMiddleware,AdminMiddleware],updateProduct)
router.delete('/:id',[AuthMiddleware,AdminMiddleware],deleteProduct)

//add to wishlist
router.patch('/wishlist/:prodId',AuthMiddleware,addToWishList);
router.patch('/rating/:prodId',AuthMiddleware,rating)
//upload image
router.patch('/upload/:id',AuthMiddleware,AdminMiddleware,uploadPhoto.array('images',10),productImgResize,uploadImages);
module.exports = router;