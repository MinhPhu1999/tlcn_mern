const size_product = require('../models/size_product');

exports.minusQuantity = async id_size => {
    const sizeP = await size_product.find({});
	const lenSizeP = sizeP.sizeProduct.lenght;
	console.log(lenSizeP);
};
