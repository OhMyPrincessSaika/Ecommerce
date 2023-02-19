const Blog = require('../models/BlogModel');
const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const {BadRequestErr,NotFoundErr} = require('../errors');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs');
const createBlog = async(req,res) => {
    const newBlog = await Blog.create(req.body);
    if(!newBlog) throw new BadRequestErr('failed to create blog')
    res.json({
        status: 'success',
        newBlog
    })
}
const updateBlog = async(req,res) => {
    const {id} = req.params;
    const updateBlog = await Blog.findByIdAndUpdate(id,req.body,{new :true});
    if(!updateBlog) throw new BadRequestErr('failed to update blog.')
    res.status(StatusCodes.OK).json({blog : updateBlog})
}

const getBlog = async(req,res) => {
    const {id} = req.params;
    const blog = await Blog.findById(id);
    const updateView = await Blog.findByIdAndUpdate(id,
        {
            $inc : {numViews : 1}
        },
        {new: true}
        )
    if(!blog) throw new NotFoundErr(`there is no blog with id ${id}`);
    res.status(StatusCodes.OK).json({updateView});
}

const getAllBlogs = async(req,res) => {
    const blogs = await Blog.find({});
    if(!blogs.length > 0) {
        throw new NotFoundErr('There is no blogs');
    }
    res.status(StatusCodes.OK).json({status: "success",blogs,hits:blogs.length});
}

const deleteBlog = async(req,res) => {
    const {id} = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if(!blog) throw new BadRequestErr('failed to delete because of invalid id');
    res.status(StatusCodes.OK).json(blog);
}

const likeBlog = async(req,res) => {
    const {blogId} = req.body;
    const blog = await Blog.findById(blogId);
    if(!blog) throw new BadRequestErr(`There is no blog with this id ${blogId}`)
    const loginUserId = req.user._id;
    console.log(loginUserId);
    const isLiked = blog.isLiked;
    const disliked = blog?.dislikes?.find((userId) => {
        console.log(userId,loginUserId);
       return userId.toString() ===  loginUserId.toString()
    });
    if(disliked) {
        console.log('already disliked')
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull : {dislikes : loginUserId},
                isDisliked :false,
                isLiked: true,
                $push : {likes : loginUserId}
            },
            {
                new : true
            }
            )
            res.status(StatusCodes.OK).json(blog);
    }
    else if(isLiked) {
        console.log("liked")
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $pull : {likes : loginUserId},
                isLiked : false,
                isDisliked: true
            },
            {
                new : true
            })
            res.status(StatusCodes.OK).json(blog);
    }
    else {
        console.log("first liked")
        const blog = await Blog.findByIdAndUpdate(blogId,
            {
                $push : {likes : loginUserId} ,
                isLiked : true
            },
            {
                new: true
            }
            )
        res.status(StatusCodes.OK).json(blog);
    }
}

//dislike a blog 

const dislikeBlog = async (req,res) => {
    const {blogId} = req.body;
    const loginUserId = req.user._id;
    const blog  = await Blog.findById(blogId);
    if(!blog)  throw new NotFoundErr(`cannot find blog with id ${blogId}`);
    
    const isDisliked = blog.isDisliked;
    const alreadyLiked = blog.likes.find((userId) => userId.toString() === loginUserId.toString());
    if(alreadyLiked) {
        console.log('already liked')
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull : { likes : loginUserId},
                isLiked : false,
                isDisliked: true,
                $push : { dislikes : loginUserId}
            },
            {
                new : true
            }
        )
        res.status(StatusCodes.OK).json(blog);
    }
    else if(isDisliked) {
        console.log('disliked')
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $pull : {dislikes : loginUserId},
                isDisliked : false
            },
            {
                new : true
            }
        )
        res.status(StatusCodes.OK).json(blog);
    }else {
        console.log('first disliked')
        const blog = await Blog.findByIdAndUpdate(
            blogId,
            {
                $push : { dislikes : loginUserId},
                isDisliked: true
            },
            {
                new : true
            }
        )
        res.status(StatusCodes.OK).json(blog);
    }
}

const uploadImages = async(req,res) => {
    const {id} = req.params;
    const urls = [];
    const files = req.files;
   
    for(const file of files) {
      const {path} = file;
      const newPath = await cloudinaryUploadImg(path,"images")
      urls.push(newPath)
    
    }
    const finalProduct = await Blog.findByIdAndUpdate(
      id ,
      {images : urls.map((file) => file)},
      {new :true}
    )
    res.status(StatusCodes.OK).json(finalProduct);
 }
 
module.exports = {createBlog,updateBlog,getBlog,getAllBlogs,deleteBlog,likeBlog,dislikeBlog,uploadImages};