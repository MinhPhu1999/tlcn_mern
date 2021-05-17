const mongoose = require('mongoose');
const Schema = mongoose.Schema;
sizeProductSchema = require('../models/size_product').schema;
colorProductSchema = require('../models/color_product').schema;

const product = new Schema({
    name: {
        type: String,
        required: [true, 'Không được bỏ trống'],
    },
    price: {
        type: Number,
        required: [true, 'Không được bỏ trống'],
    },
    sellPrice: Number,
    disCount: {
        type: Number,
        default: 0,
    },
    startDate: {
        type: Date,
        timezone: 'Asia/Ho_Chi_Minh',
    },
    endDate: {
        type: Date,
        timezone: 'Asia/Ho_Chi_Minh',
    },
    id_category: {
        type: String,
        required: [true, 'Không được bỏ trống'],
    },
    // img: {
    //     type: String,
    //     required: [true, 'Không được bỏ trống'],
    // },
    images: {
        type: Array,
        default: [],
    },
    id_brand: {
        type: String,
        required: [true, 'Không được bỏ trống'],
    },
    description: {
        type: String,
        required: [true, 'Không  được bỏ trống'],
    },
	colorProducts: {
		type: Schema.Types.ObjectId,
		ref: 'colorproduct'
	},
    sizeProducts: {
		type: Schema.Types.ObjectId,
		ref: 'sizeproduct'
	},
    // colorProducts: colorProductSchema,
    // sizeProducts: sizeProductSchema,
    numReviews: Number,
    rating: Number,
    status: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('product', product);
