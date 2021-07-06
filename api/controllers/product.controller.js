const product = require('../models/product.model');
const order = require('../models/order.model');
const brandController = require('../controllers/brand.controller');
const categoryController = require('../controllers/category.controller');
const { performance } = require('perf_hooks');

exports.sortProduct = async (req, res) => {
    //khai báo các biến cần thiết
    const sapXep = req.params.inc;
    const listProduct = await product.find({ status: true });
    const sortListProduct = listProduct.sort(function (a, b) {
        if (sapXep == 'increase') return parseFloat(a.price) - parseFloat(b.price); //sắp xếp sản phẩm tăng dần theo giá
        return parseFloat(b.price) - parseFloat(a.price); //sắp xếp sản phẩm giảm dần theo giá
    });
    sortListProduct
        ? res.status(200).send(sortListProduct)
        : res.status(404).send({ message: 'products not found' });
};

exports.getProductByID = async (req, res) => {
    let productFind;
    try {
        productFind = await product.findOne({ _id: req.params.id });
    } catch (err) {
        return res.status(500).send({ message: 'Fail' });
    }
    productFind
        ? res.status(200).send(productFind)
        : res.status(404).send({ message: 'product not found' });
};

exports.getOne = async (req, res) => {
    try {
        const productFind = await product
            .findOne({ _id: req.params.id })
            .populate('id_category')
            .populate({
                path: 'id_category',
                select: 'name',
            })
            .populate('id_brand')
            .populate({
                path: 'id_brand',
                select: 'name',
            })
            .populate('colorProducts')
            .populate({
                path: 'colorProducts',
                populate: {
                    path: 'colorProduct',
                    populate: {
                        path: '_id',
                        select: 'name',
                    },
                },
            })
            .populate('sizeProducts')
            .populate({
                path: 'sizeProducts',
                populate: {
                    path: 'sizeProduct',
                    populate: {
                        path: '_id',
                        select: 'name',
                    },
                },
            });
        if (productFind) {
            return res.status(200).json(productFind);
        } else {
            return res.status(404).json({ message: 'Fail' });
        }
    } catch (err) {
        return res.status(404).json({ message: err });
    }
};

exports.getProducts = async (req, res) => {
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }
    let count;
    try {
        count = await product.countDocuments({ status: true }); // đém sản phẩm có bao nhiêu
    } catch (err) {
        return res.status(500).send({ message: 'fail' });
    }

    const totalPage = parseInt((count - 1) / 8 + 1); // từ số lượng sản phẩm sẽ tính ra số trang
    const { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }
    product
        .find({ status: true })
        .populate('colorProducts')
        .populate({
            path: 'colorProducts',
            populate: {
                path: 'colorProduct',
                populate: {
                    path: '_id',
                },
            },
        })
        .populate('sizeProducts')
        .populate({
            path: 'sizeProducts',
            populate: {
                path: 'sizeProduct',
                populate: {
                    path: '_id',
                },
            },
        })
        .skip(8 * (parseInt(page) - 1))
        .limit(8) // giới hạn hiển thị sản phẩm mỗi trang
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
        });
};

