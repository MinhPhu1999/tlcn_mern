const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const banner = new Schema({
    content: {
        type: String,
        require: [true, 'không được để trống'],
    },
    categoryName: String,
    disCount: Number,
    startDate: Date,
    endDate: Date,
});

module.exports = mongoose.model('banner', banner);
