const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
module.exports = {
    tokenVerify: async(req, res, next)=>{
        try{
            var tokenVerifyResult=await jwt.verify(req.headers.token, "tushar1998" )
                
                if(!tokenVerifyResult){
                    return res.send({responseCode: 404, responseMessage: "Token does't exist"});
                } else{
                    var findResult =userModel.findOne({_id: tokenVerifyResult._id})
                         if(!findResult){
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
                    
                }
            
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    }
}