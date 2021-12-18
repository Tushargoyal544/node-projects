const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
const cloudniery = require('cloudinary').v2

cloudniery.config({
    cloud_name:'tushar1998',
    api_key:"526142449962623",
    api_secret:"twc2JS_W63ATpEf6FHI8Xy7Ep48"
})

module.exports = {
    sendMail:async(email, subject, text)=>{
       
        const transporter =nodemailer.createTransport(smtpTransport({
            service: "gmail",
            auth: {
                user: "no-tushar@mobiloitte.com",
                pass:"Mobiloitte@1"
            }
        }));
        const mailOptions = {
            from: "no-tushar@mobiloitte.com",
            to: email,
            subject: subject,
            // text: text,
            html:text
        }
        var result =await transporter.sendMail(mailOptions)
            if(result){
                console.log("Email sent: "+ result.response);
                return(null, result.response);
            }
        
    },
    getOtp(){
        let otp = Math.floor((Math.random() * 100000) + 100000);
        return otp;
    },
    uploadImage:async(image,next)=>{
        var result =await cloudniery.uploader.upload(image)
            if(result){
                return result.secure_url
                // callback(error,null)
                // next(null,result.secure_url)
            }else{
                // callback(error,null)
                return response.send({responceCode:501,responceMessage:""})

            }
    
    },
//     uploadImage:async (image,next)=>{
//        await cloudniery.uploader.upload(image,(error,result)=>{
//             if(error){
//                 // callback(error,null)
//                 return null
//             }else{
//                 // callback(null,result.secure_url)
//                 return result.secure_url
//             }
//         })
//     }

// ***************crown job**********************



}



