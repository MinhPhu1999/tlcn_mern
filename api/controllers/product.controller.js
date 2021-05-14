const product = require('../models/product.model');
const order = require('../models/order.model');
const brandController = require('../controllers/brand.controller');
const categoryController = require('../controllers/category.controller');
const { performance } = require('perf_hooks');

exports.sortProduct = async (req, res) => {
    //khai báo các biến cần thiết
    let sapXep = req.params.inc;
    const listProduct = await product.find({ status: true });
    const sortListProduct = listProduct.sort(function (a, b) {
        if (sapXep == 'increase') return parseFloat(a.price) - parseFloat(b.price); //sắp xếp sản phẩm tăng dần theo giá
        return parseFloat(b.price) - parseFloat(a.price); //sắp xếp sản phẩm giảm dần theo giá
    });
    if (sortListProduct) {
        res.status(200).send(sortListProduct);
        return;
    }
    res.status(404).send({ message: 'product not found' });
};

exports.getProductByID = async (req, res) => {
    let id = req.params.id;
    const productFind = await product.findOne({ _id: id });
    if (productFind) {
        res.status(200).send(productFind);
        return;
    }
    res.status(404).send({ message: 'product not found' });
};

exports.getProducts = async (req, res) => {
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }
    let count = null;
    try {
        count = await product.countDocuments({ status: true }); // đém sản phẩm có bao nhiêu
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }
    let totalPage = parseInt((count - 1) / 8 + 1); // từ số lượng sản phẩm sẽ tính ra số trang
    let { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }
    product
        .find({ status: true })
        .skip(8 * (parseInt(page) - 1))
        .limit(8) // giới hạn hiển thị sản phẩm mỗi trang
        .exec((err, docs) => {
            if (err) {
                // console.log(err);
                return res.status(500).send({ message: err });
            }
            res.status(200).send({ data: docs, totalPage });
        });
};

exports.reView = async (req, res) => {
    try {
        const { rating } = req.body;

        if (rating && rating !== 0) {
            const productFind = await product.findById(req.params.id);
            if (!product) return res.status(400).json({ msg: 'Product does not exist.' });

            let num = productFind.numReviews;
            let rate = productFind.rating;

            await product.findOneAndUpdate(
                { _id: req.params.id },
                {
                    rating: rate + rating,
                    numReviews: num + 1,
                },
            );

            res.json({ msg: 'Update success' });
        }
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

exports.getAllProduct = async (req, res) => {
    const productFind = await product.find({ status: true });
    if (productFind) {
        res.status(200).send(productFind);
        return;
    }
    res.status(404).send({ message: 'product not found' });
};

exports.searchProduct = async (req, res) => {
    if (typeof req.query.name === 'undefined' ||
		typeof req.query.page === 'undefined'||
		typeof req.query.limit === 'undefined') {
		return res.status(402).send({ message: 'Data invalid' });
    }

    const { name, page, limit } = req.query;
	let count = await product.countDocuments({$or: [{ name: new RegExp(name, 'i'), status: true }]});
	let totalPage = parseInt((count - 1) / 2 + 1);
	
	product
        .find({
            $or: [{ name: new RegExp(name, 'i'), status: true }],
        })
        .skip(2 * (parseInt(page) - 1))
        .limit(parseInt(limit))
		.exec((err, docs)=>{
			if(err) return res.send("fail");
			res.send({data: docs, totalPage})
		});
    // const productFind = await product
    //     .find({
    //         $or: [{ name: new RegExp(name, 'i'), status: true }],
    //     })
    //     .skip(2 * (parseInt(page) - 1))
    //     .limit(parseInt(limit));

    // if (productFind) {
    //     return res.status(200).send(productFind);
    // }

    // res.status(404).send({ message: 'product not found' });
};

exports.getProductByBrand = async (req, res) => {
    let brandName = '';
    if (typeof req.params.brand !== 'undefined') brandName = req.params.brand;

    let searchIDBrand = null;
    searchIDBrand = await brandController.getIDBySearchText(brandName);

    let productFind = await product.find({
        $or: [{ id_brand: new RegExp(searchIDBrand, 'i') }],
    });
    if (productFind) {
        res.status(200).send(productFind);
        return;
    }
    res.status(404).send({ message: 'product not found' });
};

exports.getProductByCategory = async (req, res) => {
    if (typeof req.body.categoryName === 'undefined' || typeof req.body.disCount === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }
    const t0 = performance.now();
    let { categoryName, disCount, startDate, endDate } = req.body;

    let searchIDCatefory = null;
    searchIDCatefory = await categoryController.getIDBySearchText(categoryName);
    let productFind = await product.find({
        $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
    });

    for (let i in productFind) {
        product
            .updateOne(
                { _id: productFind[i]._id },
                {
                    $set: {
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        disCount: disCount,
                    },
                },
                { upsert: true },
            )
            .then(err => {
                // if(err) console.log('');
            });
    }

    let productFind1 = await product.find({
        $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
    });

    const t1 = performance.now();
    // console.log(t1 - t0);
    res.status(200).send({ productFind1 });
};

exports.updatePriceByCategory = async (req, res) => {
    if (
        typeof req.body.categoryName === 'undefined' ||
        typeof req.body.disCount === 'undefined' ||
        typeof req.body.increase === 'undefined'
    ) {
        return res.status(402).send({ message: 'Data invalid' });
    }

    let { categoryName, disCount, increase } = req.body;
    let discount = disCount;

    let searchIDCatefory = null;
    searchIDCatefory = await categoryController.getIDBySearchText(categoryName, res);
    let productFind = await product.find({
        $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
    });

    if (increase === false) {
        disCount = -disCount;
    }

    for (let i in productFind) {
        product
            .updateOne(
                { _id: productFind[i]._id },
                {
                    $set: {
                        sellPrice: productFind[i].price + (productFind[i].price * disCount) / 100,
                    },
                },
                { upsert: true },
            )
            .then(err => {
                // console.log(err);
            });
    }
    let productFind1 = await product.find({
        $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
    });

    res.status(200).send({ productFind1 });
};

exports.getNameByID = async (req, res) => {
    if (req.params.id === 'undefined') {
        res.status(422).send({ message: 'Invalid data' });
        return;
    }
    let result;
    let id = req.body.id;
    try {
        result = await product.findOne({ _id: id });
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }
    if (result === null) {
        return res.status(404).send({ message: 'not found' });
    }
    // console.log(result);
    res.status(200).send({ name: result.name, count: result.count });
};

exports.getProductTop10 = async (req, res) => {
    let orderFind = null;

    try {
        orderFind = await order.find({ paymentStatus: 'paid' });
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (orderFind === null) {
        return res.status(404).send({ message: 'products not found' });
    }

    let len = orderFind.length;
    let productFind;
    let arrProduct = [];
    let arr = [];

    //lay id product trong order
    for (let i = 0; i < len; i++) {
        let lenP = orderFind[i].cart.length;
        for (let j = 0; j < lenP; j++) {
            arr.push(orderFind[i].cart[j]._id);
        }
    }

    //chi lay 1 phan tu trong nhung pnan tu trung nhau trong mang
    arr = [...new Set(arr)];

    //lay thong tin product theo id
    for (let id_product of arr) {
        productFind = await product.findById(id_product);
        arrProduct.push(productFind);
    }

    res.status(200).json({
        data: arrProduct.length > 10 ? arrProduct.slice(0, 10) : arrProduct,
    });
};
