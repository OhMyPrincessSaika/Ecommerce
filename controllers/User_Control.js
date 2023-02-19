const User = require('../models/User');
const Product = require('../models/Product');
const Cart = require('../models/CartModel');
const Coupon = require('../models/CouponModel');
const Order = require('../models/OrderModel')
const uniqid = require('uniqid');
const {BadRequestErr,NotFoundErr,ConflictErr,UnauthorizedErr} = require('../errors');
const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const sendEmail = require('./Email_Controller');
const crypto = require('crypto');
const CustomApiError = require('../errors/CustomApiError');
const createUser = async(req,res) => {
    const {email,firstname,lastname,password,mobile} = req.body;
    const isMobileExist =await User.findOne({mobile});
    if(isMobileExist) {
        throw new ConflictErr('Phone number already exists.Please provide another phone number')
    }
    const isUserExist = await User.findOne({email});
    if(!isUserExist) {
        const newUser = await User.create({...req.body});
        const token = await newUser.createJWT(); 
        res.status(200).json({user : newUser,token});
    }else {
        throw new ConflictErr('Email already exists.Try Login')
    }
}

const loginUser = async (req, res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw new NotFoundErr('Your email doesn\'t exist');
    }
    const isPassMatch = await user.ComparePass(password);
    if(!isPassMatch) {
        throw new UnauthorizedErr('Your password is not correct.')
    }
    const token = await user.createJWT();
    const newuser = await User.findByIdAndUpdate(user._id,{refreshToken:token},{new:true});
    res.cookie("token",token,{httpOnly:true, maxAge : 24* 60 * 60 * 1000})
    res.status(StatusCodes.OK).json({user:newuser,token})
}

const loginAdmin = async (req, res) => {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
        throw new NotFoundErr('Your email doesn\'t exist');
    }
    if(!user.isAdmin) throw new UnauthorizedErr('Not Authorized to enter');
    const isPassMatch = await user.ComparePass(password);
    if(!isPassMatch) {
        throw new UnauthorizedErr('Your password is not correct.')
    }
    const token = await user.createJWT();
    const newuser = await User.findByIdAndUpdate(user._id,{refreshToken:token},{new:true});
    res.cookie("token",token,{httpOnly:true, maxAge : 24* 60 * 60 * 1000})
    res.status(StatusCodes.OK).json({user:newuser,token})
}
const handleRefreshToken = async(req,res) => {
     const {cookie} = req.headers;
     if(!cookie) {
        throw new NotFoundErr('There is no refresh token in cookies');
     }
     const token = cookie.split('=')[1];
     const user =await User.findOne({refreshToken:token});
     if(!user) {
        throw new NotFoundErr('There is no user with provided token')
     }
     const decode = jwt.verify(token, process.env.JWT_SECRET);
     if(user.id !== decode.userId) {
        throw new BadReqestErr('There is something wrong with your refresh token');
     }
     const accessToken = await user.createJWT();
     res.status(StatusCodes.OK).json({accessToken})
}
//logout functionality
const logout = async (req,res) => {
    const {cookie} = req.headers;
    if(!cookie) {
        throw new NotFoundErr('There is no refresh token in cookies.')
    }
    const token = cookie.split("=")[1];
    const user = await User.findOne({refreshToken:token});
    if(!user) {
        res.clearCookie("token",{secure:true,httpOnly:true})
        return res.status(StatusCodes.NO_CONTENT).send("successfully logout")
    }
    await User.findOneAndUpdate({refreshToken:token},{"refreshToken":""});
    res.clearCookie("token",{httpOnly:true,secure:true})
    return res.status(StatusCodes.NO_CONTENT).send("successfully logout")
}

//get All users
const getAllUsers = async (req,res) => {
    const users =await User.find({});
    if(!users) {
        throw new NotFoundErr('There is no user.')
    }
    res.status(StatusCodes.OK).json(users);
}

//get Single User 
const getSingleUser = async(req,res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user) {
        
        throw new NotFoundErr(`There is no user with id ${id}`)
    }
    res.status(StatusCodes.OK).json(user);
}

//delete user
const deleteSingleUser = async(req,res) => {
    const {id} = req.params;
    const user = await User.findByIdAndDelete(id);
    if(!user) {
        throw new NotFoundErr(`There is no user with id ${id}`)
    }
    res.status(StatusCodes.OK).json(user);
}

//update user
const updateUser = async(req,res) => {
    const {id} = req.params;
    const user = await User.findByIdAndUpdate(id,{...req.body},{new: true,runValidator: true});
    if(!user) {
        throw new NotFoundErr(`There is no user with id ${id}`)
    }
    res.status(StatusCodes.OK).json(user);
}

