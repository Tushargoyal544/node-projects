const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const addressKey = new Schema({
    address: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    pinNumber: {
        type: String
    },
})

module.exports = mongoose.model('address',  addressKey)