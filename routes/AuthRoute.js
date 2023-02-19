const express = require('express');

const router = express.Router();
const {createUser,loginUser,getAllUsers,forgotPasswordToken,getSingleUser,deleteSingleUser,updateUserPassword,updateUser,blockUser,unblockUser, getAllBlockedUser, handleRefreshToken, logout, resetPassword, getWishlists, loginAdmin, saveAddress, addToCart, getCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus} = require('../controllers/User_Control') 
const {AdminMiddleware,AuthMiddleware} = require('../middlewares/AuthMiddleware');
router.post('/register',createUser);
router.post('/login',loginUser)
//admin login
router.post('/admin-login',loginAdmin);
//save address
router.post('/address',AuthMiddleware,saveAddress)
//add to cart
router.post('/add-to-cart',AuthMiddleware,addToCart)
//get cart
router.get('/cart',AuthMiddleware,getCart)
//delete cart
router.delete('/empty-cart',AuthMiddleware,emptyCart)
//apply coupon
router.post('/cart/apply-coupon',AuthMiddleware,applyCoupon)
//create-order
router.post('/cart/create-order',AuthMiddleware,createOrder)
//get orders
router.get('/cart/orders',AuthMiddleware,getOrders)
//update order
router.patch('/order/update-order/:id',AuthMiddleware,AdminMiddleware,updateOrderStatus)
router.get('/admin/users',[AuthMiddleware,AdminMiddleware],getAllUsers);
router.get('/admin/users/:id',getSingleUser)
router.delete('/admin/users/:id',deleteSingleUser)
router.patch('/admin/users/:id',AuthMiddleware,updateUser)
router.patch('/blocked/:id',[AuthMiddleware,AdminMiddleware],blockUser);
router.patch('/unblocked/:id',[AuthMiddleware,AdminMiddleware],unblockUser);
router.get('/blocked_users',getAllBlockedUser)
router.get('/refresh',handleRefreshToken)
router.get('/logout',logout)
//reset password 
router.post('/reset-password/:token',resetPassword)
//forgot password token
router.post('/forgot-password-token',forgotPasswordToken)
//update password
router.patch('/password',AuthMiddleware,updateUserPassword);
//get wishlists
router.get('/wishlist',AuthMiddleware,getWishlists);
module.exports = router;