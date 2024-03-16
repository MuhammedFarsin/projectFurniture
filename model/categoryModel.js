const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        require:true
    },
    listed:{
        type:Boolean,
        require:true
    },
    createdOn:{
        type:Date,
        default:Date.now
    },
    categoryOffer:{
        type:Number,
        default:0
    }
})
module.exports = mongoose.model("Category",categorySchema)