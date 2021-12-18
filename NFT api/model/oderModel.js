const mongoose = require("mongoose");
const paginate=require('mongoose-paginate')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const Schema = mongoose.Schema;
const sellKey = new Schema({
    productImage:{
        type:String
    },
    productName:{
        type:String
    },
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
    buyNumber:{
        type:Number
    }

},
{timestamps:true})
sellKey.plugin(paginate)
sellKey.plugin(aggregatePaginate)


module.exports=mongoose.model('sellnft',sellKey)
