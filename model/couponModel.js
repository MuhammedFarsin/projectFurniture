const mongoose = require("mongoose")
const { ObjectId } = require("mongodb")

const couponSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    code : {
        type : String,
        required : true
    },
    discount : {
        type : Number,
        required : true
    },
    minimumAmount : {
        type : Number
    },
    createdOn : {
        type : Date,
        default : Date.now
    },
    expiryDate : {
        type : Date,
        required : true
    },
    usedCoupon : [
        {
            user_id : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
        }
    ]
})
module.exports = mongoose.model("Coupen",couponSchema)