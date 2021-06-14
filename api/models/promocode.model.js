const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promocode = new Schema({
    promotion_code: String,
    status: {
        type: Boolean,
        default: true,
    },
    content: String,
    price_discount: Number,
});

module.exports = mongoose.model('promocode', promocode);
