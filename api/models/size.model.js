const mongoose = require('mongoose');

const sizeSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String,
        unique: true,
    },
    description: {
        required: true,
        type: String,
    },
    status: {
        default: true,
        type: Boolean,
    },
});

module.exports = mongoose.model('size', sizeSchema);
