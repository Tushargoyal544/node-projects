const mongoose = require("mongoose");
const paginate=require('mongoose-paginate')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const Schema = mongoose.Schema;
const addShopKey = new Schema({
    shopName: {
        type: String
    },
    shopImage:{
        type:String
    },
    shopOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref :'user'
    },
    shopLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: Array,
        }
    },
    status: {
        type: String,
        enum: ["ACTIVE", "DELETE", "BLOCK"],
        default: "ACTIVE"
    }
}, { timestamps: true });
addShopKey.index({ location: "2dsphere" })
    


addShopKey.plugin(paginate)
addShopKey.plugin(aggregatePaginate)
module.exports = mongoose.model("shop", addShopKey);


    
    