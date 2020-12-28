const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const brand = new Schema({
    name: {
        type: String,
        required: [true, "Không được bỏ trống"],
    },
    status:{
        type:Boolean,
        default: true
    }
});
module.exports = mongoose.model('brand', brand);