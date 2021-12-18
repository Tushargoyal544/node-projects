const mongoose = require("mongoose");
const paginate=require('mongoose-paginate')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const Schema = mongoose.Schema;
const historyKey = new Schema({
   
    productPrice:{
        type:String
    },
   
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productId'
    
    },
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'ownerId'
    },
    status:{
        type:String,
        default:"buy"
    }
   

},
{timestamps:true})
historyKey.plugin(paginate)
historyKey.plugin(aggregatePaginate)


module.exports=mongoose.model('trasHistory',historyKey)
