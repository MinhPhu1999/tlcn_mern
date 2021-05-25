const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sizeProductSchema = new mongoose.Schema({
    sizeProduct: [
        {
            _id: { type: Schema.Types.ObjectId, ref: 'size' },
        },
    ],
    products: { type: Schema.Types.ObjectId, ref: 'product' },
    // products: String
});

module.exports = mongoose.model('sizeproduct', sizeProductSchema);
