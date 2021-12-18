const userRoute = require("express").Router();
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const userController = require("../controller/userController");


const auth = require("../middleware/auth");
userRoute.post("/signup", userController.signup);
userRoute.post("/otpVerify", userController.otpVerify);
userRoute.get("/emailVerification/:_id", userController.emailVerification);

userRoute.put("/resendOtp", userController.resendOtp);
userRoute.put("/forgetPassword", userController.forgetPassword);
userRoute.put("/rsetPassword", userController.rsetPassword);
userRoute.post('/pagination',userController.pagination)
userRoute.post('/address',userController.address1)
userRoute.post('/game',userController.game)
userRoute.post('/uploadImage',userController.uploadImage)

  
userRoute.post('/photos/upload', upload.array('image', 12),userController.multer1)

userRoute.post('/viewMulter', upload.single('photos'),userController.viewMulter)

  

userRoute.post('/view',userController.view)
userRoute.post('/filter',userController.filter)
//jwt
userRoute.post("/loginJwt", userController.loginJwt);
userRoute.get("/viewprofile", userController.viewprofile);
userRoute.put("/profileEdit", auth.tokenVerify, userController.profileEdit);
userRoute.get("/userList", userController.userList);

// modle m3

userRoute.post("/lookup", userController.lookup);

userRoute.post("/speakeasy", auth.tokenVerify, userController.speakeasy);
userRoute.post("/autspeakeasy", auth.tokenVerify, userController.autspeakeasy);

userRoute.post("/geonear", userController.geonear);


userRoute.post("/socialSignup",userController.socialSignup)

// *********************model 4******************

userRoute.post("/joi",userController.joi)


userRoute.post("/cron",userController.cron)
userRoute.post("/csv",userController.csvToJson);
userRoute.post("/exlstojson",userController.exlstojson)
    
userRoute.post("/xmlToJson",userController.xmlToJson)
// userRoute.post("/json",userController.json)

userRoute.post("/chat1",auth.tokenVerify,userController.chat1)
module.exports = userRoute;