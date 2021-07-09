const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
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

module.exports = mongoose.model('color', colorSchema);
