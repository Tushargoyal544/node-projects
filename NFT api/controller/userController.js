const userModel = require("../model/userModel");
const productModel = require("../model/nft")
const oderModel=require('../model/oderModel')
const historyModel=require('../model/transHistory')
const commonFunction = require("../helper/commonFunction");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
var QRCode = require('qrcode');
const speakeasy = require("speakeasy");




module.exports = {
    // ****************user signup login************************
    signup: (req, res) => {
        try {
            let userName = req.body.firstName + req.body.phoneNumber.slice(-4);
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }, { userName: userName }] }, { userType: "USER" }]
            }
            userModel.findOne(query, (findError, findResult) => {
                
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "1 Internal server error" });
                } else if (findResult) {
                    if (findResult.phoneNumber == req.body.phoneNumber) {
                        return res.send({ responseCode: 409, responseMessage: "Mobile Number is already exist." });
                    } else if (findResult.email == req.body.email) {
                        return res.send({ responseCode: 409, responseMessage: "Email is already exist." });
                    } else if (findResult.userName == userName) {
                        return res.send({ responseCode: 409, responseMessage: "User Name is already exist." });
                    }
                } else {
                    let otp = commonFunction.getOtp();
                    commonFunction.uploadImage(req.body.image, (error, result) => {
                        if (!result) {
                            
                            let obj = {
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                phoneNumber: req.body.phoneNumber,
                                email: req.body.email,
                                userName: userName,
                                password: bcryptjs.hashSync(req.body.password),
                                address: req.body.address,
                                dateOfBirth: req.body.dateOfBirth,
                                addressId: req.body.addressId,
                                otp: otp,
                                otpTime: new Date().getTime(),
                                location: {
                                    coordinates: req.body.location.coordinate
                                },
                            
                            }
                            console.log();
                            new userModel(obj).save((saveError, saveResult) => {

                                if (saveError) {
                                    return res.send({ responseCode: 500, responseMessage: " 2 Internal server error" ,responseResult:saveError});
                                } else {
                                    let subject = "verify your otp and email link";
                                    let text = `Dear ${obj.firstName + " " + obj.lastName}, Please verify your otp: ${otp} and also verify your email link http://localhost:8000/user/emailVerification/${saveResult._id},\notp and email link will expires in 3 minutes`;
                                    commonFunction.sendMail(obj.email, subject, text, (sendMailError, sendMailResult) => {
                                        if (sendMailError) {
                                            
                                            return res.send({ responseCode: 500, responseMessage: "3 Internal server error" });
                                        } else {
                                            return res.send({ responseCode: 200, responseMessage: "SignUp successfully.", responseResult: saveResult });
                                        }
                                    });
                                }
                            });
                        } 
                    })


                }
            });
        } catch (error) {
            console.log(error);
            res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    secourity2fa: (req, res) => {
        try {
            userModel.findOne({ _id: req.userId }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 501, responseMessage: "server error", responseResult: error })
                } else {
                    // console.log(result);
                    if (req.body.speakeasy == true) {
                        var secret = speakeasy.generateSecret();
                        // console.log(secret);
                        var base32 = secret.base32
                        QRCode.toDataURL(secret.otpauth_url, (findError, findResult) => {
                            // console.log(findResult);
                            if (findError) {
                                return res.send({ responseCode: 501, responseMessage: "1internal server error", responseResult: findError })
                            } else {
                                console.log(findResult);
                                userModel.findByIdAndUpdate({ _id: result._id }, { $set: { speakeasy: true, base32: base32 } }, { new: true }, (saveError, saveResult) => {
                                    if (saveError) {
                                        console.log(saveError);
                                    } else {

                                        return res.send({ responseCode: 200, responseMessage: "", responseResult: findResult, saveResult })
                                    }
                                })
                            }
                        })
                    }
                }
            })
        } catch (error) {

        }
    },
    otpVerify: (req, res) => {
        try {
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }] }, { userType: "USER" }, { status: { $in: "ACTIVE" } }]
            }
            userModel.findOne(query, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist" });
                } else {
                    if (findResult.otpVerify != true) {
                        let otpTimeDifference = (new Date().getTime()) - findResult.otpTime;
                        if (otpTimeDifference <= (3 * 60 * 1000)) {
                            if (req.body.otp == findResult.otp) {
                                userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { otpVerify: true } }, { new: true }, (updateError, updateResult) => {
                                    if (updateError) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                                    } else {
                                        return res.send({ responseCode: 202, responseMessage: "otp verify successfully....", responseResult: updateResult });
                                    }
                                });
                            } else {
                                return res.send({ responseCode: 401, responseMessage: 'otp wrong' })
                            }

                        } else {
                            return res.send({ responseCode: 403, responseMessage: "otp time has been expired" });
                        }
                    } else {
                        return res.send({ responseCode: 409, responseMessage: "otp already verified...." });
                    }
                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    emailVerification: (req, res) => {
        try {
            let query = {
                $and: [{ _id: req.params._id }, { userType: "USER" }, { status: "ACTIVE" }]
            }
            userModel.findOne(query, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist" });
                } else {
                    if (findResult.emailVerify != true) {
                        userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { emailVerify: true } }, { new: true }, (updateError, updateResult) => {
                            if (updateError) {
                                return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                            } else {
                                return res.send({ responseCode: 200, responseMessage: "Email verified successfully", responseResult: updateResult });
                            }
                        });
                    } else {
                        return res.send({ responseCode: 409, responseMessage: "Email link is already verified" });
                    }
                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    resendOtp: (req, res) => {
        try {
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }] }, { userType: "USER" }, { status: { $in: "ACTIVE" } }]
            }
            userModel.findOne(query, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist" });
                } else {
                    let otp = commonFunction.getOtp();
                    let otpTime = new Date().getTime();
                    let subject = " verify your otp";
                    let text = `Dear ${findResult.firstName + " " + findResult.lastName}, Please verify your otp: ${otp},\notp will expires in 3 minutes`;
                    commonFunction.sendMail(findResult.email, subject, text, (sendMailError, sendMailResult) => {
                        if (sendMailError) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                        } else {
                            userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { otp: otp, otpTime: otpTime, otpVerify: false } }, { new: true }, (updateError, updateResult) => {
                                if (updateError) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                                } else {
                                    return res.send({ responseCode: 200, responseMessage: "otp sent successfully....", responseResult: updateResult });
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    forgetPassword: (req, res) => {
        try {
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }] }, { userType: "USER" }, { status: { $in: "ACTIVE" } }]
            }
            userModel.findOne(query, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist" });
                } else {
                    let otp = commonFunction.getOtp();
                    let otpTime = new Date().getTime();
                    let subject = " verify your otp";
                    let text = `Dear ${findResult.firstName + " " + findResult.lastName}, Please verify your otp: ${otp},\notp will expires in 3 minutes`;
                    commonFunction.sendMail(findResult.email, subject, text, (sendMailError, sendMailResult) => {
                        if (sendMailError) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                        } else {
                            userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { otp: otp, otpTime: otpTime, otpVerify: false } }, { new: true }, (updateError, updateResult) => {
                                if (updateError) {
                                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                                } else {
                                    return res.send({ responseCode: 200, responseMessage: "Password forgot successfully....", responseResult: updateResult });
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    rsetPassword: (req, res) => {
        try {
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }] }, { status: "ACTIVE" }]
            }
            userModel.findOne(query, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist" });
                } else {
                    if (findResult.otpVerify != true) {
                        let otpTimeDifference = (new Date().getTime()) - findResult.otpTime;
                        if (otpTimeDifference <= (3 * 60 * 1000)) {
                            if (req.body.newPassword == req.body.confirmPassword) {
                                userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { otpVerify: true, password: bcryptjs.hashSync(req.body.newPassword) } }, { new: true }, (updateError, updateResult) => {
                                    if (updateError) {
                                        return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                                    } else {
                                        return res.send({ responseCode: 200, responseMessage: "Password reseted successfully....", responseResult: updateResult });
                                    }
                                });
                            } else {
                                return res.send({ responseCode: 401, responseMessage: "Invalid credentials: Password and Confirm Password does't match" });
                            }
                        } else {
                            return res.send({ responseCode: 403, responseMessage: "otp time has been expired, Please try again....." });
                        }
                    } else {
                        return res.send({ responseCode: 409, responseMessage: "Password already reset...." });
                    }
                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    loginJwt: (req, res) => {
        try {
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phonNumber }, { email: req.body.email }] }, { userType: "USER" }, { $in: { status: "ACTIVE" } }]
            }
            console.log(req.body);
            userModel.findOne(query, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist...." });
                } else {
                    if(findResult.speakeasy!=true){
                        if (findResult.otpVerify == true) {
                            let checkPassword = bcryptjs.compareSync(req.body.password, findResult.password);
                            if (checkPassword) {
                                let token = jwt.sign({ _id: findResult._id }, "tushar1998", { expiresIn: "300h" });
                                return res.send({ responseCode: 200, responseMessage: " Token has been generated", responseResult: token });
                            } else {
                                return res.send({ responseCode: 400, responseMessage: "Invalid Password: Please try again" });
                            }
                        }
                        else {
                            return res.send({ responseCode: 400, responseMessage: "Your account is not verified yet, first verify your account...." });
                        }
                    }else{
                        var verified = speakeasy.totp.verify({
                            secret: findResult.base32,
                            encoding: 'base32',
                            token: req.body.userToken
                        });
                        if (verified) {
                            let token = jwt.sign({ _id: findResult._id }, "tushar1998", { expiresIn: "30h" });
                            return res.send({ responseCode: 200, responseMessage: " login succesfully . Token has been generated", responseResult: token });
                            // return res.send({responseCode:200,responseMessage:'login'})
                        } else {
                            return res.send({ responseCode: 400, responseMessage: 'key wrong' })
                        }
                    }
                    
                   
                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    userList: (req, res) => {
        try {
            userModel.find({ userType: "USER" }, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist" });
                } else {
                    return res.send({ responseCode: 200, responseMessage: "List users successfully....", responseResult: findResult });
                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    viewprofile: (req, res) => {
        try {
            let query = {
                $and: [{ phoneNumber: req.query.phoneNumber }, { userType: "USER" }]
            }
            userModel.findOne(query, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist" });
                } else {
                    find = findResult.toString()
                    QRCode.toDataURL(find, function (err, url) {
                        return res.send({ responseCode: 200, responseMessage: "User viewed successfully....", responseResult: url });
                    })

                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    profileEdit: (req, res) => {
        let query1 = {
            $and: [{ _id: req.userId }, { userType: "USER" }]
        }
        userModel.findOne(query1, (findError, findResult) => {
            if (findError) {
                return res.send({ responseCode: 500, responseMessage: "Internal server error" });
            } else if (!findResult) {
                return res.send({ responseCode: 404, responseMessage: "user does not exist" });
            } else {
                let query2 = {
                    $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { userName: req.body.userName }, { email: req.body.email }] }, { _id: { $ne: findResult._id } }, { status: { $ne: "DELETE" } }]
                }
                userModel.findOne(query2, (checkError, checkResult) => {
                    if (checkError) {
                        return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                    } else if (checkResult) {
                        if (checkResult.phoneNumber == req.body.phoneNumber) {
                            return res.send({ responseCode: 409, responseMessage: "Phone Number is already exist" });
                        } else if (checkResult.email == req.body.email) {
                            return res.send({ responseCode: 409, responseMessage: "Email id is already exist...." });
                        } else if (checkResult.userName == req.body.userName) {
                            return res.send({ responseCode: 409, responseMessage: "User Name is already exist...." });
                        }
                    } else {
                        // req.body.password=bcryptjs.hashSync(req.body.password)
                        userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: req.body }, { new: true }, (updateError, updateResult) => {
                            if (updateError) {
                                return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                            } else {
                                return res.send({ responseCode: 200, responseMessage: "Profile update successfully....", responseResult: updateResult });
                            }
                        });
                    }
                });
            }
        });
    },
    

    // *****************product add*******************

    productAdd:(req,res)=>{
        try {
            var query={$and:[{_id:req.userId},{status:"ACTIVE"}]}
            userModel.findOne(query,(error,result)=>{
                if(error){
                    res.send({responseCode:501,responseMessage:'internal server error',responseResult:error})
                }else{
                   
                    productModel(req.body).save((saveError,saveResult)=>{
                        if(saveError){
                            res.send({responseCode:501,responseMessage:'internal server error',responseResult:saveError})
    
                        }else{
                            find = result.toString()
                            QRCode.toDataURL(find, function (err, url){
                                if(url){
                                    productModel.findByIdAndUpdate({_id:saveResult._id},{$set:{QRCode:url}},{new:true},(urlError,urlResult)=>{
                                        if(urlError){
                                            res.send({responseCode:501,responseMessage:"url error"})
                                        }
                                    })
                                }
                              
                                // console.log(url);
                                
        
                            })
                            commonFunction.uploadImage(req.body.productImage, (uploadError, uploadResult)=>{
                                console.log(uploadResult);
                                if(uploadError){
                                    console.log(uploadError);
                                    res.send({responseCode: 500, responseMessage: "a: Internal server error"})
                                } else{
                                    productModel.findByIdAndUpdate({_id:saveResult._id},{$set:{userId:req.userId,productImage:uploadResult}},{new:true},(updateError,updateResult)=>{
                                        if(updateError){
                                            res.send({responseCode:501,responseMessage:'internal server error',responseResult:updateError})
            
                                        }else{
                                           
                                            res.send({responseCode:200,responseMessage:"product add succesfully",responseResult:updateResult})
                                        }
            
                                    })
                                }
                            })                       
                        }
                    })
                }
            })
        } catch (error) {
            
        }

    },
    viewProduct: async (req, res) => {
        try {
            let aggregate = productModel.aggregate([
                { $match: { productName: req.body.productName} },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "merge data"
                    }
                }
            ])
           
            var pagi = await productModel.aggregatePaginate(aggregate)
   
            if (pagi.docs.result == 0) {
                return res.send({ responseCode: 501, responseMessage: 'data not found' })
    
    
            }
            else {console.log(pagi);
                return res.send({ responseCode: 200, responseMessage: 'mearge data', responseResult: pagi })
            }
       
        } catch (error) {
            
        }
    },
    listNft:(req,res)=>{
        try {
            var query = {$and:[{productStatus:"BLOCK"}]}
            productModel.find(query,(error,result)=>{
                if(error){
                    res.send({responseCode:501,responseMessage:"internal server error",responseResult:error})
                }else{
                    res.send({responseCode:200,responseMessage:"all data",responseResult:result})
                }
            })
        }
        catch (error) {
            
        }
    }  
    ,

    // ****************product send to marketolace****************
    nftSell:(req,res)=>{
        try {
            var query={$and:[{userId:req.userId},{productName:req.body.productName}],$or:[{productStatus:'BLOCK'},{productStatus:'ACTIVE'}]}
        productModel.findOne(query,(error,result)=>{
            console.log(result);
            if(error){
               
                res.send({responseCode:500,responseMessage:"internal server error",responseResult:error})
            }else{
                
                productQnt=result.productQnt-req.body.sellQnt
                if(productQnt<=0){
                    res.send({responseCode:400,responseMessage:"product quantity is lassthan 0"})
                }
                else{
                    productModel.findByIdAndUpdate({_id:result._id},{$set:{productStatus:"ACTIVE",sellQnt:req.body.sellQnt,productQnt:productQnt}},{new:true},(updateError,updateResult)=>{
                        if(updateError){
                            console.log(updateError);
                            res.send({responseCode:501,responseMessage:"update result not save",responseResult:updateError})
                        }else{
                            console.log(updateResult);
                            res.send({responseCode:200,responseMessage:"nft add to marketplace",responseResult:updateResult})
                        }
                    })
    
                }
                
            }
        })
            
        } catch (error) {
            
        }
        
    },
    viewSellNft: async (req, res) => {
    

        try {
            let aggregate = productModel.aggregate([
                { $match: { productName: req.body.productName} },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "merge data"
                    }
                }
            ])
           
            var pagi = await productModel.aggregatePaginate(aggregate)
   
            if (pagi.docs.result == 0) {
                return res.send({ responseCode: 501, responseMessage: 'data not found' })
    
    
            }
            else {console.log(pagi);
                return res.send({ responseCode: 200, responseMessage: 'mearge data', responseResult: pagi })
            }
       
        } catch (error) {
            
        }
    },
    listSellNft:(req,res)=>{
    
        try {
            var query = {$and:[{productStatus:"ACTIVE"}]}
            productModel.find(query,(error,result)=>{
                if(error){
                    res.send({responseCode:501,responseMessage:"internal server error",responseResult:error})
                }else{
                    res.send({responseCode:200,responseMessage:"all data",responseResult:result})
                }
            })
        }
        catch (error) {
            
        }
    },  

    // ***************buy nft**************

    buyNft:(req,res)=>{
        try {
            var query={$and:[{productStatus:"ACTIVE"},{productName:req.body.productName}]}
            
            productModel.findOne(query,(error,result)=>{
                console.log(result);
                if(error){
                    res.send({responseCode:500,responseMessage:"internal server error",responseResult:error})
                }else{
                    if(result.userId!=req.userId ){
                        if(req.body.buyPrice==result.productPrice){
                            let obj={
                                productName:result.productName,
                                productImage:result.productImage,
                                productPrice:result.productPrice,
                                productId:result._id,
                                ownerId:req.userId,
                                buyNumber:req.body.buyNumber
                            }
                            oderModel(obj).save((saveError,saveResult)=>{
                                if(saveError){
                                    res.send({responseCode:501,responseMessage:"data not save",responseResult:saveError})
                                }else{
                                    if(req.body.buyNumber<=result. sellQnt){
                                        var sellQnt=result.sellQnt-req.body.buyNumber
                                        productModel.findByIdAndUpdate({_id:result._id},{$set:{sellQnt:sellQnt}},{new:true},(updateError,updateResult)=>{
                                            if(updateError){
                                                res.send({responseCode:501,responseMessage:"1 internal server error"})
                                            }
                                           
                                        })
                                    }
                                    res.send({responseCode:200,responseMessage:"oder place",responseResult:saveResult})
                                }
                            })
                            
                        }else{
                            res.send({responseCode:501,responseMessage:"enter the actual price of product"})
                        }
                        
                        
                    }else{
                        res.send({responseCode:401,responseMessage:"you are the owner you can not buy it"})
                    }
                    }
                    
            })
        } catch (error) {
            
        }
    },
    listOderNft:(req,res)=>{
    
        try {
            
            oderModel.find({productName:req.body.productName},(error,result)=>{
                if(error){
                    res.send({responseCode:501,responseMessage:"internal server error",responseResult:error})
                }else{
                    res.send({responseCode:200,responseMessage:"all data",responseResult:result})
                }
            })
        }
        catch (error) {
            console.log(error); 
            res.send({responseMessage:"catch error"}) 
        }
    }, 


    // ************transistion history********************
    transHistory:(req,res)=>{
       try {
           var query={$and:[{ownerId:req.body.ownerId}]}
           oderModel.findOne(query,(error,result)=>{
               console.log(result);
               if(error){
                   res.send({responseCode:501,responseMessage:"internal server error"})
               }else{
                   var obj={
                    ownerId:result.ownerId,
                    productId:result.productId,
                    productPrice:result.productPrice


                   }
                   historyModel(obj).save((saveError,saveResult)=>{
                       if(saveError){
                           res.send({responseCode:501,responseMessage:"data not save",})
                       }else{
                           res.send({responseCode:200,responseMessage:"history data",responseResult:saveResult})
                       }
                   })
               }
           })
       } catch (error) {
           console.log(error);
           res.send({responseMessage:"catch error"})
           
       } 
    },
    viewHistory: async (req, res) => {
        try {
            var query={$and:[{ownerId:req.userId}]}
            var result=historyModel.findOne(query)
                if(result){
                    let aggregate = historyModel.aggregate([
                        { $match: { productPrice: req.body.productPrice} },
                        {
                            $lookup: {
                                from: "nfts",
                                localField: "productId",
                                foreignField: "_id",
                                as: "merge data"
                            },
                            
                           
                        }
                    ])
                    let aggregate1 = historyModel.aggregate([
                        { $match: { productPrice: req.body.productPrice} },
                        {
                           
        
                            $lookup: {
                                from: "users",
                                localField: "ownerId",
                                foreignField: "_id",
                                as: "merge1 data"
                            }
                        }
                    ])
                    var pagi = await historyModel.aggregatePaginate(aggregate)
                    var pagi1 = await historyModel.aggregatePaginate(aggregate1)
           
                    if (pagi.docs.result == 0 && pagi1.docs.result==0) {
                        return res.send({ responseCode: 501, responseMessage: 'data not found' })
            
            
                    }
                    else {
                        return res.send({ responseCode: 200, responseMessage: 'mearge data', responseResult: pagi,pagi1 })
                    }
                }
            
            

       
        } catch (error) {
            console.log(error);
            res.send({responseCode:501,responseMessage:'catch error'})
            
        }
    },
    listHistory:(req,res)=>{
        try {
            var query={$and:[{ownerId:req.userId}]}
            historyModel.find(query,(error,result)=>{
                if(error){
                    res.send({responseCode:501,responseMessage:"internal server error"})
                }else{
                    res.send({responseCode:200,responseResult:"list data",responseResult:result})
                }
            })
        } catch (error) {
            
        }
    }
   
  
}










