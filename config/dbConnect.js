const mongoose = require('mongoose');

const dbConnect = (url) => {
    mongoose.set('strictQuery',false);
    return mongoose.connect(url,{
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}

module.exports = dbConnect;