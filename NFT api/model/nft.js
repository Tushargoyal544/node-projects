const mongoose = require("mongoose");
const paginate=require('mongoose-paginate')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const Schema = mongoose.Schema;
const productKey = new Schema({
    productImage:{
        type:String
    },
    productName:{
        type:String
    },
    productDes:{
        type:String
    },
    productQnt:{
        type:Number
    },
    productPrice:{
        type:String
    },
    sellQnt:{
        type:Number,
        default:0
    },
    QRCode:{
        type:String,
        default:""
    },
    productStatus:{
        type:String,
        enum:['ACTIVE','BLOCK'],
        default:'BLOCK'
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userId'
    
    }

},
{timestamps:true})
productKey.plugin(paginate)
productKey.plugin(aggregatePaginate)


module.exports=mongoose.model('nft',productKey)
