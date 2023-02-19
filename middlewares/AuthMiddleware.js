const {StatusCodes} =  require('http-status-codes');
const jwt = require('jsonwebtoken')
const {UnauthorizedErr} = require('../errors');
const User = require('../models/User');
const AuthMiddleware = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer')){ 
        throw new UnauthorizedErr('Unauthroized to access');
    }
    const token = authHeader.split(' ')[1];
    const decode = await jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decode.userId);
    next();
}

const AdminMiddleware = async (req,res,next) => {
    const {email} = req.user;
    const isAdminUser = await User.findOne({email,isAdmin:true});
    if(!isAdminUser) {
        throw new UnauthorizedErr('You are not admin.You can\'t access.');
    }
    next();
}   

module.exports = {AuthMiddleware,AdminMiddleware};