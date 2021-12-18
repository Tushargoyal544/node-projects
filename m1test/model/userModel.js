const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const paginate=require('mongoose-paginate')
const aggregatePaginate = require('mongoose-aggregate-paginate-v2')
const Schema = mongoose.Schema;
const userKey = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'game'
    },
    phoneNumber: {
        type: String
    },
    email: {
        type: String
    },
    countryCode: {
        type: String
    },
    userName: {
        type: String
    },
    password: {
        type: String
    },
    address: {
        type: String
    },
    // dateOfBirth: {
    //     type: String
    // },
    // image: {
    //     type: String,
    // },
    // otp: {
    //     type: String
    // },
    // otpTime: {
    //     type: String
    // },
    otpVerify: {
        type: Boolean,
        default: false
    },
    emailVerify: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER"
    },
    speakeasy: {
        type: Boolean,
        default: false
    },
    base32: {
        type: String
    },
    // location: {
    //     type: {
    //         type: String,
    //         enum: ['Point'],
    //         default: 'Point',
    //     },
    //     coordinates: {
    //         type: Array,
    //     }
    // },
    ctry:{
        type:Array
    },
    sType:{
        type:String,
        enum:["FACEBOOK","INSTA","GOOGLE"],
        
    },
    sId:{
        type:String
    },
    status: {
        type: String,
        enum: ["ACTIVE", "DELETE", "BLOCK"],
        default: "ACTIVE"
    }
}, { timestamps: true });

userKey.index({ location: "2dsphere" })
userKey.plugin(paginate)
userKey.plugin(aggregatePaginate)
userModel = mongoose.model("user", userKey);

module.exports = userModel;

userModel.findOne({ userType: "ADMIN" }, (findError, findResult) => {
    if (findError) {
        console.log("Internal server error");
    } else if (findResult) {
        console.log("ADMIN is already exist....");
    } else {
        let obj = {
            firstName: "Tushar",
            lastName: "Goyal",
            email: "no-tushar@mobiloitte.com",
            phoneNumber: "7894561230",
            countryCode: "+91",
            userName: "Tushar123",
            userType:"ADMIN",
            location:{
                coordinates:[12,12]
            }
        } 
        userModel(obj).save((error,result)=>{
            if(result){
                console.log({respoceCode:200,responceMessage:'admin created',responceResult:result})
            }
        })
    }
       
});