//block user
const blockUser = async (req,res) => {
    const {id} = req.params;
    const toBeBlocked = await User.findByIdAndUpdate(id,{isBlocked: true},{new: true});
    console.log(toBeBlocked);
    if(!toBeBlocked) {
        throw new NotFoundErr(`there is no such user with id ${id}`)
    }
    res.status(StatusCodes.OK).send("User blocked")
}
const unblockUser = async (req,res) => {
    const {id} = req.params;
    const toBeUnBlocked = await User.findByIdAndUpdate(id,{isBlocked: false},{new: true});
    if(!toBeUnBlocked) {
        throw new NotFoundErr(`there is no such user with id ${id}`)
    }
    res.status(StatusCodes.OK).send("User unblocked")
}

const getAllBlockedUser = async(req, res) => {
    console.log("all blocked users")
    const blockedUsers = await User.find({isBlocked: true});
    console.log(blockedUsers)
    if(!blockedUsers.length > 0) {
        throw new NotFoundErr('There is no blocked users.')
    }
    res.status(StatusCodes.OK).json(blockedUsers);
}

const updateUserPassword = async(req,res) => {
    const { _id } = req.user;
    const { password } = req.body;
    if(!password) {
        throw new BadReqestErr('Please provide email and password')
    }
    const user = await User.findById(_id);
    if(!user) {
        throw new NotFoundErr('There is no user with this email')
    }
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
}

const forgotPasswordToken = async(req,res) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user) throw new NotFoundErr('There is no user with this email');
    const token = await user.createPasswordResetToken();;
    await user.save()
    const resetURL = `Hi, Please follow this link to reset password.This link is valid till 10 minutes from now.<br><a href='http://localhost:3000/api/user/reset-password/${token}'>Click Here</a>`
    const data =  {
        to : email,
        text: "Hello User ....",
        subject : "Forgot Password Link",
        htm : resetURL,
    }
    sendEmail(data);
    res.json(data);
}
const resetPassword = async(req,res) => {
    const {password} = req.body;
    const {token} = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken : hashedToken,
        passwordResetExpires : {$gt : Date.now()}
    })
    if(!user) {
        throw new CustomApiError('Your token is expired or invalid.Try again later..')
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(StatusCodes.OK).json(user);

}

const getWishlists = async(req,res) => {
    const { _id} = req.user;
    const user = await User.findById(_id).populate("wishlist");
    const wishlists = user.wishlist;
    if(!wishlists.length > 0) {
       throw new NotFoundErr('There is no wishlists');
    }
    res.status(StatusCodes.OK).json({wishlists});
  }

const saveAddress = async(req,res) => {
    const {_id} = req.user;
    const {address} = req.body;
    if(!address) throw new BadRequestErr('Please provide address.')
    const user = await User.findByIdAndUpdate(
        _id,
         {$set : { address : address }},
        {new : true}
        );
  
    if(!user) throw new BadRequestErr('failed to update the user');
    res.status(StatusCodes.OK).json(user);
}

const addToCart = async(req,res) => {
     const  {productId,count,color} = req.body;
     const  {_id} = req.user;
     const user = await User.findById(_id);
     if(!user) throw new NotFoundErr(`there is no user with this id ${_id}`)
     //check if user already have product in cart
    const UserCart = await Cart.findOne({orderBy : user._id});
    const cartItems = UserCart?.products;
    console.log(cartItems);
    const products = [];
    
    let isProductExist = cartItems?.find((item) => {
            return item.product.toString() === productId});
         
    if(isProductExist) {
            console.log("product exists"+isProductExist)
            let total = await Cart.findOne({orderBy:user._id}).select("cartTotal").exec();
            let cartTotal = total.cartTotal;
            console.log("carttotal"+cartTotal)
            const price = isProductExist.price;
            cartTotal += price * count;
            console.log("after adding" + cartTotal)
            for(let j=0;j< cartItems.length; j++) {
                    
                    const updatedProduct = await Cart.findOneAndUpdate(
                        {[`products.${j}.product`]:productId},
                        {
                            $inc : {[`products.${j}.count`] : count},
                            $set : {cartTotal}
                        },
                        {new : true}
                    )
                    // console.log(updatedProduct)
                    if(updatedProduct) {
                        return res.status(StatusCodes.OK).json(updatedProduct);
                    }
                }
                // console.log("updatedProduct"+updatedProduct);
            }
            // if(!updatedCart) throw new BadRequestErr('failed to update cart')
            // return res.status(StatusCodes.OK).json(updatedCart);
    else{
            console.log("product doesn't exist")
            const obj = {};
            obj.product = productId;
            obj.count = count;
            obj.color = color;
            const getPrice = await Product.findById(productId).select("price").exec();
            obj.price = getPrice.price;
            products.push(obj);
            console.log(products);
            let total = await Cart.findOne({orderBy:user._id}).select("cartTotal").exec();
            let cartTotal = total ? total.cartTotal : 0;
            cartTotal += count * getPrice.price;
            const insertProduct = await Cart.findOneAndUpdate(
                {orderBy : user._id},
                {
                    $push : {products},
                    $set : {cartTotal}
                },
                {new :true}
            )
            if(!insertProduct) {
                const firstTimeInsert = await Cart.create({products,orderBy:user._id,cartTotal})
                return res.status(StatusCodes.OK).json(firstTimeInsert);
            }
            return res.status(StatusCodes.OK).json(insertProduct)
            
        } 
}

