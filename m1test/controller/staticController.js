const staticModel = require("../model/staticModel");
module.exports = {
    viewStatic: (req, res)=>{
        try{
            staticModel.findOne({type: req.params.type}, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "schema does't exist"});
                } else{
                    return res.send({responseCode: 200, responseMessage: "Schema viewed successfully....", responseResult: findResult});
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    listStatic: (req, res)=>{
        try{
            staticModel.find((findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "schema does't exist"});
                } else{
                    return res.send({responseCode: 200, responseMessage: "Schema viewed successfully....", responseResult: findResult});
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    editStatic: (req, res)=>{
        try{
            staticModel.findOne({type: req.body.type}, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode:500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Schema does't exist"});
                } else{
                    staticModel.findByIdAndUpdate({_id: findResult._id}, {$set: req.body}, {new: true}, (updateError, updateResult)=>{
                        if(updateError){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else{
                            return res.send({responseCode: 200, responseMessage: "Schema updated successfully....", responseResult: updateResult});
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    }
}