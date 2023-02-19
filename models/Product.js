const mongoose = require('mongoose'); // Erase if already required
const User = require('../models/User')
// Declare the Schema of the Mongo model
var ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required :[true, "please provide product title."]
    },
    slug:{
        type:String,
        required:true,
        unique:true,
        trim : true,
        lowercase:true
    },
    description:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    category : {
        type : String,
        requried: [true,"please provide the category"],
        lowercase : true
    },
    brand : {
        type : String,
        requried : [true,"please provide the brand name"],
        lowercase : true
    },
    quantity : {
        type : Number,
        required: [true,"please provide quantity"]
    },
    sold : {
        type : Number,
        default : 0
    },
    images : [],
    color : {
        type : String,
        required : [true,'please provide color'],
        lowercase :true
    },
    ratings : [{
        star : Number,
        comment : String,
        postedBy : {type :mongoose.Types.ObjectId,ref:"User"}
    }],
    averageRating : {
        type : Number,
        default : 0  
    }
},
    {timestamps : true}
);

//Export the model
module.exports = mongoose.model('Product', ProductSchema);