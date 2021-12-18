const mongoose=require('mongoose')
const schema =mongoose.Schema
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const gamekey=new schema({
    gameName:{
        type:String
    },
    gameType:{
        type:String
    },
    gamePlayTime:{
        type:String
    }
},{
    timestamps:true
}) 
gamekey.plugin(aggregatePaginate);
module.exports=mongoose.model('game',gamekey)