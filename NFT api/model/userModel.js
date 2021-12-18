const mongoose = require("mongoose");
const bcryptJs = require("bcryptjs");
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
    dateOfBirth: {
        type: String
    },
   
    otp: {
        type: String
    },
    otpTime: {
        type: String
    },
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
    location: {
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
            firstName: "tushar",
            lastName: "goyal",
            phoneNumber: "1234567890",
            email: "no-tushar@mobiloitte.com",
            countryCode: "+91",
            userName: "tushar7890",
            password: bcryptJs.hashSync("123"),
            address: "delhi",
            dateOfBirth: "01/01/1998",
            userType: "ADMIN",
            otpVerify: "true",
            emailVerify: "true",
            status: "ACTIVE",
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