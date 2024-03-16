const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: Boolean,
        required: true
    },
    is_blocked:{
        type:Boolean,
        required:true
    },
});


const User = mongoose.model('User',userSchema);

module.exports = User;