const express = require('express');
const app = express();
require('express-async-errors')
require('dotenv').config();
const morgan = require('morgan')
//router
const couponRouter = require('./routes/CouponRoute')
const brandCategoryRouter = require('./routes/BrandRoute');
const blogCategoryRouter = require('./routes/BlogCatRoute');
const categoryRouter = require('./routes/CategoryRoute');
const blogRouter = require('./routes/BlogRoute')
const productRouter = require('./routes/ProductRoute')
const authRouter = require('./routes/AuthRoute');
const PORT = process.env.PORT || 3000;

const connectDB = require('./config/dbConnect');
//middlewares
const notFoundMiddleware = require('./middlewares/NotFound')
const errorHandler = require('./middlewares/ErrorHandler');
const {AuthMiddleware,AdminMiddleware} = require('./middlewares/AuthMiddleware');

app.use(express.json());
app.use(morgan("combined"));
app.use('/api/user',authRouter);
app.use('/api/product',productRouter)
app.use('/api/blog',blogRouter);
app.use('/api/category',categoryRouter)
app.use('/api/blog-category',blogCategoryRouter)
app.use('/api/brand-category',brandCategoryRouter)
app.use('/api/coupon',couponRouter);
app.use('/',(req,res)=> res.send("Hello World"))
app.use(notFoundMiddleware)
app.use(errorHandler);
const start = async () => {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT , () => {
        console.log(`Server is listening on port ${PORT}`)
    })

}
start();