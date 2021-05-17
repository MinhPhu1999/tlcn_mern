exports.changeQuantity = (size, sizeP, quantity) => {
    for (let lenP in sizeP.sizeProduct) {
        if (sizeP.sizeProduct[lenP]._id == size) {
            sizeP.sizeProduct[lenP].quantity -= quantity;
        }
    }
    sizeP.save((err, data) => {
        if (err) return false;
    });
    return true;
};

exports.calPrice = (price, quantity) => {
    return price * quantity;
};

exports.valid = (productCart, id_product, size, color) => {
    if (
        productCart.id == id_product &&
        productCart.color == color &&
        productCart.size == size
    ) {
        return true;
    }
    return false;
};
