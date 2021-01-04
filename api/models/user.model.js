const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Schema = mongoose.Schema;
const user = new Schema({
    is_admin:{
        type:Boolean,
        default: false
    },
    name:{
        type:String
    },
    email: {
        type: String,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    fbEmail:{
        type: String 
    },
    ggEmail:{
        type: String
    },
    password: {
        type: String
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
        type:Boolean,
        default: true
    }
});
user.methods.generateJWT = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY,{
                    expiresIn: '3h'
    });
    
    user.token = token;
    await user.save();
    return token;
}
module.exports = mongoose.model('user', user);