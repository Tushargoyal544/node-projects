const userModel = require("../model/userModel");
const shopModel = require("../model/addShopModel")
const commonFunction = require("../helper/commonFunction");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
var QRCode = require('qrcode');
const speakeasy = require("speakeasy");
const { aggregatePaginate } = require("../model/addShopModel");
const { options } = require("../router/userRouter");
const chatModel = require("../model/chatModel");
var CronJob = require('cron').CronJob;
const cartModel = require("../model/cartModel")
const stripe = require('stripe')('sk_test_51K55UvSAo0PwMqxlZByx6Y4BIbMexLznV2ucSBTSFAxE0h3WZnsPOKsiVneSMT8EExfxgnepJFmuK43Y8yDi8hXe00BCculs4q')
const Razorpay = require('razorpay')
const razorpay = new Razorpay({ key_id: 'rzp_test_fxDqbi4ToqERqr', key_secret: 'JWCWxOUSMvf0dCjSazKDrk9K' })


module.exports = {
    // ****************user signup login************************
    signup: async (req, res) => {
        try {
            let userName = req.body.firstName + req.body.phoneNumber.slice(-4);
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }, { userName: userName }] }, { userType: "USER" }]
            }
            var findResult = await userModel.findOne(query)
            if (findResult) {
                if (findResult.phoneNumber == req.body.phoneNumber) {
                    return res.send({ responseCode: 409, responseMessage: "Mobile Number is already exist." });
                } else if (findResult.email == req.body.email) {
                    return res.send({ responseCode: 409, responseMessage: "Email is already exist." });
                } else if (findResult.userName == userName) {
                    return res.send({ responseCode: 409, responseMessage: "User Name is already exist." });
                }
            } else {
                let otp = commonFunction.getOtp();
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
                }
                console.log();
                var saveResult = await new userModel(obj).save()

                if (saveResult) {
                    let subject = "verify your otp and email link";

                    // let text = `Dear ${obj.firstName + " " + obj.lastName}, Please verify your otp: ${otp} and also verify your email link http://localhost:8000/user/emailVerification/${saveResult._id},\notp and email link will expires in 3 minutes`;
                    let text =
                        `<p>Hello ${obj.firstName + " " + obj.lastName}</p>
                    <p>Please click on the following link </p>
                    <p>your otp: ${otp} and also verify your email link</p>
                    <a href="http://localhost:8000/user/emailVerification/${saveResult._id}">click on me</a>
                      
                    
                      <p>
                        Thanks
                      </p>`
                    var sendMailResult = await commonFunction.sendMail(obj.email, subject, text)
                    if (sendMailResult) {

                        return res.send({ responseCode: 200, responseMessage: " signup succesfully", responseResult: saveResult, sendMailResult });
                    }
                }
            }
        } catch (error) {
            console.log(error);
            res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },

    secourity2fa: async (req, res) => {
        try {

            var result = await userModel.findOne({ _id: req.userId })

            if (req.body.speakeasy == "true") {
                var secret = speakeasy.generateSecret();

                var base32 = secret.base32

                var findResult = await QRCode.toDataURL(secret.otpauth_url)
                if (findResult) {
                    var uploadImageResult = await commonFunction.uploadImage(findResult)

                    if (uploadImageResult) {
                        var saveResult = await userModel.findByIdAndUpdate({ _id: result._id }, { $set: { speakeasy: true, base32: base32 } }, { new: true })

                        if (saveResult) {

                            return res.send({ responseCode: 200, responseMessage: "", responseResult: saveResult })
                        }

                    }


                }

            }



        }

        catch (error) {
        }

    },

    remove2fa: async (req, res) => {
        var result = await userModel.findOne({ _id: req.userId })
        if (result) {

            if (result.speakeasy == true) {
                var findResult = await userModel.findByIdAndUpdate({ _id: result._id }, { $set: { speakeasy: false } }, { new: true })
                if (findResult) {

                    return res.send({ responseCode: 200, responseMessage: "off 2fa secourity", responseResult: saveResult })
                }

            }
        }

    },

    otpVerify: async (req, res) => {
        try {
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }] }, { userType: "USER" }, { status: { $in: "ACTIVE" } }]
            }
            var findResult = await userModel.findOne(query)
            console.log(findResult.otpVerify);

            if (findResult.otpVerify != true) {
                let otpTimeDifference = new Date().getTime() - findResult.otpTime;
                if (otpTimeDifference <= (3 * 60 * 1000)) {
                    if (req.body.otp == findResult.otp) {
                        var updateResult = await userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { otpVerify: true } }, { new: true })
                        if (updateResult) {
                            return res.send({ responseCode: 202, responseMessage: "otp verify successfully....", responseResult: updateResult });
                        } else {
                            return res.send({ responseCode: 404, responseMessage: 'otp not match' })
                        }
                    }


                    else {
                        return res.send({ responseCode: 404, responseMessage: 'otp time expire' })
                    }
                }
            }

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },

    emailVerification: async (req, res) => {
        try {
            let query = {
                $and: [{ _id: req.params._id }, { userType: "USER" }, { status: "ACTIVE" }]
            }
            var findResult = await userModel.findOne(query)
            if (findResult) {
                if (findResult.emailVerify != true) {
                    var updateResult = await userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { emailVerify: true } }, { new: true })
                    if (updateResult) {
                        return res.send({ responseCode: 200, responseMessage: "Email verified successfully", responseResult: updateResult });
                    }

                }
            }

        } catch (error) {
            return res.send({ responseCode: 500, responseMessage: "server error" });
        }
    },

    resendOtp: async (req, res) => {
        try {
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.phoneNumber }, { email: req.body.email }] }, { userType: "USER" }, { status: { $in: "ACTIVE" } }]
            }
            var findResult = userModel.findOne(query)
            if (findResult) {
                let otp = commonFunction.getOtp();
                let otpTime = new Date().getTime();
                let subject = " verify your otp";
                let text = `Dear ${findResult.firstName + " " + findResult.lastName}, Please verify your otp: ${otp},\notp will expires in 3 minutes`;
                var sendMailResult = await commonFunction.sendMail(findResult.email, subject, text)
                if (sendMailResult) {
                    var updateResult = await userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { otp: otp, otpTime: otpTime, otpVerify: false } }, { new: true })
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });


                }

            }

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 500, responseMessage: "server error", responseResult: error });
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
                    let text = `Dear ${findResult.firstName + " " + findResult.lastName}, Please verify your otp: ${otp} and also verify your email link http://localhost:8000/user/emailVerification/${findResult._id},\notp will expires in 3 minutes`;
                    commonFunction.sendMail(findResult.email, subject, text, (sendMailError, sendMailResult) => {
                        if (sendMailError) {
                            return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                        } else {
                            userModel.findByIdAndUpdate({ _id: findResult._id }, { $set: { otp: otp, otpTime: otpTime, otpVerify: false, emailVerify: false } }, { new: true }, (updateError, updateResult) => {
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

    login: (req, res) => {
        try {
            let query = {
                $and: [{ $or: [{ phoneNumber: req.body.PhonNumber }, { Email: req.body.Email }] }, { userType: "USER" }, { $in: { status: "ACTIVE" } }]
            }
            console.log(req.body);
            userModel.findOne(query, (findError, findResult) => {
                console.log(findResult);
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist...." });
                } else {
                    if (findResult.speakeasy != true) {
                        if (findResult.otpVerify == true) {
                            let checkPassword = bcryptjs.compareSync(req.body.Password, findResult.password);
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
                    } else {
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
                $and: [{ email: req.query.email }, { userType: "USER" }]
            }
            userModel.findOne(query, (findError, findResult) => {
                if (findError) {
                    return res.send({ responseCode: 500, responseMessage: "Internal server error" });
                } else if (!findResult) {
                    return res.send({ responseCode: 404, responseMessage: "user does't exist" });
                } else {

                    return res.send({ responseCode: 200, responseMessage: "User viewed successfully....", responseResult: findResult });


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


    // ****************shopModel******************

    addShop: async (req, res) => {
        try {

            var result = await userModel.findOne({ _id: req.userId });
            console.log(req.body);
            if (result) {

                var image = await commonFunction.uploadImage(req.body.shopImage)

                var obj = {
                    shopName: req.body.shopName,
                    shopImage: image,

                    shopLocation: {
                        coordinates: req.body.shopLocation.coordinates
                    },


                }
                var result1 = await shopModel.findOne({ shopName: obj.shopName })
                if (result1) {
                    return res.send({ responseCode: 500, responseMessage: 'shop name all redy exist' })
                } else {
                    var saveData = await shopModel(obj).save()

                    if (saveData) {
                        var updateResult = await shopModel.findByIdAndUpdate({ _id: saveData._id }, { $set: { shopOwnerId: req.userId } }, { new: true })
                        var QRdata = updateResult.toString()

                        var url = await QRCode.toDataURL(QRdata)
                        var QRimagelink = await commonFunction.uploadImage(url)
                        console.log("*************", QRimagelink)

                        console.log("//////////////////", updateResult);

                        return res.send({ responseCode: 200, responseMessage: 'shop add succesfully', responseResult: updateResult })
                    } else {
                        return res.send({ responseCode: 404, responseMessage: 'shop not add' })
                    }
                }


            } else {
                res.send({ responseCode: 400, responseMessage: 'first login' })
            }

        } catch (error) {
            console.log(error);
            return res.send({ responseResult: error.message })

        }
    },

    listShop: async (req, res) => {
        try {
            var query = { status: { $in: 'ACTIVE' } }
            let options = {
                limit: parseInt(req.body.limit) || 1,
                page: parseInt(req.body.page) || 2,
                sort: { createdAt: -1 }
            };
            var result = await shopModel.paginate(query, options)
            if (!result) {
                return res.send({ responseCode: 501, responseMessage: 'server error', responseResult: error })
            } else {
                return res.send({ responseCode: 200, responseMessage: "data fetch succesfully", responseResult: result })
            }
        } catch (error) {

        }

    },

    findShop: async (req, res) => {
        try {
            let query = {
                $or: [
                    { shopName: { $regex: req.body.search, $options: 'i' } }
                ]
            };
            let option = {
                limit: 1,
                page: 1,
                sort: { createdAt: -1 },
            };
            var result = await shopModel.paginate(query, option)


            if (!result) {
                console.log(error);
                return res.send({ responseMessage: 'error', responseResult: error })
            } else {
                return res.send({ responseResult: result })
            }

        } catch (error) {
            console.log(error);
            return res.send({ responseMessage: 'catch error', responseResult: error })

        }
    },

    // findShopLocation: async (req, res) => {
    //     try {
    //         var geoNear =  shopModel.aggregate([{
    //             "$geoNear": {
    //                 "near": {
    //                     "type": "Point",
    //                     "coordinates": [72.52141218064328,76.30659380250432]
    //                 },
    //                 // "maxDistance": req.body.maxDistance|1000,
    //                 // "minDistance": 0,
    //                 "spherical": true,
    //                 "distanceField": "dist.calculated",
    //                 "includeLocs": "dist.location",

    //             }
    //         },])
    //         console.log(req.body.shopLocation.coordinates[0], req.body.shopLocation.coordinates[1]);

    //         let options={page:1,limit:1}
    //         console.log(shopModel.aggregatePaginate(geoNear,options));
    //         var result = await shopModel.aggregatePaginate(geoNear,options)
    //         console.log(result);
    //         if (result) {
    //             return res.send({ responseCode: 200, responseMessage: "neear shop", responseResult: result })
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         return ({ responseResult: error })

    //     }

    // },
    findShopLocation: (req, res) => {
        try {
            var geoNeary = shopModel.aggregate([{
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [72.52141218064328, 76.30659380250432]

                    },
                    "maxDistance": 1000,
                    "minDistance": 0,
                    "spherical": true,
                    "distanceField": "dist.calculated",
                    "includeLocs": "dist.location",

                }
            },])


            let options = {
                limit: 10,
                page: 1,
                sort: { createdAt: -1 }
            }
            shopModel.aggregatePaginate(geoNeary, options, (errore, result) => {
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

    viewShop: async (req, res) => {
        try {
            let aggregate = shopModel.aggregate([
                { $match: { shopName: { $regex: req.body.search, $options: 'i' } } },
                {
                    $lookup: {
                        from: "users",
                        localField: "shopOwnerId",
                        foreignField: "_id",
                        as: "merge data"
                    }
                }
            ])
            let options = { page: 1, limit: 1 }
            var pagi = await shopModel.aggregatePaginate(aggregate, options)

            if (pagi.docs.result == 0) {
                return res.send({ responseCode: 501, responseMessage: 'data not found' })


            }
            else {
                console.log(pagi);
                return res.send({ responseCode: 200, responseMessage: 'mearge data', responseResult: pagi })
            }

        } catch (error) {

        }

    },

    chat: async (req, res) => {
        try {
            var result = await userModel.findOne({ _id: req.userId })

            if (result) {
                var result2 = await userModel.findOne({ email: req.body.email })
                if (result2) {
                    var query = { $and: [{ $or: [{ senderId: result._id }, { reciverId: result._id }] }, { $or: [{ senderId: result2._id }, { reciverId: result2._id }] }] }
                    var matchData = await chatModel.findOne(query)
                    if (matchData) {
                        let msg = matchData.chat;
                        msg.push(req.body.chat);
                        var saveResult = await chatModel.findByIdAndUpdate({ _id: matchData._id }, { $set: { chat: msg } }, { new: true });
                        if (saveResult) {
                            return res.send({ responseCode: 200, responseMessage: "msg send", responseResult: saveResult })
                        }
                    } else {
                        req.body.senderId = result._id,
                            req.body.reciverId = result2._id
                        req.body.chat = req.body.chat
                        var saveResult = await new chatModel(req.body).save()
                        if (saveResult) {
                            return res.send({ responseCode: 200, responseMessage: "msg send", responseResult: saveResult })
                        }
                    }
                }
            }



        } catch (error) {

        }
    },

    cart: async (req, res) => {
        var result = await new cartModel(req.body).save()
        if (result) {
            return res.send({ responseCode: 200, responseMessage: "product add in cart", responseResult: result })
        }
    },

    payment: async (req, res) => {
        try {
            var result = await cartModel.findOne({ productName: req.body.productName, status: "ACTIVE" });
            if (!result == null) {
                res.send({ responseCode: 404, responseMessage: "data Not found" });
            }
            else if (result.transactionStatus == "SUCCESSFUL") {
                res.send({ responseCode: 409, responseMessage: " already paid" });
            }
            else {
                var query1 = {};
                query1.card = { number: req.body.number, exp_month: req.body.exp_month, exp_year: req.body.exp_year, cvc: req.body.cvc }
                var token = await stripe.tokens.create(query1);
                console.log(token);
                console.log(req.body);
                var query = { name: req.body.name, description: req.body.description }
                var customer = await stripe.customers.create(query);

                var query2 = { amount: result.productPrice * 100, currency: 'inr', source: token.id, description: req.body.description }
                var charge = await stripe.charges.create(query2)

                await cartModel.findByIdAndUpdate({ _id: result._id }, { $set: { transactionStatus: "SUCCESSFUL", charge: charge.id, UserId: req.body.id, number: req.body.number, exp_month: req.body.exp_month, exp_year: req.body.exp_year, cvc: req.body.cvc } });
                res.send({ responseCode: 200, responseMessage: "payment sucessful complete", responseResult: charge, customer });
            }
        }
        catch (error) {
            console.log(error);
            res.send({ responseCode: 501, responseMessage: "something went wrong", responseResult: error.message });
        }
    },

    refund: async (req, res) => {
        try {
            var result = await cartModel.findOne({ productName: req.body.productName })
            if (result) {
                const refund = await stripe.refunds.create({
                    charge: result.charge
                });
                var updateResult = await cartModel.findByIdAndUpdate({ _id: result._id }, { $set: { transactionStatus: "pending" } }, { new: true })
                res.send({ responseCode: 200, responceMessage: "payment refund", responseResult: refund })
            }
        } catch (error) {
            res.send({ responseCode: 501, responceMessage: "something went wrong", responseResult: error.message })

        }

    },

    listRefund: async (req, res) => {
        const refunds = await stripe.refunds.list({
            limit: 3

        })
        res.send({ responseCode: 200, responceMessage: "list of refund payment", responseResult: refunds })
    },

    listAllPayment: async (req, res) => {
        const allPayment = await stripe.customers.update("cus_Km2SVaW9bB71uc",
            { metadata: { name: 'mohan' } })
        console.log(allPayment);
        res.send({ responseCode: 200, responceMessage: "list of all payment", responseResult: allPayment })
    },

    // *************razorpay*********************
    addCustomer: async (req, res) => {
        try {

            var custommer = await razorpay.customers.create({
                name: req.body.name,
                contact: req.body.contact,
                email: req.body.email,
            })
            console.log(custommer);
            return res.send({ responseCode: 200, responceMessage: "coustomer add", responseResult: custommer })

        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responceMessage: "something went wrong", responseResult: error.message })
        }
    },

    addOrder: async (req, res) => {
        try {
            var addOrder = razorpay.orders.create({
                amount: req.body.amount,
                currency: req.body.currency,
                receipt: req.body.receipt,

            })
            if (addOrder) {
                return res.send({ responseCode: 200, responceMessage: "oder add", responseResult: addOrder })
            }

        } catch (error) {
            return res.send({ responseCode: 500, responceMessage: "something went wrong", responseResult: error.message })

        }

    },

    payment1: async (req, res) => {
        try {
            var pay = await razorpay.paymentLink.create({
                "amount": 500,
                "currency": "INR",
                "accept_partial": true,
                "first_min_partial_amount": 100,
                "description": "For XYZ purpose",
                "customer": {
                    "name": "Gaurav Kumar",
                    "email": "gaurav.kumar@example.com",
                    "contact": "+919999999999"
                },
                "notify": {
                    "sms": true,
                    "email": true
                },
                "reminder_enable": true,
                "notes": {
                    "policy_name": "Jeevan Bima"
                },
                "callback_url": "http://localhost:8000/user/dataGet",
                "callback_method": "get"
            })
            return res.send({ responseCode: 200, responceMessage: "payment succesfully", responceResult: pay })


        } catch (error) {
            console.log(error);
            return res.send({ responseCode: 501, responceMessage: 'something wrong', responseResult: error.message })

        }
    },

    dataGet: async (req, res) => {
        try {
            let body = req.body
            var crypto = require("crypto");
            const secret = 123456;
            var expectedSignature = crypto.createHmac('sha256', secret).update(body.toString()).digest('hex');
            console.log("sig received ", req.headers['x-razorpay-signature']);
            console.log("sig generated ", expectedSignature);
            var response = { "signatureIsValid": "false" }
            if (expectedSignature === req.headers['x-razorpay-signature'])
                response = { "signatureIsValid": "true" }
            res.send(response);
        } catch (error) {
            return (error)
        }
    },

    cronjob: async (req, res) => {
        var data=[]
        var query = { $and: [{ userType: "USER" }, { status: 'ACTIVE' }] }
        var result = await userModel.find(query)
        console.log("******************=>", result.length);
        // for(var i=0;i<result.length;i++){
        //     console.log("====",result[i].email)
        // }

        var subject="Good wishes"
        var text="good Morning"
        var job = new CronJob('* * */24 * * *', function() {
            for (var i = 0; i <result.length; i++) {
                var sendMailResult = commonFunction.sendMail(result[i].email, subject, text)
                console.log(result[i].email);
                console.log(sendMailResult);
            }
            
          }, null, true, 'America/Los_Angeles');
          job.start();
        
       
           
    
    }


}






















































