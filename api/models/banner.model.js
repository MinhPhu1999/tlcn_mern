const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const banner = new Schema({
    content: {
        type: String,
        require: [true, 'không được để trống'],
    },
    categoryName: String,
    id_category: String,
    disCount: Number,
    status: Boolean,
});

module.exports = mongoose.model('banner', banner);
