const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promocode = new Schema({
    promotion_code: String,
    is_public: Boolean,
});

module.exports = mongoose.model('promocode', promocode);
