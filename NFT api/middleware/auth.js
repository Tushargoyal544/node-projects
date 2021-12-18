const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
module.exports = {
    tokenVerify: (req, res, next)=>{
        try{
            jwt.verify(req.headers.token, "tushar1998", (tokenVerifyError, tokenVerifyResult)=>{
                if(tokenVerifyError){
                    return res.send({responseCode:501,responseMessage: "Internal server error: Token time has been expired...."});
                }else if(!tokenVerifyResult){
                    return res.send({responseCode: 404, responseMessage: "Token does't exist"});
                } else{
                    userModel.findOne({_id: tokenVerifyResult._id}, (findError, findResult)=>{
                        if(findError){
                            return res.send({responseCode: 501, responseMessage: "Internal server error"});
                        } else if(!findResult){
                            return res.send({responseCode: 404, responseMessage: "user does't exist"});
                        } else{
                            if(tokenVerifyResult.status == "DELETE"){
                                return res.send({responseCode: 404, responseMessage: "user has been deleted by admin...."});
                            } else if(tokenVerifyResult == "BLOCK"){
                                return res.send({responseCode: 404, responseMessage: "user has been blocked by amdin...."});
                            } else{
                                req.userId = tokenVerifyResult._id;
                                next();
                                // console.log(req.userId);
                                // console.log("token verified ");
                            }
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    }
}