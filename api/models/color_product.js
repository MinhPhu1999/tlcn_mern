const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const colorProductSchema = new mongoose.Schema({
    colorProduct: [
        {
            _id: { type: Schema.Types.ObjectId, ref: 'color' },
        },
    ],
    products: String,
});

module.exports = mongoose.model('colorproduct', colorProductSchema);
