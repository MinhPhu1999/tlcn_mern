'use strict'
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const user = new Schema({
    is_admin:{
        type:Boolean,
        default: false
    },
    name:{
        type:String,
        required:[true,"Không được bỏ trống name"]
    },
    email: {
        type: String,
        required: [true, "Không được bỏ trống email"],
        index: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    password: {
        type: String,
        required: [true, "Không được bỏ trống mk"]
    },
    is_verify: {
        type: Boolean,
        default: false
    },
    token: {
        type: String
    },
    otp: {
        type: String
    },
    status:{
        type:Boolean
    }
});
user.methods.generateJWT = async function() {
    // Generate an auth token for the user
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY)
    user.token = token;
    await user.save();
    return token;
}
module.exports = mongoose.model('user', user);