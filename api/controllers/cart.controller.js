'use strict';
const cart = require('../models/cart.model');
const product = require('../models/product.model');
const quantityP = require('../utils/quantity');
const size_product = require('../models/size_product');

exports.addToCart = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.body.id_user === 'undefined' || typeof req.body.products === 'undefined') {
        return res.status(422).send({ message: 'invalid data' });
    }
    //khai báo các biến cần thiết
    const { id_user, products } = req.body;

    const { id, quantity, price, color, size } = products;

    let count = 0;

    let cartFind = null;
    cartFind = await cart.findOne({ id_user: id_user });

    if (cartFind === null) {
        //nếu không có sẵn cart thì tạo cart mới
        const cart_new = new cart({
            id_user: id_user,
            products: products,
            grandTotal: quantityP.calPrice(quantity, price),
        });

        cart_new.save((err, data) => {
            if (err) return res.status(500).send('Add cart fail 1');
            quantityP.changeQuantity(id, quantity);
            res.status(200).send({ message: 'add cart success 1' });
        });
    } else {
        count = 0;
        const lenP = cartFind.products.length;
        for (let len in cartFind.products) {
            if (!quantityP.valid(cartFind.products[len], id, size, color)) {
                count++;
            } else {
                cartFind.products[len].quantity += quantity;
                cartFind.grandTotal += quantityP.calPrice(cartFind.products[len].price, quantity);
            }
        }
        if (count === lenP) {
            cartFind.products.push(products);
            cartFind.grandTotal += quantityP.calPrice(price, quantity);
        }

        //lưu những thay đổi
        cartFind.save((err, data) => {
            if (err) {
                res.status(500).send(err);
            } else {
                quantityP.changeQuantity(id, quantity);
                res.status(200).send({ message: 'add cart success 2' });
            }
        });
    }
};

exports.getCart = async (req, res) => {
	try {
        const data = await cart
            .findOne({ id_user: req.params.id_user })
            .populate('products.color')
            .populate({
                path: 'products.color',
                select: 'name',
            })
            .populate('products.size')
            .populate({
                path: 'products.size',
                select: 'name',
            });

        if (data) {
            return res.status(200).json(data.products);
        }
		else
        	return res.status(404).json({ message: 'Fail' });
    } catch (err) {
        return res.status(404).json({ message: 'Fail 2' });
    }
};

exports.getAll = async (req, res) => {
    //get tất cả cart có trong db theo id_user và status
    cart.find({ status: true }, (err, docs) => {
        err ? res.status(500).send({ message: err }) : res.status(200).send({ data: docs });
    });
};

exports.updateTang = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.id_user === 'undefined' ||
        typeof req.body.id_product === 'undefined' ||
        typeof req.body.size === 'undefined' ||
        typeof req.body.color === 'undefined'
    ) {
        return res.status(422).send({ message: 'invalid data' });
    }
    //khai báo các biến cần thiết
    const { id_user, id_product, size, color } = req.body;

    let cartFind = await cart.findOne({ id_user: id_user, status: true }); //tìm kiếm cart theo id_user và status

    if (cartFind === null) {
        //trường hợp không có cart trong db
        return res.status(404).send({ message: 'cart not found' });
    }
    //tìm kiếm vị trí id_product truyền vào bằng với id_product có trong cart
    for (let len in cartFind.products) {
        if (quantityP.valid(cartFind.products[len], id_product, size, color)) {
            cartFind.products[len].quantity += 1;
            cartFind.grandTotal += quantityP.calPrice(cartFind.products[len].price, 1);
        }
    }

    try {
        cartFind.save((err, data) => {
            if (err) return res.status(500).send('update cart fail 1');
            quantityP.changeQuantity(id_product, 1);
            res.status(200).send({ message: 'update cart success 1' });
        }); //lưu lại các thay đổi
    } catch (err) {
        return res.status(500).send('update cart fail 2');
    }

    // res.status(200).send({ message: 'update cart success' });
};

