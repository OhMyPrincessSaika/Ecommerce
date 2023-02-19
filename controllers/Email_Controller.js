const nodemailer = require('nodemailer');


const sendEmail = async(data,req,res) => {
    let transporter = nodemailer.createTransport({
        service : 'gmail',

        auth: {
          user: process.env.MAIL_ID, // generated ethereal user
          pass: process.env.MP, // generated ethereal password
        },
      });
    
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '<momo2752002@gmail.com>', // sender address
        to: data.to, // list of receivers
        subject: data.subject, // Subject line
        text: data.text, // plain text body
        html:data.htm, // html body
      },(err,info) => {
        if(err) {
          console.log(err);
        }else{
          console.log("Email sent: "+info.response)
        }
      });
    
 
}

module.exports = sendEmail;