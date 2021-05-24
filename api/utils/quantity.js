const product = require('../models/product.model');

exports.changeQuantity = async (id_product, quantity) => {
    let productFind = await product.findOne({_id: id_product});
    productFind.quantity -= quantity;
    productFind.save();
};

exports.calPrice = (price, quantity) => {
    return price * quantity;
};

exports.valid = (productCart, id_product, size, color) => {
    if (productCart.id == id_product && productCart.color == color && productCart.size == size) {
        return true;
    }
    return false;
};
