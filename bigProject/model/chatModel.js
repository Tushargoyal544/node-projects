const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const chatKey= new Schema({
    senderId:{
        type:String
    },
    reciverId:{
        type:String
    },
    chat:{
        type:Array
    }
}, { timestamps: true });

    



module.exports = mongoose.model("chat", chatKey);


    
    