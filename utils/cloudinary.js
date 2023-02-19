const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: "dhtjmbn8s",
    api_key: "668647632122152",
    api_secret: "AlYYoXsD5ju6xMRDSob2Ae_oiDU"
  });


const cloudinaryUploadImg = async(fileToUpload) => {
    const result = await cloudinary.uploader.upload(fileToUpload,{resource_type:"auto"});
    return {url : result.secure_url};
}

module.exports = cloudinaryUploadImg