const getCart = async(req,res) => {
    const {_id} = req.user;
    const cart = await Cart.findOne({orderBy : _id}).populate("products.product");
    if(!cart) throw new BadRequestErr(`there's no cart`)
    res.status(StatusCodes.OK).json(cart);
}

const emptyCart = async(req,res) => {
    const {_id} = req.user;
    const user = await User.findOne({_id});
    const cart = await Cart.findOneAndDelete({orderBy: user._id});
    if(!cart) throw new Error('failed to delete product');
    res.status(StatusCodes.OK).json(cart);
}

const applyCoupon = async(req,res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    const validCoupon = await Coupon.findOne({ name : coupon});
    if(!validCoupon) throw new BadRequestErr('The coupon you provided is invalid');
    const user = await User.findOne({_id});
    // console.log(user);
    let cart = await Cart.findOne({orderBy: user._id}).populate('products.product');
  
    if(!cart) throw new NotFoundErr("there is no cart so you can't apply coupon")
    const totalBeforeDiscount = cart.cartTotal;
   
    let totalAfterDiscount = (totalBeforeDiscount - (totalBeforeDiscount * validCoupon.discount) /100).toFixed(2);
    console.log(totalAfterDiscount)
    await Cart.findOneAndUpdate(
        {orderBy:user._id},
        {totalAfterDiscount},
        {new : true}
    )
    res.json(totalAfterDiscount)
}

const createOrder = async(req,res) => {
    const {COD, couponApplied} = req.body;
    const { _id } = req.user;
    if(!COD) throw new BadRequestErr('create cash order failed')
    const user = await User.findById(_id);
    let userCart = await Cart.findOne({orderBy: user._id});
    let finalAmount = 0;
    if(couponApplied && userCart.totalAfterDiscount) {
        console.log("coupon applied")
        finalAmount = userCart.totalAfterDiscount ;
    }else {
        finalAmount = userCart.cartTotal  ;
    }

    let newOrder = await Order.create(
        {products : userCart.products,
        paymentIntent : {
            id : uniqid(),
            method :"COD",
            amount : finalAmount,
            status : "Cash On Delivery",
            created : Date.now(),
            currency : "usd"
        },
        orderBy : user._id,
        orderStatus : "Cash On Delivery"
        }
    )
    //update in product model
    let update = userCart.products.map((item) => {
        return {
            updateOne : {
                filter : {_id : item.product._id},
                update : {$inc : {quantity : -item.count,sold: +item.count}},
            }
        }
    })
    const updated = await Product.bulkWrite(update,{});
    res.status(StatusCodes.OK).json({status : "success"})
}


const getOrders = async(req,res) => {
    const { _id } = req.user;
    const userOrders = await Order.findOne({orderBy : _id}).populate("products.product").exec();
    if(!userOrders) throw new NotFoundErr(`there is no orders in user id ${_id}`);
    res.status(StatusCodes.OK).json(userOrders)
}

const updateOrderStatus = async(req,res) => {
    const {status} = req.body;
    const {id} = req.params;
    const updateOrder = await Order.findByIdAndUpdate(
        id,
        {orderStatus : status,
        paymentIntent : {
            status : status
        }
        },
        {new : true}
    )
    res.status(StatusCodes.OK).json(updateOrder)
}
module.exports = {handleRefreshToken,createUser,loginUser,getAllUsers,
    getSingleUser,logout,updateUserPassword,forgotPasswordToken,resetPassword,
    deleteSingleUser,updateUser,blockUser,unblockUser,getAllBlockedUser,getWishlists,loginAdmin,
    saveAddress,addToCart,getCart,emptyCart,applyCoupon,createOrder,getOrders
    ,updateOrderStatus
};