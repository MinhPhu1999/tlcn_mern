const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
    name:{
        required: true,
        type: String,
        unique: true
    },
    status: {
        required: true,
        type: Boolean
    }
})

module.exports = mongoose.model('Size', sizeSchema);