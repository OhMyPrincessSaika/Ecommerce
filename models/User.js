const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    lastname:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:[true,'Phone number already exists.'],
    },
    password:{
        type:String,
        required:true,
    },
    isAdmin : {
        type:Boolean,
        default: false
    },
    isBlocked : {
        type:Boolean,
        default: false
    },
    cart : {
        type: Array,
        default : []
    },
    address : [{
        type : String
    }],
    wishlist :[{
        type :mongoose.Types.ObjectId,
        ref : "Product"
    }],
    refreshToken : {
        type: String
    },
    passwordChangedAt : Date,
    passwordResetToken : String,
    passwordResetExpires : Date
},
    {timestamps : true}
);

userSchema.pre('save' ,async function(next) {
    if(!this.isModified('password')) {
        next();
    }
    const salt =await bcrypt.genSalt(10);
    this.password =await bcrypt.hash(this.password,salt);
   
})

userSchema.methods.ComparePass = async function (enterPass) {
    return bcrypt.compare(enterPass,this.password);
}

userSchema.methods.createJWT = async function () {
    return jwt.sign({userId:this._id},process.env.JWT_SECRET,{expiresIn : '3d'});
}
userSchema.methods.refreshJWT = async function() {
    return jwt.sign({userId :this._id},process.env.JWT_SECRET,{expiresIn : '1d'});
}

userSchema.methods.createPasswordResetToken = async function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log("Reset Token:"+resetToken)
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest("hex");
    console.log("passwordResetToken:"+this.passwordResetToken)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;//10 minutes
    return resetToken;
}
//Export the model
module.exports = mongoose.model('User', userSchema);