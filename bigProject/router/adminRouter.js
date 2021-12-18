const adminRouter = require("express").Router();
const adminController = require("../controller/adminController");
const auth = require("../middleware/auth");

// const auth = require("../middleware/auth");

/**
   * @swagger
   * /api/v1/admin/adminLogIn:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: adminLogIn 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email is required.
   *         in: formData
   *         required: false
   *     
   *       - name: password
   *         description: password is required.
   *         in: formData
   *         required: false
   *       - name: userToken
   *         description: userToken is required.
   *         in: formData
   *         required: false
   *       
   *     responses:
   *       200:
   *         description: adminLogIn  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */


adminRouter.post("/adminLogIn", adminController.adminLogIn);

/**
   * @swagger
   * /api/v1/admin/forgotAdminPassword:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: forgotAdminPassword 
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
   *         description: forgotAdminPassword  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */

adminRouter.post("/forgotAdminPassword",adminController.forgotAdminPassword)

/**
   * @swagger
   * /api/v1/admin/resetAdminPassword:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: resetAdminPassword 
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
   *         description: resetAdminPassword  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */
adminRouter.post("/resetAdminPassword",adminController.resetAdminPassword)

/**
   * @swagger
   * /api/v1/admin/editAdminProfile:
   *   put:
   *     tags:
   *       - ADMIN
   *     description: editAdminProfile 
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token is required.
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
   *         description: editAdminProfile  successfully
   *       404:
   *         description: Invalid credentials
   *       500:
   *         description: Internal Server Error
   */
adminRouter.put("/editAdminProfile",auth.tokenVerify ,adminController.editAdminProfile)

/**
    * @swagger
    * /api/v1/admin/viewShop:
    *   post:
    *     tags:
    *       - ADMIN
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

 adminRouter.post("/viewShop", adminController.viewShop)


/**
    * @swagger
    * /api/v1/admin/listShop:
    *   get:
    *     tags:
    *       - ADMIN
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
 adminRouter.get("/listShop",adminController.listShop)

module.exports = adminRouter;