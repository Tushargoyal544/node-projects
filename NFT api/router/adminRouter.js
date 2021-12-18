const adminRouter = require("express").Router();
const adminController = require("../controller/adminController");
// const auth = require("../middleware/auth");


adminRouter.post("/adminLogIn", adminController.adminLogIn);

adminRouter.post('/viewNft',adminController.viewNft)

adminRouter.post('/listNft',adminController.listNft)

adminRouter.post('/viewOder',adminController.viewOder)

adminRouter.post('/listoder',adminController.listoder)

adminRouter.post('/listHistory',adminController.listHistory)



module.exports = adminRouter;