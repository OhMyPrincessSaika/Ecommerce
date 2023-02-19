const Brand = require('../models/BrandCatModel');
const {StatusCodes} = require('http-status-codes');
const {BadRequestErr,NotFoundErr} = require('../errors');
const BadRequestError = require('../errors/BadRequestError');

const createBrand = async(req,res) => {
    let {brand}  = req.body;
    if(!brand) throw new BadRequestErr('You must provide brand value')
    const createdBrand = await Brand.create({...req.body});
    if(!createdBrand) throw new BadRequestErr('Something went wrong.failed to create Brand.');
    res.status(StatusCodes.OK).json(createdBrand);
}

const getAllBrands = async (req,res) => {
    const categories = await Brand.find({});
    if(!categories.length > 0) throw new NotFoundErr('There is no blog Brand listed')
    res.status(StatusCodes.OK).json({categories});
}

const getBrand = async (req,res) => {
    const {id} = req.params;
    const Brand = await Brand.findById(id);
    if(!Brand)  throw new NotFoundErr(`There is no Brand with this id ${id}`)
    res.status(StatusCodes.OK).json({Brand});
}

const updateBrand = async (req,res) => {
    const {id} = req.params;
    const Brand = await Brand.findByIdAndUpdate(
        id,
        {...req.body},
        {new : true}
    )
    if(!Brand) throw new NotFoundErr(`There is no Brand with this id ${id}`);
    res.status(StatusCodes.OK).json({Brand});
}

const deleteBrand = async (req, res) => {
    const {id} = req.params;
    const Brand = await Brand.findByIdAndDelete(id);
    if(!Brand) throw new NotFoundErr(`There is no Brand to delete with this id ${id}`);
    res.status(StatusCodes.OK).json({deletedBrand:Brand})
}
module.exports = {createBrand,updateBrand,deleteBrand,getBrand,getAllBrands}