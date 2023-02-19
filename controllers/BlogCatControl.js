const Category = require('../models/BlogCatModel');
const {StatusCodes} = require('http-status-codes');
const {BadRequestErr,NotFoundErr} = require('../errors');
const BadRequestError = require('../errors/BadRequestError');

const createCategory = async(req,res) => {
    const {title} = req.body;
    console.log(title);
    const category = await Category.create({title});
    if(!category) throw new BadRequestErr('Something went wrong.failed to create category.');
    res.status(StatusCodes.OK).json(category);
}

const getAllCategories = async (req,res) => {
    const categories = await Category.find({});
    if(!categories.length > 0) throw new NotFoundErr('There is no blog category listed')
    res.status(StatusCodes.OK).json({categories});
}

const getCategory = async (req,res) => {
    const {id} = req.params;
    const category = await Category.findById(id);
    if(!category)  throw new NotFoundErr(`There is no category with this id ${id}`)
    res.status(StatusCodes.OK).json({category});
}

const updateCategory = async (req,res) => {
    const {id} = req.params;
    const category = await Category.findByIdAndUpdate(
        id,
        {...req.body},
        {new : true}
    )
    if(!category) throw new NotFoundErr(`There is no category with this id ${id}`);
    res.status(StatusCodes.OK).json({category});
}

const deleteCategory = async (req, res) => {
    const {id} = req.params;
    const category = await Category.findByIdAndDelete(id);
    if(!category) throw new NotFoundErr(`There is no category to delete with this id ${id}`);
    res.status(StatusCodes.OK).json({deletedCategory:category})
}
module.exports = {createCategory,updateCategory,deleteCategory,getCategory,getAllCategories}