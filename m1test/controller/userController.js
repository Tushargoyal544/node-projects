const userModel = require("../model/userModel");
const address = require('../model/game')
const commonFunction = require("../helper/commonFunction");
const chatModel=require("../model/chatModel")
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const path = require('path')
const console = require('console');
// const { response, query } = require("express");
const game = require('../model/game');
const { Query } = require("mongoose");
var QRCode = require('qrcode');
const { url } = require("inspector");
const speakeasy = require("speakeasy");
const { aggregate } = require("../model/game");
//const lookup=require('mongoose-aggregate-paginate');
const { pathToFileURL } = require("url");
const { Country, State, City }=require('country-state-city')
const joi = require('joi');
const CronJob = require('cron').CronJob;
const csv=require('csvtojson');
const exls =require('simple-excel-to-json')
var convert = require('xml-js')



module.exports = {
    signup: (req, res) => {
        try {
            let userName = req.body.firstName + req.body.phoneNumber.slice(-4);
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }, { userName: userName }] }, { userType: "USER" }]
            }
            userModel.findOne(query, (findError, findResult) => {
                // console.log("a")
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
                            let ctry = Country.getCountryByCode("IN");
                            console.log(ctry);
                            let obj = {
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                gameId: req.body.gameId,
                                phoneNumber: req.body.phoneNumber,
                                email: req.body.email,
                                userName: userName,
                                password: bcryptjs.hashSync(req.body.password),
                                address: req.body.address,
                                dateOfBirth: req.body.dateOfBirth,
                                addressId: req.body.addressId,
                                otp: otp,
                                otpTime: new Date().getTime(),
                                // location: {
                                //     coordinates: req.body.location.coordinate
                                // },
                                // ctry:ctry
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
                                            console.log("c")
                                            return res.send({ responseCode: 500, responseMessage: "3 Internal server error" });
                                        } else {
                                            return res.send({ responseCode: 200, responseMessage: "SignUp successfully.", responseResult: saveResult });
                                        }
                                    });
                                }
                            });
                        } else {
                            let ctry = Country.getCountryByCode("IN");
                            console.log(ctry);
                            let obj = {
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                gameId: req.body.gameId,

                                phoneNumber: req.body.phoneNumber,
                                email: req.body.email,
                                userName: userName,
                                password: bcryptjs.hashSync(req.body.password),
                                address: req.body.address,
                                dateOfBirth: req.body.dateOfBirth,
                                addressId: req.body.addressId,
                                otp: otp,
                                image: result,
                                otpTime: new Date().getTime(),
                                location: {
                                    coordinates: req.body.location.coordinate
                                },
                                ctry:ctry
                            }
                            // console.log(req.body)
                            new userModel(obj).save((saveError, saveResult) => {

                                if (saveError) {
                                    return res.send({ responseCode: 500, responseMessage: "4 Internal server error" });
                                } else {
                                    let subject = "verify your otp and email link";
                                    let text = `Dear ${obj.firstName + " " + obj.lastName}, Please verify your otp: ${otp} and also verify your email link http://localhost:8000/user/emailVerification/${saveResult._id},\notp and email link will expires in 3 minutes`;
                                    commonFunction.sendMail(obj.email, subject, text, (sendMailError, sendMailResult) => {
                                        if (sendMailError) {
                                            console.log("c")
                                            return res.send({ responseCode: 500, responseMessage: "5 Internal server error" });
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
                    console.log(findResult);
                    if (findResult.otpVerify == true) {
                        let checkPassword = bcryptjs.compareSync(req.body.password, findResult.password);
                        if (checkPassword) {
                            let token = jwt.sign({ _id: findResult._id }, "tushar1998", { expiresIn: "30h" });
                            return res.send({ responseCode: 200, responseMessage: " Token has been generated", responseResult: token });
                        } else {
                            return res.send({ responseCode: 400, responseMessage: "Invalid Password: Please try again" });
                        }
                    }
                    else {
                        return res.send({ responseCode: 400, responseMessage: "Your account is not verified yet, first verify your account...." });
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
    pagination: (req, res) => {
        try {
            let query = { status: { $ne: "DELETE" } }
            let options = {
                limit: parseInt(req.body.limit) || 3,
                page: parseInt(req.body.page) || 2,
                sort: { createdAt: -1 }
            };
            userModel.paginate(query, options, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 501, responseMessage: 'server error', responseResult: error })
                } else {
                    return res.send({ responseCode: 200, responseMessage: "data fetch succesfully", responseResult: result })
                }
            })
        } catch (error) {
            console.log(error)
            return res.send({ responseCode: 501, responseMessage: 'catch error', responseResult: error })

        }
    },
    address1: (req, res) => {
        try {
            new address(req.body).save((saveError, saveResult) => {
                if (saveError) {
                    return res.send({ responseMessage: 'internel error', responseResult: saveError })
                } else {
                    return res.send({ responseResult: saveResult })
                }
            })
        } catch (error) {
            console.log(error);
            return res.send({ responseResult: error })

        }
    },
    view: (req, res) => {
        try {
            userModel.findOne({ _id: req.body._id }).populate("gameId").exec((findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "data does't exist" });
                } else {
                    return res.send({ responseCode: 200, responseMessage: "data viewed successfully....", responseResult: findResult });
                }
            });
        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },
    filter: (req, res) => {
        try {
            let query = {
                $or: [
                    { firstName: { $regex: req.body.search, $options: 'i' } },
                    { lastName: { $regex: req.body.search, $options: 'i' } },
                    { phoneNumber: { $regex: req.body.search, $options: 'i' } },
                    { email: { $regex: req.body.search, $options: 'i' } }]
            }
            // let query2={status:'ACTIVE'}    
            if (req.body.fromDate && !req.body.toDate) {
                query.createdAt = { $gte: req.body.fromDate }
            }
            if (!req.body.fromDate && req.body.toDate) {
                query.createdAt = { $lte: req.body.toDate }
            }
            if (req.body.fromDate && req.body.toDate) {
                query.$and = [{ createdAt: { $gte: req.body.fromDate } }, { createdAt: { $lte: req.body.toDate } }]
            }
            let option = {
                limit: 5,
                page: 1,
                sort: { createdAt: -1 },
                // query:query1
            }
            userModel.paginate(query, option, (error, result) => {
                if (error) {
                    console.log(error);
                    return res.send({ responseMessage: 'error', responseResult: error })
                } else {
                    return res.send({ responseResult: result })
                }
            })
        } catch (error) {
            console.log(error);
            return res.send({ responseMessage: 'catch error', responseResult: error })

        }
    },
    game: (req, res) => {
        try {
            new game(req.body).save((error, result) => {
                if (error) {
                    return res.send({ responseCode: 501, responseMessage: "internal server error", responseResult: error })
                } else {
                    return res.send({ responseCode: 200, responseMessage: "", responseResult: result })
                }
            })
        } catch (error) {
            console.log(error);
            return res.send({ responseMessage: "error", responseResult: error })

        }

    },
    uploadImage: (req, res) => {
        try {

            commonFunction.uploadImage(req.body.image, (imgError, imgResult) => {

                if (imgError) {
                    return res.send({ responseCode: 501, responseMessage: 'internal server error', responseResult: imgError })
                } else {
                    console.log(imgResult);
                    // var image=imgResult
                    userModel.findOne({ _id: req.body._id }, (error, result) => {
                        if (error) {
                            return res.send({ responseMessage: error, responseResult: error })
                        } else {
                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { image: imgResult } }, { new: true }, (saveError, saveResult) => {
                                if (saveError) {
                                    return res.send({ responseMessage: " data not save", responseResult: saveError })
                                } else {
                                    return res.send({ responseMessage: "data save", responseResult: saveResult })
                                }
                            })
                        }
                    })





                    // return res.send({responseMessage:"",responseResult:imgResult})
                }
            })


        } catch (error) {
            console.log(error);

        }
    },
    multer1: async (req, res) => {
        try {
            var findone = userModel.findOne({ _id: req.body._id })

            var link = []
            for (var i = 0; i < req.files.length; i++) {

                var data = await commonFunction.uploadImage(req.files[i].path)
                console.log(data);
                if (data) {
                    link.push(data)


                } else {
                    return res.send({ responseMessage: 'internal server error' })
                }
            }
            console.log(link);
            if (findone) {
                var saveData = awaituserModel.findByIdAndUpdate({ _id: findone._id }, { $set: { image: link } }, { new: true })
                if (saveData) {
                    return res.send({ responceMessage: "data save" })
                }
            }
            return res.send({ responseCode: 200, responseMessage: 'link', responseResult: link })

        } catch (error) {
            console.log(error);
            return res.send({ responseMessage: 'catch error' })
        }
    },
    viewMulter: (req, res) => {
        try {


            for (i = 0; i <= path1.count; i++) {
                commonFunction.uploadImage(path1, (imgError, imgResult) => {

                    if (imgError) {
                        return res.send({ responseCode: 501, responseMessage: 'internal server error', responseResult: imgError })
                    } else {


                        return res.send({ responseMessage: "", responseResult: imgResult })
                    }
                })
            }

        } catch (error) {
            console.log(error);
            return res.send({ responseMessage: "error", responseResult: error })

        }
    },
    uploadImage: (req, res) => {
        try {

            commonFunction.uploadImage(req.body.photos, (imgError, imgResult) => {

                if (imgError) {
                    return res.send({ responseCode: 501, responseMessage: 'internal server error', responseResult: imgError })
                } else {
                    console.log(imgResult);
                    // var image=imgResult
                    userModel.findOne({ _id: req.body._id }, (error, result) => {
                        if (error) {
                            return res.send({ responseMessage: error, responseResult: error })
                        } else {

                            userModel.findByIdAndUpdate({ _id: result._id }, { $set: { image: imgResult } }, { new: true }, (saveError, saveResult) => {
                                if (saveError) {
                                    return res.send({ responseMessage: " data not save", responseResult: saveError })
                                } else {
                                    return res.send({ responseMessage: "data save", responseResult: saveResult })
                                }
                            })
                        }
                    })





                    // return res.send({responseMessage:"",responseResult:imgResult})
                }
            })


        } catch (error) {
            console.log(error);

        }
    },
    multer1: (req, res) => {
        try {
            commonFunction.uploadImage((error, result) => {
                if (result) {
                    return res.send({ responseResult: 'result' })
                }
            })
        } catch (error) {

        }
    },
    filter: (req, res) => {
        try {
            let query = {
                $or: [
                    { firstName: { $regex: req.body.search, $options: 'i' } },
                    { lastName: { $regex: req.body.search, $options: 'i' } },
                    { phoneNumber: { $regex: req.body.search, $options: 'i' } },
                    { email: { $regex: req.body.search, $options: 'i' } }]
            }
            // let query2={status:'ACTIVE'}    
            if (req.body.fromDate && !req.body.toDate) {
                query.createdAt = { $gte: req.body.fromDate }
            }
            if (!req.body.fromDate && req.body.toDate) {
                query.createdAt = { $lte: req.body.toDate }
            }
            if (req.body.fromDate && req.body.toDate) {
                query.$and = [{ createdAt: { $gte: req.body.fromDate } }, { createdAt: { $lte: req.body.toDate } }]
            }
            let option = {
                limit: 5,
                page: 1,
                sort: { createdAt: -1 },
                // query:query1
            }
            userModel.paginate(query, option, (error, result) => {
                if (error) {
                    console.log(error);
                    return res.send({ responseMessage: 'error', responseResult: error })
                } else {
                    return res.send({ responseResult: result })
                }
            })
        } catch (error) {
            console.log(error);
            return res.send({ responseMessage: 'catch error', responseResult: error })

        }
    },
    speakeasy: (req, res) => {
        try {
            userModel.findOne({ _id: req.userId }, (error, result) => {
                if (error) {
                    return res.send({ responseCode: 501, responseMessage: "server error", responseResult: error })
                } else {
                    // console.log(result);
                    if (req.body.speakeasy == true) {
                        var secret = speakeasy.generateSecret();
                        console.log(secret);
                        var base32 = secret.base32
                        QRCode.toDataURL(secret.otpauth_url, (findError, findResult) => {
                            console.log(findResult);
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
    autspeakeasy: (req, res) => { 
        try {
            var qrery={$and:[{userType:'user'},{sId:req.body.sId}]}
            userModel.findOne({ _id: req.userId }, (error, result) => {
                // console.log(result);
                if (error) {
                    return res.send({ responseCode: 501, responceMessage: "server error", responseResult: error })
                } else {
                    if (result.speakeasy != true) {
                        let checkPassword = bcryptjs.compareSync(req.body.password, result.password);
                        if (checkPassword) {
                            let token = jwt.sign({ _id: result._id }, "tushar1998", { expiresIn: "30h" });
                            return res.send({ responseCode: 200, responseMessage: " login succesfully . Token has been generated", responseResult: token });
                        } else {
                            return res.send({ responseCode: 400, responseMessage: "Invalid Password: Please try again" });
                        }


                    } else {

                        console.log(result.base32);
                        console.log(req.body.userToken);
                        var verified = speakeasy.totp.verify({
                            secret: result.base32,
                            encoding: 'base32',
                            token: req.body.userToken
                        });
                        if (verified) {
                            let token = jwt.sign({ _id: result._id }, "tushar1998", { expiresIn: "30h" });
                            return res.send({ responseCode: 200, responseMessage: " login succesfully . Token has been generated", responseResult: token });
                            // return res.send({responseCode:200,responseMessage:'login'})
                        } else {
                            return res.send({ responseCode: 400, responseMessage: 'key wrong' })
                        }
                    }
                }
            })
        } catch (error) {
            console.log(error);
        }
    },
       
    lookup: async (req, res) => {
       let aggregate = userModel.aggregate([
            { $match: { email: req.body.email } },
            {
                $lookup: {
                    from: "games",
                    localField: "gameId",
                    foreignField: "_id",
                    as: "merge data"
                }
            }
        ])
        let options={
            limit:10,
            page:1,
            sort:{createdAt:-1}
        }
        var pagi = await userModel.aggregatePaginate(options,aggregate)
        if (pagi.docs.result == 0) {
            return res.send({ responseCode: 501, responseMessage: 'data not found' })


        }
        else {
            return res.send({ responseCode: 200, responseMessage: 'mearge data', responseResult: pagi })
        }
    },
    geonear: (req, res) => {
        try {
            var geoNeary = userModel.aggregate([{
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates":[req.body.location.coordinates[0],req.body.location.coordinates[1]]
                        
                    },
                    "maxDistance": req.body.maxDistance,
                    "minDistance": 0,
                    "spherical": true,
                    "distanceField": "dist.calculated",
                    "includeLocs": "dist.location",

                }
            },])
            console.log(req.body.maxDistance );
            console.log([req.body.location.coordinates[0],req.body.location.coordinates[1]]);
            let options={
                limit:10,
                page:1,
                sort:{createdAt:-1}
            }
            userModel.aggregatePaginate(geoNeary,options,(errore, result) => {
                // if (result.length!==0) {
                //     return res.send({ responseCode: 200, responseMessage: "not found data", responseResult: result })

                // }
                 if (result) {
                    return res.send({ responseCode: 200, responseMessage: "found data", responseResult: result })

                } else {
                    console.log(errore);
                    return res.send({ responseCode: 200, responseMessage: "internal server", responseResult: errore })
                }
            })
        } catch (error) {
            console.log(error)
            return res.send({ responseCode: 500, responseMessage: "Something went wrong", responseResult: error });
        }
      
    },
    socialSignup:(req,res)=>{
        try {
            var qrery={$and:[{userType:'USER'},{sId:req.body.sId}]}
            userModel.findOne(qrery,(error,result)=>{
                if(error){
                    return res.send({responseCode:501,responseMessage:"interserver error",responseResult:error})
                }else if(result){
            
                    if(result.sId==req.body.sId){
                        return res.send({responseCode:401,responseMessage:"id allrady present"})
                    }
                    
                }else{
                    userModel(req.body).save((errorr,result)=>{
                        if(result){
                            return res.send({responseCode:200,responseMessage:"social login succesfully",responseResult:result})
                        }else{
                            console.log(errorr);
                            return res.send({responseCode:501,responseMessage:"error",responseResult:errorr})
                        }
                    })
                }
            })
            
        } catch (error) {
            console.log(error)
            return res.send({responseCode:500,responseMessage:"Something went wrong",responseResult:error})
        }
    },
   
    // *****************m4**********************

    joi:async(req,res)=>{
        const schema={
            firstName:joi.string().min(3).max(12).required(),
            address:joi.string().optional(),
            password:joi.string().min(3).max(12).required(),

        }
        try{
            const validation =await joi.validate(req.body,schema);
            let result = await new userModel(validation).save();
            if(result){
                return res.send({responseResult: result});
            }
            // console.log(validation);
            // res.send(validation);
        }catch(error){
            console.log(error);
            return res.send({responceMessage:"catch error",responceResult:error.message})
        }
    },
    cron:(req,res)=>{
        try {
            var job = new CronJob('*/4 * * * * *', function() {

            console.log('You will see this message every second');
            });
            job.start();
        } catch (error) {
            console.log(error);
        }
    },
    csvToJson:async(req,res)=>{
        const csvFilePath='./tushar.csv'
        csv()
        .fromFile(csvFilePath)
        .then((jsonObj)=>{
            console.log(jsonObj);
        })
        const jsonArray=await csv().fromFile(csvFilePath);
        let saveResult = await userModel.create(jsonArray);
        return res.send({responseCode: 200, responseMessage: "Data converted successfully....", responseResult: saveResult});
       
    },
    exlstojson:async(req,res)=>{
       
        var doc =await  exls.parseXls2Json('./tu.xlsx');
        console.log(doc);
        let result = await userModel.create(doc[0]);
        // return res.send({responseCode: 200, responseResult: result});
    },
    xmlToJson:async(req,res)=>{
        
        var xml = require('fs').readFileSync('./tu.xml', 'utf8');
        
        var result = convert.xml2json(xml, {compact: true, spaces: 4});
        console.log(result);
    },
   
    
}
        

    

       
            
        
        
      
   
           
           
            





   
    