exports.reView = async (req, res) => {
    try {
        const { rating } = req.body;

        if (rating && rating !== 0) {
            const productFind = await product.findById(req.params.id);
            if (!productFind) return res.status(400).json({ msg: 'Product does not exist.' });

            // let num = productFind.numReviews;
            // let rate = productFind.rating;
            let num = 0;
            let rate = 0;
            if (productFind.numReviews) {
                num = productFind.numReviews;
            }
            if (productFind.rating) {
                rate = productFind.rating;
            }

            await product.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $set: {
                        rating: rate + rating,
                        numReviews: num + 1,
                    },
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
    productFind
        ? res.status(200).send(productFind)
        : res.status(404).send({ message: 'products not found' });
};

function escapeRegex(text) {
    if (text.indexOf(' ') != -1) return text.split(' ');
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, ' ');
}

exports.searchProduct = async (req, res) => {
    if (typeof req.query.name === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    let regex1;
    if (Array.isArray(escapeRegex(req.query.name))) {
        regex1 = new RegExp('.' + escapeRegex(req.query.name)[1], 'i');
    } else {
        regex1 = new RegExp('.' + escapeRegex(req.query.name), 'i');
    }
    const regex2 = new RegExp('^' + escapeRegex(req.query.name), 'i');

    product
        .find({
            $or: [{ name: { $in: [regex1, regex2] }, status: true }],
        })
        .exec((err, docs) => {
            err
                ? res.status(404).send({ message: 'products not found' })
                : res.send({ data: docs });
        });
};

exports.getProductByBrand = async (req, res) => {
    if (typeof req.params.brand === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    const searchIDBrand = await brandController.getIDBySearchText(req.params.brand);

    let productFind;
    try {
        productFind = await product.find({
            $or: [{ id_brand: new RegExp(searchIDBrand, 'i') }],
        });
    } catch (err) {
        return res.status(500).send({ message: 'products not found' });
    }
    productFind
        ? res.status(200).send(productFind)
        : res.status(404).send({ message: 'products not found' });
};

exports.getProductByCategory = async (req, res) => {
    if (typeof req.body.categoryName === 'undefined' || typeof req.body.disCount === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }
    const t0 = performance.now();
    const { categoryName, disCount, startDate, endDate } = req.body;

    const searchIDCategory = await categoryController.getIDBySearchText(categoryName);
    let productFind;
    try {
        productFind = await product.find({
            id_category: searchIDCategory,
        });
    } catch (err) {
        return res.status(500).send({ message: 'products not found' });
    }

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
        id_category: searchIDCategory,
        // $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
    });

    // const t1 = performance.now();
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

    const { categoryName, disCount, increase } = req.body;
    let discount = disCount;

    let searchIDCatefory = await categoryController.getIDBySearchText(categoryName, res);
    let productFind;
    try {
        productFind = await product.find({
            id_category: searchIDCatefory,
            // $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
        });
    } catch (err) {
        return res.status(500).send({ message: 'products not found' });
    }

    if (increase === false) {
        disCount = -disCount;
    }

    for (let i in productFind) {
        product
            .updateOne(
                { _id: productFind[i]._id },
                {
                    $set: {
                        price: productFind[i].price + (productFind[i].price * disCount) / 100,
                    },
                },
                { upsert: true },
            )
            .then(err => {
                // console.log(err);
            });
    }
    let productFind1 = await product.find({
        id_category: searchIDCatefory,
        // $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
    });

    res.status(200).send({ productFind1 });
};

exports.getNameByID = async (req, res) => {
    if (typeof req.params.id === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }
    let result;
    try {
        result = await product.findOne({ _id: req.params.id });
    } catch (err) {
        return res.status(404).send({ message: 'product not found' });
    }

    result
        ? res.status(200).send({ name: result.name })
        : res.status(500).send({ message: 'fail' });
};

exports.getProductTop10 = async (req, res) => {
    const orderFind = await order.find({ paymentStatus: 'paid' });

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
            arr.push(orderFind[i].cart[j].id);
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

exports.getProductCategory = async(req, res) =>{
	// kiểm tra tham số truyền vào có hay không
    if (typeof req.query.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    let count = null;

    try {
        count = await product.countDocuments({id_category: req.query.id, status: true}); // đém sản phẩm có bao nhiêu
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    const totalPage = parseInt((count - 1) / 2 + 1); // từ số lượng sản phẩm sẽ tính ra số trang
    const { page } = req.query;
    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    product
        .find({id_category: req.query.id, status: true})
        .populate('colorProducts')
        .populate({
            path: 'colorProducts',
            populate: {
                path: 'colorProduct',
                populate: {
                    path: '_id',
                },
            },
        })
        .populate('sizeProducts')
        .populate({
            path: 'sizeProducts',
            populate: {
                path: 'sizeProduct',
                populate: {
                    path: '_id',
                },
            },
        })
        .skip(2 * (parseInt(page) - 1))
        .limit(2) // giới hạn hiển thị sản phẩm mỗi trang
        .exec((err, docs) => {
            err
                ? res.status(404).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
        });
}