const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sizeProductSchema = new mongoose.Schema({
    sizeProduct: [
        {
            _id: { type: Schema.Types.ObjectId, ref: 'size' },
            quantity: Number,
        },
    ],
	products: String
    // products: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'product',
    // },
});

module.exports = mongoose.model('sizeproduct', sizeProductSchema);
