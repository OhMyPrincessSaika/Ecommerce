const Product = require('../models/Product');
const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const {BadRequestErr,NotFoundErr} = require('../errors')
const slugify = require('slugify');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs');
const createProduct = async (req,res) => {
    if(req.body.title) {
        req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.status(StatusCodes.OK).json({newProduct})
}
 const getProduct = async(req,res) => {
    const {id} = req.params;
    const product = await Product.find({_id:id});
    if(!product) throw new NotFoundErr(`there is no such product with id ${id}`);
    res.status(StatusCodes.OK).json({product});
 }

 const getAllProducts  = async (req,res) => {
    let {sort,page,limit,numericFields,fields,title,category,brand} = req.query;
    const queryObj = {};
    
    if(title) {
      queryObj.title = {$regex : title,$options: 'i'};
    }
    if(category) {
      queryObj.category = category;
    }
    if(brand) {
      queryObj.brand = brand;
    }
    
    if(numericFields) {
      const Symbols = {
         '>=' : '$gte',
         '>'  : '$gt',
         '<=' : '$lte',
         '<'  : '$lt',
         '='  : '$eq'
       }
      const regex = /\b(<|>|>=|<=|=)\b/g;
      let result = numericFields.replace(regex,(match) => `-${Symbols[match]}-`)
      console.log(result);
      result = result.split(',').forEach((item) => {
         const [key,operator,value] = item.split('-');
         queryObj[key] = {[operator] : value}
      })
    }
    
    const result =  Product.find(queryObj);

    //sorting
    if(sort) {
       const sortList = sort.split(',').join(' ');
       result.sort(sortList);
    }else {
      result.sort('-createdAt')
    }

    //selecting fields
    if(fields) {
      fields = fields.split(',').join(' ');
      result.select(fields);
    }else{
      result.select('-__v')
    }

    //pagination
    if(page) {
       const skip = (page-1) * limit;
       result.skip(skip).limit(limit);
    }
    const products = await result;
    if(products.length < 1) {
        throw new NotFoundErr('There is no product')
    }
    res.status(StatusCodes.OK).json({products,hits:products.length})
 }

 const updateProduct = async (req,res) => {
    const {id} = req.params;
    if(req.body.title) req.body.slug = slugify(req.body.title);
    const updatedProduct = await Product.findByIdAndUpdate(id,{...req.body},{new:true})
    if(!updatedProduct) throw new NotFoundErr('Cannot find your product to update.')
    res.status(StatusCodes.OK).json({product : updatedProduct})
 }

 const deleteProduct = async(req,res) => {
    const {id} = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id,{new:true});
    if(!deletedProduct) throw new NotFoundErr('Cannot find your product to delete');
    res.status(StatusCodes.OK).json({deletedProduct})
 }

 const addToWishList = async(req,res) => {
  const {_id} = req.user;
  const {prodId} = req.params;
  const user = await User.findById(_id);
  if(!prodId) throw new BadRequestErr('you must provide product to be added to wishlist');
  const isProductExist = await Product.findById(prodId);
  console.log(isProductExist);
  if(!isProductExist) throw new NotFoundErr('The product was not found.please provide valid id');
  const alreadyAdded = user.wishlist.find((productId) => productId.toString() === prodId.toString());
  
  if(alreadyAdded) {
    let user = await User.findByIdAndUpdate(
      _id ,
      {
        $pull : {wishlist:  prodId}
      },
      {
        new : true
      }
    )
    res.status(StatusCodes.OK).json(user);
  }else {
    let user = await User.findByIdAndUpdate(
      _id,
      {
        $push : {wishlist : prodId}
      },
      {
        new : true
      }
      )
    res.status(StatusCodes.OK).json(user);
  }
 }

 const rating = async (req,res) => {
    const {_id} = req.user;
    const {prodId} = req.params;
    const {star,comment} = req.body;
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find((userId)=> userId.postedBy.toString() === _id.toString());
    console.log(alreadyRated);
    if(alreadyRated) {
       await Product.updateOne(
        {
          ratings : {$elemMatch : alreadyRated} 
        },
        {
          $set : {"ratings.$.star" : star},$set : {"ratings.$.comment" : comment}
        },
        {
          new : true
        }
      )
    }else {
      await Product.findByIdAndUpdate(
        prodId,
        { 
          $push : {
            ratings : {
              star : star,
              comment,
              postedBy : _id
            }
          }
        },
        {new : true}
      )

    }
    const getAllRatings = await Product.findById(prodId);
    let ratingLength = getAllRatings.ratings.length;
    let totalrating = getAllRatings.ratings
    .map((item) => item.star)
    .reduce((prev,cur) => prev+cur,0);
    let actucalRating = Math.round(totalrating/ratingLength);
    let finalResult = await Product.findByIdAndUpdate(
      prodId,
      {
        totalRating : actucalRating
      },
      {
        new : true
      }
    )
      res.status(StatusCodes.OK).json(finalResult)
 }

 const uploadImages = async(req,res) => {
    const {id} = req.params;
    const urls = [];
    const files = req.files;
   
    for(const file of files) {
      const {path} = file;
      const newPath = await cloudinaryUploadImg(path,"images")
      urls.push(newPath)
      fs.unlinkSync(path);
    }
    const finalProduct = await Product.findByIdAndUpdate(
      id ,
      {images : urls.map((file) => file)},
      {new :true}
    )
    res.status(StatusCodes.OK).json(finalProduct);
 }
 

module.exports = {createProduct,getProduct,getAllProducts,updateProduct,deleteProduct,addToWishList,rating,uploadImages}
