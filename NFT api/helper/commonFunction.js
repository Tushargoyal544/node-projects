const nodemailer = require("nodemailer");
const cloudniery = require('cloudinary').v2
cloudniery.config({
    cloud_name:'tushar1998',
    api_key:"526142449962623",
    api_secret:"twc2JS_W63ATpEf6FHI8Xy7Ep48"
})
module.exports = {
    sendMail(email, subject, text, callback){
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "no-tushar@mobiloitte.com",
                pass:""
            }
        });
        const mailOptions = {
            from: "no-tushar@mobiloitte.com",
            to: email,
            subject: subject,
            text: text
        }
        transporter.sendMail(mailOptions, (error, result)=>{
            if(error){
                console.log(error);
                callback(error, null);
            } else{
                console.log("Email sent: "+ result.response);
                callback(null, result.response);
            }
        });
    },
    getOtp(){
        let otp = Math.floor((Math.random() * 100000) + 100000);
        return otp;
    },
    // uploadImage:async(image,next)=>{
    //     var result =await cloudniery.uploader.upload(image)
    //         if(result){
    //             return result.secure_url
    //             // callback(error,null)
    //             // next(null,result.secure_url)
    //         }else{
    //             // callback(error,null)
    //             return response.send({responceCode:501,responceMessage:""})

    //         }
    
    // }
    uploadImage:(image,callback)=>{
        cloudniery.uploader.upload(image,(error,result)=>{
            if(error){
                callback(error,null)
            }else{
                callback(null,result.secure_url)
            }
        })
    }
}