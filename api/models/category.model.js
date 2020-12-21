const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const category = new Schema({
    name: {
        type:String,
        required: [true, "Không được bỏ trống"],
    },
    path:{
        type:String
    },
    status:{
        type:Boolean
    }
});
module.exports = mongoose.model('category', category);