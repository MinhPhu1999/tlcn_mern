const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const order = new Schema(
    {
        id_user: {
            type: String,
        },
		promotion_cost: String,
        cart: {
            type: [
                {
                    name: String,
                    price: Number,
                    img: String,
                    quantity: Number,
                    id: String,
                    color: { type: Schema.Types.ObjectId, ref: 'color' },
                    size: { type: Schema.Types.ObjectId, ref: 'size' },
                },
            ],
            required: true,
        },
        orderStatus: [
            {
                type: {
                    type: String,
                    enum: ['received', 'packed', 'shipped', 'delivered'],
                    default: 'received',
                },
                date: {
                    type: Date,
                },
                isCompleted: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        paymentStatus: {
            type: String,
            enum: ['pending', 'cancelled', 'paid'],
            required: true,
        },
        order_subtotal: {
            type: Number,
            required: true,
        },
        order_date: {
            type: Date,
            default: Date.now,
        },
        city: {
            type: String,
            required: [true, 'Không được bỏ trống'],
        },
        posteCode: {
            type: Number,
            required: [true, 'Không được bỏ trống'],
        },
        phone: {
            type: String,
            required: [true, 'Không được bỏ trống'],
        },
        name: {
            type: String,
            required: [true, 'Không được bỏ trống'],
        },
        address: {
            type: String,
            required: [true, 'Không được bỏ trống'],
        },
        email: {
            type: String,
            required: [true, 'Không được bỏ trống'],
            index: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'is invalid'],
        },
        shiping: {
            type: Number,
        },
        payment: {
            type: String,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('order', order);
