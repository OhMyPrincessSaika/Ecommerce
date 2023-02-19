const CustomApiError = require('../errors/CustomApiError')
const {StatusCodes} = require('http-status-codes');
const ErrorHandler = (err, req, res, next) => {
    const CustomErr = {
        statusCode : err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message : err.message || err
    }
    if(err.name === "CastError") {
        CustomErr.statusCode =StatusCodes.BAD_REQUEST;
        CustomErr.message = "Cast Error!Please provide valid Id"
    }
    if(err.code === 11000) {
        CustomErr.statusCode = StatusCodes.CONFLICT;
        CustomErr.message = "Duplicate Category is not allowed.Please provide unique category"
    }
    
    return res.status(CustomErr.statusCode).json(CustomErr.message);
}

module.exports = ErrorHandler;