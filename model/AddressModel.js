const { ObjectId } = require("mongodb")
const mongoose = require("mongoose")

const AddressSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String,
        required : true
    },
    city : {
        type : String,
        required : true
    },
    streetAddress : {
        type : String,
        required : true
    },
    state : {
        type : String,
        required : true
    },
    zipcode : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : Number,
        required : true
    },
    user_id : {
        type : ObjectId,
        required : true
    }
})

module.exports = mongoose.model("Address",AddressSchema)