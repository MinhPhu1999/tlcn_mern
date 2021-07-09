const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const stock = new Schema(
    {
        name_category: {
            type: String,
            required: [true, 'Không được bỏ trống'],
        },
        path: {
            type: String,
            required: [true, 'Không được bỏ trống'],
        },
        name_brand: {
            type: String,
            required: [true, 'Không được bỏ trống'],
        },
        date_import: {
            type: Date,
            default: Date.now(),
        },
        quantity: {
            type: Number,
            required: [true, 'Không được bỏ trống'],
        },
        status: {
            type: Boolean,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('stock', stock);
