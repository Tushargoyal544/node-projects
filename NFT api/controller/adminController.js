const commonFunction = require("../helper/commonFunction");
const qrCode = require("qrcode");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const productModel = require("../model/nft")
const oderModel=require('../model/oderModel')
const historyModel=require('../model/transHistory')



module.exports = {

 /* Admin SignUp Api's */

    forgotAdminPassword: (req, res)=>{
        try{
            let query = {
                $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {userType: "ADMIN"}, {status: {$in: "ACTIVE"}}]
            }
            userModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Admin does't exist"});
                } else{
                    let otp = commonFunction.getOtp();
                    let otpTime = new Date().getTime();
                    let subject = " verify your otp";
                    let text = `Dear ${findResult.firstName +" "+ findResult.lastName}, Please verify your otp: ${otp},\notp will expires in 3 minutes`;
                    commonFunction.sendMail(findResult.email, subject, text, (sendMailError, sendMailResult)=>{
                        if(sendMailError){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else{
                            userModel.findByIdAndUpdate({_id: findResult._id}, {$set: {otp: otp, otpTime: otpTime, otpVerify: false}}, {new: true}, (updateError, updateResult)=>{
                                if(updateError){
                                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                } else{
                                    return res.send({responseCode: 200, responseMessage: "Password forgot successfully....", responseResult: updateResult});
                                }
                            });
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    resetAdminPassword: (req, res)=>{
        try{
            let query = {
                $and:[{$or:[{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {userType: "ADMIN"}, {status: {$in:"ACTIVE"}}]
            }
            userModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Admin does't exist"});
                } else{
                    if(findResult.otpVerify != true){
                        if(findResult.otp == req.body.otp){
                            let otpTimeDifference = (new Date().getTime()) - findResult.otpTime;
                            if(otpTimeDifference <= (3 * 60 * 1000)){
                             if(req.body.newPassword == req.body.confirmPassword){
                                    userModel.findByIdAndUpdate({_id: findResult._id}, {$set:{otpVerify: true, password: bcryptjs.hashSync(req.body.newPassword)}}, {new: true}, (updateError, updateResult)=>{
                                        if(updateError){
                                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                        } else{
                                            return res.send({responseCode: 200, responseMessage: "Password reseted successfully....", responseResult: updateResult});
                                        }
                                  });
                            } else{
                                return res.send({responseCode: 401, responseMessage: "Invalid credentials: Password and Confirm Password does't match"});
                            }
                        } else{
                            return res.send({responseCode: 403, responseMessage: "otp time has been expired, Please try again....."});
                        }
                        } else{
                            return res.send({responseCode: 400, responseMessage: "Invalid otp: try again...."});
                        }
                    } else{
                        return res.send({responseCode: 409, responseMessage: "Password already reset...."});
                    }
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    adminLogIn: (req, res)=>{
        try{
            let query = {
                $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {userType: "ADMIN"}, {status: {$in: "ACTIVE"}}]
            }
            userModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Admin does't exist...."});
                } else{
                    if(findResult.otpVerify == true && findResult.emailVerify==true){
                        let checkPassword = bcryptjs.compareSync(req.body.password, findResult.password);
                        if(checkPassword){
                          let token = jwt.sign({_id: findResult._id}, "tushar1998", {expiresIn: "30m"});
                            return res.send({responseCode: 200, responseMessage: "Login successfully: Token has been generated....", responseResult: token});
                        } else{
                            return res.send({responseCode: 400, responseMessage: "Invalid Password: Please try again...."});
                        }
                    } else{
                        return res.send({responseCode: 400, responseMessage: "Your account is not verified yet, first verify your account...."});
                    }
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    editAdminProfile: (req, res)=>{
        try{
            let query1 = {
                $and:[{_id: req.userId}, {userType: "ADMIN"}, {status: {$in: "ACTIVE"}}]
            }
            userModel.findOne(query1, (findError,findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Admin does not exist"});
                } else{
                    let query2 = {
                        $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {userName: req.body.userName}, {email: req.body.email}]}, {_id: {$ne: findResult._id}}, {status: {$ne: "DELETE"}}]
                    }
                    userModel.findOne(query2, (checkError, checkResult)=>{
                        if(checkError){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else if(checkResult){
                            if(checkResult.phoneNumber == req.body.phoneNumber){
                                return res.send({responseCode: 409, responseMessage: "Phone Number is already exist"});
                            } else if(checkResult.email == req.body.email){
                                return res.send({responseCode: 409, responseMessage: "Email id is already exist...."});
                            } else if(checkResult.userName == req.body.userName){
                                return res.send({responseCode: 409, responseMessage: "User Name is already exist...."});
                            }
                        } else{
                            if(req.body.password){
                                userModel.findByIdAndUpdate({_id: findResult._id}, {$set: req.body, password: bcryptjs.hashSync(req.body.password)}, {new: true}, (updateError, updateResult)=>{
                                    if(updateError){
                                        return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                    } else{
                                        return res.send({responseCode: 200, responseMessage: "Profile update successfully....", responseResult: updateResult});
                                    }
                                });
                            } else{
                                userModel.findByIdAndUpdate({_id: findResult._id}, {$set: req.body}, {new: true}, (updateError, updateResult)=>{
                                    if(updateError){
                                        return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                    } else{
                                        return res.send({responseCode: 200, responseMessage: "Profile update successfully....", responseResult: updateResult});
                                    }
                                });
                            }
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "Server error"});
        }
    },

    // *******nft view and list***********
    viewNft:(req,res)=>{
        try {
            productModel.findOne({productName:req.body.productName},(error,result)=>{
                if(error){
                    console.log(error);
                    res.send({responseCode:501,responseMessage:"internal server error",responnceResult:error})
                }else{
                    res.send({responseCode:200,responseMessage:"view data",responseResult:result})
                }
            })
        } catch (error) {
            
        }
        
    },
    listNft:(req,res)=>{
        try {
            productModel.find({productName:req.body.productName},(error,result)=>{
                if(error){
                    console.log(error);
                    res.send({responseCode:501,responseMessage:"internal server error",responnceResult:error})
                }else{
                    res.send({responseCode:200,responseMessage:"view data",responseResult:result})
                }
            })
        } catch (error) {
            
        }
        
    },

    // ********oder view and list************
    viewOder:(req,res)=>{
        try {
            oderModel.findOne({productName:req.body.productName},(error,result)=>{
                if(error){
                    console.log(error);
                    res.send({responseCode:501,responseMessage:"internal server error",responnceResult:error})
                }else{
                    res.send({responseCode:200,responseMessage:"view data",responseResult:result})
                }
            })
        } catch (error) {
            
        }
        
    },

    listoder:(req,res)=>{
        try {
            oderModel.find({productName:req.body.productName},(error,result)=>{
                if(error){
                    console.log(error);
                    res.send({responseCode:501,responseMessage:"internal server error",responnceResult:error})
                }else{
                    res.send({responseCode:200,responseMessage:"view data",responseResult:result})
                }
            })
        } catch (error) {
            
        }
        
    },

    // ********transHistory view and list*********

    listHistory: async (req, res) => {
        try {
            var query={$and:[{status:'buy'}]}
            var result=historyModel.find(query)
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
    }
}