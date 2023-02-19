const express = require('express');
const {AuthMiddleware,AdminMiddleware} = require('../middlewares/AuthMiddleware');
const { createCoupon, getAllCoupon, getCoupon, updateCoupon, deleteCoupon } = require('../controllers/Coupon_Controller');
const router = express.Router();

router.post('/',AuthMiddleware,AdminMiddleware,createCoupon)
router.get('/',AuthMiddleware,getAllCoupon);
router.route('/:id').get(AuthMiddleware,getCoupon).patch(AuthMiddleware,updateCoupon)
.delete(AuthMiddleware,deleteCoupon)

module.exports = router;