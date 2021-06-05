const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const promocost = new Schema({
    promotion_cost: String,
    is_public: Boolean,
});

module.exports = mongoose.model('promocost', promocost);
