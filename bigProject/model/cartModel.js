const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const cartKey= new Schema({
    productName:{
        type:String
    },
    productPrice:{
        type:Number
    },
    status:{
        enum:['ACTIVE','BLOCK','DELETE'],
        default:'ACTIVE',
        type :String

    },
    transactionStatus:{
        default:"pending",
        type:String
    },
    UserId:{
        type:String
    },
    number:{
        type:Number
    },

    exp_month:{
        type:Number
    },
    exp_year:{
        type:Number
    },
    cvc:{
        type:Number
    },
    charge:{
        type:String
    }
  
}, { timestamps: true });

    



module.exports = mongoose.model("cart", cartKey);
