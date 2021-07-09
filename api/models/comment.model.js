const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
    {
        username: String,
        content: String,
        user_id: String,
        product_id: String,
        status: {
            type: Boolean,
            default: true,
        },
        rating: {
            type: Number,
            default: 0,
        },
        reply: Array,
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Comments', commentSchema);
