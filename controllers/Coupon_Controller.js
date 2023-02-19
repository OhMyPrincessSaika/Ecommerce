const Coupon = require('../models/CouponModel');

const {StatusCodes} = require('http-status-codes');
const {BadRequestErr,NotFoundErr} = require('../errors');

const createCoupon = async(req,res) => {
    const {name , expiry, discount} = req.body;
    if(!name || !expiry || !discount) throw new BadRequestErr('provide all fields:name,expiry,discount');
    const newCoupon =await Coupon.create(req.body); 
    res.status(StatusCodes.OK).json(newCoupon);
}

const getAllCoupon = async(req,res) => {
    const coupons = await Coupon.find({});
    if(!coupons.length > 0) throw new NotFoundErr('there is no coupons');
    res.status(StatusCodes.OK).json(coupons);
}

const getCoupon = async(req,res) => {
    const {id} = req.params;
    if(!id)throw new BadRequestErr('please provide coupon id')
    const coupon = await Coupon.findById(id);
    if(!coupon) throw new NotFoundErr(`there is no coupon with this id ${id}`);
    res.status(StatusCodes.OK).json(coupon);
}

const updateCoupon = async(req,res) => {
    const {id} = req.params;
    if(!id)throw new BadRequestErr('please provide coupon id')
    const updatedCoupon = await Coupon.findByIdAndUpdate(
        id,
        {...req.body},
        {new : true}
    )
    if(!updatedCoupon) throw new BadRequestErr('something went wrong.cannot update coupon.')
    res.status(StatusCodes.OK).json(updatedCoupon);
}

const deleteCoupon = async(req,res) => {
    const {id} = req.params;
    if(!id)  throw new BadRequestErr('please provide coupon id to delete');
    const deletedCoupon = await Coupon.findByIdAndDelete(id);
    if(!deletedCoupon) throw new BadRequestErr('something went wrong.cannot delete your coupon.try again later');
    res.status(StatusCodes.OK).json(deletedCoupon);
}
module.exports = {createCoupon,getAllCoupon,updateCoupon,getCoupon,deleteCoupon};