exports.updateGiam = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.id_user === 'undefined' ||
        typeof req.body.id_product === 'undefined' ||
        typeof req.body.size === 'undefined' ||
        typeof req.body.color === 'undefined'
    ) {
        return res.status(422).send({ message: 'invalid data' });
    }
    //khai báo các biến cần thiết
    const { id_user, id_product, size, color } = req.body;

    let cartFind = await cart.findOne({ id_user: id_user, status: true }); //tìm kiếm cart theo id_user và status

    if (cartFind === null) {
        //trường hợp không có cart trong db
        return res.status(404).send({ message: 'cart not found' });
    }
    //tìm kiếm vị trí id_product truyền vào bằng với id_product có trong cart
    for (let len in cartFind.products) {
        if (quantityP.valid(cartFind.products[len], id_product, size, color)) {
            cartFind.products[len].quantity -= 1;
            cartFind.grandTotal -= quantityP.calPrice(cartFind.products[len].price, 1);
        }
    }

    try {
        //lưu lại các thay đổi
        cartFind.save((err, data) => {
            if (err) return res.status(500).send('update cart fail 1');
            quantityP.changeQuantity(id_product, -1);
            res.status(200).send({ message: 'update cart success 1' });
        });
    } catch (err) {
        return res.status(500).send('update cart fail 2');
    }
};

exports.updateCart = async (req, res) => {
    if (typeof req.body.id_user === 'undefined' || typeof req.body.products === 'undefined') {
        return res.status(422).send({ message: 'invalid data' });
    }
    const { id_user, products } = req.body;
    let cartFind = null;

    try {
        cartFind = await cart.findOne({ id_user: id_user, status: true });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (cartFind === null) {
        return res.status(404).send({ message: 'product not found' });
    }

    let i, index;
    const productLen = products.length;

    for (i = 0; i < productLen; i++) {
        index = cartFind.products.findIndex(element => products[i]._id === element._id);
        if (index === -1) {
            return res.status(404).send({ message: 'product not found in list' });
        } else {
            cartFind.products[index].quantity += 1;
        }
    }

    try {
        await cart.findByIdAndUpdate(cartFind._id, {
            $set: { products: cartFind.products },
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    res.status(200).send({ message: 'update cart success' });
};

exports.deleteCart = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.id_user === 'undefined') {
        return res.status(422).send({ message: 'invalid data' });
    }

    //khai báo các biến cần thiết
    const { id_user } = req.params;
    let cartFind = null;

    try {
        cartFind = await cart.findOne({ id_user: id_user, status: true }); //tìm kiếm cart theo id_user và status
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    //trường hợp không có cart trong db
    if (cartFind === null) {
        return res.status(404).send({ message: 'cart not found' });
    }
    //cartFind.status = false;
    try {
        await cartFind.remove(); //thực hiện xóa cart
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    res.status(200).send({ message: 'delete cart success' }); //thông báo xóa cart thành công
};

exports.deleteProductInCart = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.id_user === 'undefined' ||
        typeof req.body.id_product === 'undefined' ||
        typeof req.body.size === 'undefined' ||
        typeof req.body.color === 'undefined'
    ) {
        return res.status(422).send({ message: 'invalid data' });
    }
    //khai báo các biến cần thiết
    const { id_user, id_product, size, color } = req.body;
    let quanP;

    let cartFind = await cart.findOne({ id_user: id_user, status: true }); //tìm kiếm cart theo id_user và status

    //trường hợp không có cart trong db
    if (cartFind === null) {
        return res.status(404).send({ message: 'cart not found' });
    }

    //tìm kiếm vị trí id_product truyền vào bằng với id_product có trong cart
    if (cartFind.products.length === 1) {
        quantityP.changeQuantity(id_product, -1);
        await cartFind.remove();
        if (result) return res.status(200).send({ message: 'delete cart success 1' });
        // await cartFind.save().then(cartFind.plusProduct(id_product));
    } else {
        for (let len in cartFind.products) {
            if (quantityP.valid(cartFind.products[len], id_product, size, color)) {
                quanP = cartFind.products[len].quantity;
                cartFind.grandTotal -= quantityP.calPrice(
                    cartFind.products[len].price,
                    cartFind.products[len].quantity,
                );
                cartFind.products.splice(len, 1); //xóa sản phẩm trong cart
            }
        }

        try {
            //lưu lại các thay đổi
            cartFind.save((err, data) => {
                if (err) return res.status(500).send('remove cart fail 1');
                quantityP.changeQuantity(id_product, -1);
                res.status(200).send({ message: 'remove cart success 1' });
            });
        } catch (err) {
            //xuất ra lỗi nếu xóa sản phẩm trong cart fail
            res.status(500).send({ message: err });
        }
    }
};
