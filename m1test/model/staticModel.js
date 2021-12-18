const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const staticKey = new Schema({
    type: {
        type: String
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ["ACTIVE", "DELETE", "BLOCK"],
        default: "ACTIVE"
    }
}, {timestamps: true});
module.exports = mongoose.model("static", staticKey);
mongoose.model("static", staticKey).find((findError, findResult)=>{
    if(findError){
        console.log("Internal server error");
    } else if(findResult != 0){
        console.log("Schema is already exist");
    } else{
        let obj1 ={
            type: "about us",
            title: "about us details",
            description: "hii i am tushar."
        }
        let obj2 = {
            type: "Contact",
            title: "contact us",
            description: "Contect details "
        }
       
        mongoose.model("static", staticKey).create(obj1, obj2,  (createError, createResult)=>{
            if(createError){
                console.log("Schema is not created");
            } else{
                console.log(`Schema Created Sucessfully${createResult}`);
            }
        });
    }
});