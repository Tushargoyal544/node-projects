const userRoute = require("express").Router();
const userController = require("../controller/userController");
const auth = require("../middleware/auth");

/**
   * @swagger
   * /api/v1/user/signup:
   *   post:
   *     tags:
   *       - USER
   *     description: signup api for user
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email is required.
   *         in: formData
   *         required: true
   *       - name: phoneNumber
   *         description: phoneNumber is required
   *         in: formData
   *         required: true
   *       - name: firstName
   *         description: firstname is required
   *         in: formData
   *         required: true
   *       - name: lastName
   *         description: lastName is required
   *         in: formData
   *         required: true
   *       - name: password
   *         description: password is required
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: signup  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */
userRoute.post("/signup", userController.signup);

/**
   * @swagger
   * /api/v1/user/secourity2fa:
   *   post:
   *     tags:
   *       - USER
   *     description: signup api for user
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token is required.
   *         in: header
   *         required: true
   *       - name: speakeasy
   *         description: speakeasy is required
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: signup  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */

userRoute.post('/secourity2fa',auth.tokenVerify,userController.secourity2fa)

/**
   * @swagger
   * /api/v1/user/otpVerify:
   *   post:
   *     tags:
   *       - USER
   *     description: otp verify
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email is required.
   *         in: formData
   *         required: true
   *       - name: otp
   *         description: otp is required
   *         in: formData
   *         required: true
   *      
   *     responses:
   *       200:
   *         description: otpVerify  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */

userRoute.post("/otpVerify", userController.otpVerify);



userRoute.get("/emailVerification/:_id", userController.emailVerification);

/**
   * @swagger
   * /api/v1/user/resendOtp:
   *   put:
   *     tags:
   *       - USER
   *     description: resendOtp 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email is required.
   *         in: formData
   *         required: true
   *       
   *     responses:
   *       200:
   *         description: resendOtp  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */
userRoute.put("/resendOtp", userController.resendOtp);
/**
   * @swagger
   * /api/v1/user/forgetPassword:
   *   post:
   *     tags:
   *       - USER
   *     description: forgetPassword 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email is required.
   *         in: formData
   *         required: true
   *       
   *     responses:
   *       200:
   *         description: forgetPassword  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */

userRoute.put("/forgetPassword", userController.forgetPassword);

/**
   * @swagger
   * /api/v1/user/rsetPassword:
   *   post:
   *     tags:
   *       - USER
   *     description: rsetPassword 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email is required.
   *         in: formData
   *         required: true
   *       - name: otp
   *         description: otp is required.
   *         in: formData
   *         required: true
   *       - name: newPassword
   *         description: password is required.
   *         in: formData
   *         required: true
   *       - name: confirmPassword
   *         description: confirmPassword is required.
   *         in: formData
   *         required: true
   *       
   *     responses:
   *       200:
   *         description: rsetPassword  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */
userRoute.put("/rsetPassword", userController.rsetPassword);

/**
   * @swagger
   * /api/v1/user/login:
   *   post:
   *     tags:
   *       - USER
   *     description: login 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: Email
   *         description: email is required.
   *         in: formData
   *         required: false
   *     
   *       - name: Password
   *         description: Password is required.
   *         in: formData
   *         required: false
   *       - name: userToken
   *         description: userToken is required.
   *         in: formData
   *         required: false
   *       
   *     responses:
   *       200:
   *         description: login  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */

userRoute.post("/login",userController.login);

/**
   * @swagger
   * /api/v1/user/userList:
   *   get:
   *     tags:
   *       - USER
   *     description: rsetPassword 
   *     produces:
   *       - application/json
   *     
   *     
   *      
   *     responses:
   *       200:
   *         description: userList  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */
userRoute.get("/userList",userController.userList);

/**
   * @swagger
   * /api/v1/user/viewprofile:
   *   get:
   *     tags:
   *       - USER
   *     description: rsetPassword 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: phoneNumber is required.
   *         in: query
   *         required: true
   *     
   *      
   *     responses:
   *       200:
   *         description: viewprofile  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */

userRoute.get("/viewprofile",userController.viewprofile)

/**
   * @swagger
   * /api/v1/user/profileEdit:
   *   put:
   *     tags:
   *       - USER
   *     description: profile edit 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: email is required.
   *         in: header
   *         required: true
   *       - name: phoneNumber
   *         description: phoneNumber is required.
   *         in: formData
   *         required: false
   *       - name: email
   *         description: email is required.
   *         in: formData
   *         required: false
   *     
   *      
   *     responses:
   *       200:
   *         description: profileEdit  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */
userRoute.put("/profileEdit",auth.tokenVerify,userController.profileEdit)

/**
   * @swagger
   * /api/v1/user/remove2fa:
   *   post:
   *     tags:
   *       - USER
   *     description: remove2fa 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: user token is required.
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: 2fa secourity off  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */
userRoute.post("/remove2fa",auth.tokenVerify,userController.remove2fa);

//  ****************** shop model*************************


 /**
    * @swagger
    * /api/v1/user/addShop:
    *   post:
    *     tags:
    *       - SHOP
    *     description: addShop api for user
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: token
    *         description: token is required.
    *         in: header
    *         required: true
    *       - name: shopName
    *         description: shopName is required
    *         in: formData
    *         required: true
    *       - name: shopImage
    *         description: shopImage is required
    *         in: formData
    *         required: true
    *       - name: shopLocation
    *         description: location is required
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: addShop  successfully
    *       404:
    *         description: Invalid credentials
    *       500:
    *         description: Internal Server Error
    */

userRoute.post("/addshop",auth.tokenVerify,userController.addShop)

/**
    * @swagger
    * /api/v1/user/listShop:
    *   get:
    *     tags:
    *       - SHOP
    *     description: listShop api for user
    *     produces:
    *       - application/json
    *     responses:
    *       200:
    *         description: listShop  successfully
    *       404:
    *         description: Invalid credentials
    *       500:
    *         description: Internal Server Error
    */
userRoute.get("/listShop",userController.listShop)

/**
    * @swagger
    * /api/v1/user/findShop:
    *   post:
    *     tags:
    *       - SHOP
    *     description: findShop api for user
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: search
    *         description: shopName is required
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: findShop  successfully
    *       404:
    *         description: Invalid credentials
    *       500:
    *         description: Internal Server Error
    */



userRoute.post("/findShop",userController.findShop)


userRoute.post("/findShopLocation",userController.findShopLocation)

/**
    * @swagger
    * /api/v1/user/viewShop:
    *   post:
    *     tags:
    *       - SHOP
    *     description: viewShop with owner details api for user
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: search
    *         description: shopName is required
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: viewShop  successfully
    *       404:
    *         description: Invalid credentials
    *       500:
    *         description: Internal Server Error
    */

userRoute.post("/viewShop", userController.viewShop)
userRoute.post("/chat",auth.tokenVerify,userController.chat)
userRoute.post("/cart",userController.cart)
userRoute.post("/payment",userController.payment)

userRoute.post("/refund",userController.refund)
userRoute.get("/listRefund",userController.listRefund)
userRoute.get("/listAllPayment",userController.listAllPayment)

  
userRoute.get("/addCustomer",userController.addCustomer)

userRoute.post("/addOrder",userController.addOrder)

userRoute.post("/payment1",userController.payment1)

userRoute.get("/dataGet",userController.dataGet)

userRoute.post("/cronjob",userController.cronjob)


module.exports = userRoute;