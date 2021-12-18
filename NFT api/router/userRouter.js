const userRoute = require("express").Router();
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
const userController = require("../controller/userController");


const auth = require("../middleware/auth");
userRoute.post("/signup", userController.signup);
userRoute.post('/secourity2fa',auth.tokenVerify,userController.secourity2fa)
userRoute.post("/otpVerify", userController.otpVerify);
userRoute.get("/emailVerification/:_id", userController.emailVerification);

userRoute.put("/resendOtp", userController.resendOtp);
userRoute.put("/forgetPassword", userController.forgetPassword);
userRoute.put("/rsetPassword", userController.rsetPassword);

  

//jwt
userRoute.post("/loginJwt", userController.loginJwt);
userRoute.get("/viewprofile", userController.viewprofile);
userRoute.put("/profileEdit", auth.tokenVerify, userController.profileEdit);
userRoute.get("/userList", userController.userList);




// product
userRoute.post("/productAdd",auth.tokenVerify,userController.productAdd)

userRoute.post("/viewProduct",userController.viewProduct)

userRoute.post("/listNft",userController.listNft)

userRoute.post("/nftSell",auth.tokenVerify,userController.nftSell)

userRoute.post("/viewSellNft",userController.viewSellNft)

userRoute.post("/listSellNft",userController.listSellNft)

userRoute.post("/buyNft",auth.tokenVerify,userController.buyNft)

userRoute.post("/listOderNft",userController.listOderNft)

userRoute.post('/transHistory',userController.transHistory)
    
userRoute.post('/viewHistory',auth.tokenVerify,userController.viewHistory)
userRoute.post('/listHistory',auth.tokenVerify,userController.listHistory)



module.exports = userRoute;