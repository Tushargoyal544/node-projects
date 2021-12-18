const array = require('joi/lib/types/array');
const mongoose=require('mongoose')
const schema =mongoose.Schema
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const chatKey=new schema({
    senderId:{
        type:String
    },
    receiverId:{
        type:String
    },
    chat:{
        type: Array
    },
},{
    timestamps:true
}) 
chatKey.plugin(aggregatePaginate);
module.exports=mongoose.model('chat',chatKey)