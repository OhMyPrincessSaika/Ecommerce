const express = require('express');
const router = express.Router();
const {AuthMiddleware,AdminMiddleware } = require('../middlewares/AuthMiddleware')
const {createBlog,updateBlog,getBlog, getAllBlogs, likeBlog,deleteBlog, dislikeBlog} = require('../controllers/Blog_Controller')
const { uploadPhoto, blogImgResize } = require('../middlewares/UploadImages');
const {uploadImages} = require('../controllers/Blog_Controller');
router.get('/:id',getBlog);
router.get('/',getAllBlogs);
router.post('/',AuthMiddleware,AdminMiddleware,createBlog);
router.patch('/:id',AuthMiddleware,AdminMiddleware,updateBlog)
router.delete('/:id',AuthMiddleware,AdminMiddleware,deleteBlog);

//like blog
router.patch('/react/likes',AuthMiddleware,likeBlog);
//dislike blog
router.patch('/react/dislikes',AuthMiddleware,dislikeBlog)
//upload images
router.patch('/upload/:id',AuthMiddleware,AdminMiddleware,uploadPhoto.array('images',2),blogImgResize,uploadImages);
module.exports = router;