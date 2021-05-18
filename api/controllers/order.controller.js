'use trict';
const order = require('../models/order.model');
const cart = require('../models/cart.model');
const product = require('../models/product.model');

const userController = require('../controllers/user.controller');
const categoryController = require('../controllers/category.controller');

const ord = require('../utils/orderby');
const client = require('../config/redis');

require('dotenv').config();
const { performance } = require('perf_hooks');

exports.addOrder = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.id_user === 'undefined' ||
        typeof req.body.city === 'undefined' ||
        typeof req.body.posteCode === 'undefined' ||
        typeof req.body.address === 'undefined' ||
        typeof req.body.payment === 'undefined' ||
        typeof req.body.shiping === 'undefined' ||
        typeof req.body.phone === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }
    //khai báo các biến cần thiết
    const { id_user, city, posteCode, address, phone, payment, shiping } = req.body;

    // if(!validate.isValidPhone(phone)){
    // 	return res.status(422).send({message: 'Số điện thoại không hợp lệ'});
    // }
    // if(!validate.isValidPosteCode(posteCode)){
    // 	return res.status(422).send({message: 'PosteCode không hợp lệ'})
    // }
    let paymentStatus = 'pending';
    if (payment === 'Paypal') {
        paymentStatus = 'paid';
    }
    const getDataUser = await userController.getDataByID(id_user);
    let cartFind = null;
    try {
        cartFind = await cart.findOne({ id_user: id_user }); //tìm kiếm order theo id_user và status
    } catch (err) {
        return res.status(500).send({ message: 'cart not found' });
    }

    let orderStatus = [
        {
            type: 'ordered',
            date: new Date(),
            isCompleted: true,
        },
        {
            type: 'packed',
            isCompleted: false,
        },
        {
            type: 'shipped',
            isCompleted: false,
        },
        {
            type: 'delivered',
            isCompleted: false,
        },
    ];
    //tạo mới order
    const new_order = new order({
        id_user: id_user,
        cart: cartFind.products,
        city: city,
        order_subtotal: Number(cartFind.grandTotal) + Number(shiping),
        posteCode: posteCode,
        address: address,
        phone: phone,
        name: getDataUser[0],
        email: getDataUser[1],
        shiping: shiping,
        paymentStatus: paymentStatus,
        payment: payment,
        orderStatus: orderStatus,
    });

    try {
        await cartFind.remove();
        await new_order.save(err => {
            err
                ? res.status(500).send({ message: 'add order fail' })
                : res.status(201).send({ message: 'add order success' });
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.updateOrder = async (req, res) => {
    if (typeof req.body.id_order === 'undefined' || typeof req.body.type === 'undefined') {
        return res.status(422).send('Invalid Data');
    }
    const { id_order, type } = req.body;

    if (type === 'delivered') {
        await order.findByIdAndUpdate(id_order, {
            $set: { paymentStatus: 'paid' },
        });
    }

    order
        .updateOne(
            { _id: id_order, 'orderStatus.type': type },
            {
                $set: {
                    'orderStatus.$': [{ type: type, date: new Date(), isCompleted: true }],
                },
            },
        )
        .exec((error, order) => {
            if (error) return res.status(400).send({ error });
        });
    const orderFind = await order.findOne({
        _id: id_order,
        'orderStatus.type': type,
    });
    res.status(201).send({ orderFind });
};

exports.orders = async (req, res) => {
    order.find({}, (err, orders) => {
        err ? res.status(500).json({ message: 'size not found' }) : res.status(200).json(orders);
    });
};

exports.getOrderByDay = async (req, res) => {
    if (
        typeof req.body.day === 'undefined' ||
        typeof req.body.month === 'undefined' ||
        typeof req.body.year === 'undefined'
    ) {
        return res.status(402).send({ message: '!invalid' });
    }

    const { day, month, year } = req.body;
    let orderFind = null;

    try {
        orderFind = await order.find({
            date: {
                $gte: new Date(year, month - 1, day),
                $lt: new Date(year, month - 1, parseInt(day) + 1),
            },
            paymentStatus: 'paid',
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    orderFind
        ? res.status(200).json(orderFind)
        : res.status(404).json({ message: 'order not found' });
};

///redis
exports.redisGetOrderByMonth = async (req, res) => {
    let t0 = performance.now();
    const { year, month } = req.body;
    const byMonth = `${year}${month}`;
    client.get(byMonth, (err, orderFind) => {
        orderFind ? res.status(200).json(JSON.parse(orderFind)) : this.getOrderByMonth(req, res);
    });
};
exports.getOrderByMonth = async (req, res) => {
    let t0 = performance.now();
    if (typeof req.body.year === 'undefined' || typeof req.body.month === 'undefined') {
        return res.status(402).send({ message: '!invalid' });
    }

    const { month, year } = req.body;
    const byMonth = `${year}${month}`;
    console.log(typeof byMonth, byMonth);

    let orderFind = null;
    try {
        orderFind = await order.find({
            order_date: {
                $gte: new Date(year, parseInt(month) - 1, 1),
                $lt: new Date(year, month, 1),
            },
            paymentStatus: 'paid',
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    client.setex(byMonth, 8080, JSON.stringify(orderFind));
    orderFind
        ? res.status(200).json(orderFind)
        : res.status(404).json({ message: 'order not found' });

    let t1 = performance.now();
    console.log(t1 - t0);
};

///redis
exports.redisGetOrderByYear = async (req, res) => {
    let t0 = performance.now();
    const { year } = req.params;
    const byYear = `${year}byyear`;
    client.get(byYear, (err, arrOr) => {
        if (arrOr) {
            arrOr = JSON.parse(arrOr);
            res.status(200).json({ arrOr });
        } else {
            this.getOrderByYear(req, res);
        }
    });
    let t1 = performance.now();
    console.log(t1 - t0);
};
exports.getOrderByYear = async (req, res) => {
    let t0 = performance.now();
    if (typeof req.params.year === 'undefined') {
        return res.status(402).send({ message: '!invalid' });
    }

    const { year } = req.params;
    const byYear = `${year}byyear`;

    let getOrder;
    try {
        getOrder = await order.find({ paymentStatus: 'paid' });
    } catch (err) {
        return res.status(500).json({ message: 'orders not found' });
    }
    let index = 0;
    let orderFind;
    let arrOr = [];
    let lenOrder = getOrder.length;

    for (let i = 1; i < 13; i++) {
        orderFind = 0;

        while (index < lenOrder) {
            if (
                getOrder[index].order_date >= new Date(year, i - 1, 1) &&
                getOrder[index].order_date < new Date(parseInt(year), i, 1)
            ) {
                orderFind++;
            }
            index++;
        }
        arrOr.push(orderFind);
        index = orderFind;
    }
    client.setex(byYear, 8080, JSON.stringify(arrOr));
    res.status(200).json({ arrOr });
    let t1 = performance.now();
    console.log(t1 - t0);
};

///redis
exports.redisGetQuantityByYear = async (req, res) => {
    let t0 = performance.now();
    const { year } = req.params;
    const quantitybyyear = year + 'quantitybyyear';
    client.get(quantitybyyear, (err, arrOr) => {
        if (arrOr) {
            arrOr = JSON.parse(arrOr);
            res.status(200).json({ arrOr });
        } else {
            this.getQuantityByYear(req, res);
        }
    });
    let t1 = performance.now();
    console.log(t1 - t0);
};
exports.getQuantityByYear = async (req, res) => {
    // let t0 = performance.now();
    if (typeof req.params.year === 'undefined') {
        return res.status(402).send({ message: '!invalid' });
    }

    const { year } = req.params;
    const quantitybyyear = year + 'quantitybyyear';

    let getOrder;
    try {
        getOrder = await order.find({ paymentStatus: 'paid' });
    } catch (err) {
        return res.status(500).json({ message: 'orders not found' });
    }
    let index = 0;
    let dem = 0;
    let orderFind;
    let arrOr = [];
    let lenOrder = getOrder.length;

    for (let i = 1; i < 13; i++) {
        orderFind = 0;
        dem = 0;

        while (index < lenOrder) {
            let lenCart = getOrder[index].cart.length;

            if (
                getOrder[index].order_date >= new Date(year, i - 1, 1) &&
                getOrder[index].order_date < new Date(parseInt(year), i, 1)
            ) {
                for (let j = 0; j < lenCart; j++) {
                    orderFind += getOrder[index].cart[j].quantity;
                }

                dem++;
            }
            index++;
        }

        arrOr.push(orderFind);
        index = dem;
    }

    client.setex(quantitybyyear, 8080, JSON.stringify(arrOr));

    res.status(200).json({ arrOr });
    // let t1 = performance.now();
    // console.log(t1 - t0);
};

///redis
exports.redisGetQuantityByYearAndCategory = (req, res) => {
    // let t0 = performance.now();
    const { year, categoryName } = req.body;
    const yearandcategory = year + 'yearandcategory3';
    client.get(yearandcategory, (err, arrOr) => {
        if (arrOr) {
            arrOr = JSON.parse(arrOr);
            res.status(200).json({ arrOr });
        } else {
            this.getQuantityByYearAndCategory(req, res);
        }
    });
    // let t1 = performance.now();
    // console.log(t1 - t0);
};
exports.getQuantityByYearAndCategory = async (req, res) => {
    // var t0 = performance.now();

    if (typeof req.body.year === 'undefined' || typeof req.body.categoryName === 'undefined') {
        return res.status(402).send({ message: '!invalid' });
    }

    const { year, categoryName } = req.body;
    const yearandcategory = year + 'yearandcategory3';
    let searchIDCatefory = await categoryController.getIDBySearchText(categoryName);
    let productFind;
    try {
        productFind = await product.find({
            $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
        });
    } catch (err) {
        return res.status(500).json({ message: 'products not found' });
    }

    const getOrder = await order.find({ paymentStatus: 'paid' });
    let index = 0;
    let dem = 0;
    let orderFind;
    let arrOr = [];
    const lenOrder = getOrder.length;
    const lenProduct = productFind.length;

    for (let i = 1; i < 13; i++) {
        orderFind = 0;
        dem = 0;

        while (index < lenOrder) {
            const lenCart = getOrder[index].cart.length;

            if (
                getOrder[index].order_date >= new Date(parseInt(year), i - 1, 1) &&
                getOrder[index].order_date < new Date(parseInt(year), i, 1)
            ) {
                for (let j = 0; j < lenCart; j++) {
                    for (let lenP = 0; lenP < lenProduct; lenP++) {
                        if (String(getOrder[index].cart[j]._id) === String(productFind[lenP]._id)) {
                            orderFind += getOrder[index].cart[j].quantity;
                        }
                    }
                }

                dem++;
            }
            index++;
        }

        arrOr.push(orderFind);
        index = dem;
    }
    client.setex(yearandcategory, 8080, JSON.stringify(arrOr));

    res.status(200).json({ arrOr });

    // var t1 = performance.now();

    // console.log(t1 - t0);
};

///redis
exports.redisGetQuantityOrderByYearAndCategory = async (req, res) => {
    let t0 = performance.now();
    const { year, categoryName } = req.body;
    const countorder = year + 'countorder';
    client.get(countorder, (err, arrOr) => {
        if (arrOr) {
            arrOr = JSON.parse(arrOr);
            res.status(200).json({ arrOr });
        } else {
            this.getQuantityOrderByYearAndCategory(req, res);
        }
    });
    let t1 = performance.now();
    console.log(t1 - t0);
};
exports.getQuantityOrderByYearAndCategory = async (req, res) => {
    var t0 = performance.now();
    if (typeof req.body.year === 'undefined' || typeof req.body.categoryName === 'undefined') {
        return res.status(402).send({ message: '!invalid' });
    }

    const { year, categoryName } = req.body;
    const countorder = year + 'countorder';
    // console.log(countorder);
    const searchIDCatefory = await categoryController.getIDBySearchText(categoryName);
    let productFind;
    try {
        productFind = await product.find({
            $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
        });
    } catch (err) {
        return res.status(500).json({ message: 'products not found' });
    }

    let getOrder;
    try {
        getOrder = await order.find({ paymentStatus: 'paid' });
    } catch (err) {
        return res.status(500).json({ message: 'orders not found' });
    }
    let index = 0;
    let dem = 0;
    let orderFind = 0;
    let arrOr = [];
    const lenOrder = getOrder.length;
    const lenProduct = productFind.length;

    for (let i = 1; i < 13; i++) {
        orderFind = 0;
        countOrder = 0;
        dem = 0;

        while (index < lenOrder) {
            const lenCart = getOrder[index].cart.length;

            if (
                getOrder[index].order_date >= new Date(year, i - 1, 1) &&
                getOrder[index].order_date < new Date(parseInt(year), i, 1)
            ) {
                for (let j = 0; j < lenCart; j++) {
                    for (let lenP = 0; lenP < lenProduct; lenP++) {
                        if (String(getOrder[index].cart[j]._id) === String(productFind[lenP]._id)) {
                            orderFind++;
                            break;
                        }
                    }
                    if (orderFind > 0) {
                        break;
                    }
                }
                dem++;
            }
            index++;
        }
        arrOr.push(orderFind);
        index = dem;
    }
    client.setex(countorder, 8080, JSON.stringify(arrOr));

    res.status(200).json({ arrOr });

    var t1 = performance.now();
    console.log(t1 - t0);
};

exports.checkCanComment = async (req, res) => {
    if (typeof req.body.id_user === 'undefined' || typeof req.body.id_product === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    const { id_user, id_product } = req.body;
    let orderFind;
    try {
        orderFind = await order.find({
            id_user: id_user,
            paymentStatus: 'paid',
        });
    } catch (err) {
        return res.status(500).json({ message: 'order not found' });
    }

    let lenOr = orderFind.length;

    for (let i = 0; i < lenOr; i++) {
        let lenCart = orderFind[i].cart.length;
        for (let j = 0; j < lenCart; j++) {
            let index = orderFind[i].cart.findIndex(element => id_product === element._id);

            if (index >= 0) {
                return res.status(200).send({ message: 'true' });
            }
        }
    }

    res.status(200).send({ message: 'false' });
};

///redis
exports.redisGetOrderTop10 = async (req, res) => {
    // const t0 = performance.now();
    const top10 = 'top10';
    client.get(top10, (err, arr) => {
        if (arr) {
            arr = JSON.parse(arr);
            res.status(200).json({ data: arr });
        } else {
            this.getOrderTop10(req, res);
        }
    });
    // const t1 = performance.now();
    // console.log(t1 - t0);
};
exports.getOrderTop10 = async (req, res) => {
    // let t0 = performance.now();
    let orderFind = null;
    const top10 = 'top10';

    try {
        orderFind = await order.find({ paymentStatus: 'paid' });
    } catch (err) {
        return res.status(500).send({ message: 'order not found' });
    }

    if (orderFind === null) {
        return res.status(404).json({ message: 'order not found' });
    }

    let arr = [];
    const len = orderFind.length;

    for (let i = 0; i < len; i++) {
        const lenP = orderFind[i].cart.length;
        for (let j = 0; j < lenP; j++) {
            const index = arr.findIndex(element => orderFind[i].cart[j]._id === element._id);
            if (index === -1) {
                arr.push(orderFind[i].cart[j]);
            } else {
                arr[index].quantity += Number(orderFind[i].cart[j].quantity);
            }
        }
    }

    arr.sort(function (a, b) {
        return b.quantity - a.quantity;
    });
    client.setex(top10, 8080, JSON.stringify(arr.length > 10 ? arr.slice(0, 10) : arr));

    res.status(200).json({ data: arr.length > 10 ? arr.slice(0, 10) : arr });
    // let t1 = performance.now();
    // console.log(t1 - t0);
};

///redis
exports.redisGetCustomerOrders = async (req, res) => {
    // const t0 = performance.now();
    const customer = 'CustomerOrders';
    client.get(customer, (err, orders) => {
        if (orders) {
            orders = JSON.parse(orders);
            res.status(200).json({ orders });
        } else {
            this.getCustomerOrders(req, res);
        }
    });
    // const t1 = performance.now();
    // console.log(t1 - t0);
};
exports.getCustomerOrders = async (req, res) => {
    // const t0 = performance.now();
    const customer = 'CustomerOrders';
    const orders = await order.find({}).populate('cart._id', 'name').exec();
    if (orders) {
        client.setex(customer, 8080, JSON.stringify(orders));
        res.status(200).json({ orders });
    } else {
        res.status(404).json({ message: 'order not found' });
    }
    // orders
    //     ? res.status(200).json({ orders })
    //     : res.status(404).json({ message: 'order not found' });

    // const t1 = performance.now();
    // console.log(t1 - t0);
};

exports.verifyPayment = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.token === 'undefined') {
        return res.status(402).send({ message: '!invalid' });
    }
    //khai báo các biến cần thiết
    let tokenFind = null;
    try {
        tokenFind = await order.findOne({ token: req.params.token }); //tìm kiếm order theo token
    } catch (err) {
        return res.status(404).send({ message: 'order not found!!!' });
    }

    try {
        //lưu lại các thay đổi
        await order.findByIdAndUpdate(tokenFind._id, { $set: { is_send: true } }, err => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ message: 'verify payment success!' });
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.getOrderNoVerify = async (req, res) => {
    //khai báo các biến cần thiết
    let quantity = null;
    try {
        quantity = await order.quantityDocuments({ is_verify: false }); //đếm order có trong db
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    const quantityPage = parseInt((quantity - 1) / 9 + 1); //tính số trang
    const { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
        return res.status(200).send({
            data: [],
            message: 'Invalid page',
            quantityPage,
        });
    }
    //get order theo is_verify
    order
        .find({ is_verify: false })
        .skip(9 * (parseInt(page) - 1))
        .limit(9)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ data: docs, quantityPage });
        });
};

exports.getOrderVerify = async (req, res) => {
    //khai báo biến cần thiết
    let quantity = null;
    try {
        quantity = await order.quantityDocuments({ is_verify: true }); //đếm order có trong db
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    const quantityPage = parseInt((quantity - 1) / 9 + 1); //tính số trang
    const { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
        return res.status(200).send({
            data: [],
            message: 'Invalid page',
            quantityPage,
        });
    }
    //get order theo is_send
    order
        .find({ is_verify: true })
        .skip(9 * (parseInt(page) - 1))
        .limit(9)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: 'order fail' })
                : res.status(200).send({ data: docs, quantityPage });
        });
};

exports.getOrderNoDeliver = async (req, res) => {
    //khai báo các biến cần thiết
    let quantity = null;
    try {
        quantity = await order.countDocuments({ is_delivering: false }); //đếm order có trong db
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    const quantityPage = parseInt((quantity - 1) / 9 + 1); //tính số trang
    const { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
        return res.status(200).send({
            data: [],
            message: 'Invalid page',
            quantityPage,
        });
    }
    //get order theo is_send
    order
        .find({ is_delivering: false })
        .skip(9 * (parseInt(page) - 1))
        .limit(9)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: 'order fail' })
                : res.status(200).send({ data: docs, quantityPage });
        });
};

exports.getOrderDeliver = async (req, res) => {
    //khai báo biến cần thiết
    let quantity = null;
    try {
        quantity = await order.countDocuments({ is_verify: true }); //đếm order có trong db
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    const quantityPage = parseInt((quantity - 1) / 9 + 1); //tính số trang
    const { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
        return res.status(200).send({
            data: [],
            message: 'Invalid page',
            quantityPage,
        });
    }
    //get order theo is_send
    order
        .find({ is_verify: true })
        .skip(9 * (parseInt(page) - 1))
        .limit(9)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: 'order fail' })
                : res.status(200).send({ data: docs, quantityPage });
        });
};

exports.getOrder = async (req, res) => {
    if (typeof req.params.id_user === 'undefined') {
        return res.status(500).send('Invalid Data');
    }

    const { type, paymentStatus } = req.body;

    let ordered = [];
    try {
        orderFind = await order.find({ id_user: req.params.id_user });
    } catch (err) {
        return res.status(500).send({ message: 'orders not found catch' });
    }

    if (paymentStatus == 'cancelled') {
        for (let or in orderFind) {
            if (orderFind[or].paymentStatus === paymentStatus) {
                ordered.push(orderFind[or]);
            }
        }
    } else {
        for (let or in orderFind) {
            if (ord.ordered(type, orderFind[or])) {
                ordered.push(orderFind[or]);
            }
        }
    }
    ordered ? res.status(200).send(ordered) : res.status(404).json({ message: 'order not found' });
};

exports.getAllorder = async (req, res) => {
    const orderFind = await order.find({});
    orderFind
        ? res.status(200).send(orderFind)
        : res.status(404).send({ message: 'order not found' });
};

exports.getAllOrder = async (req, res) => {
    //khai báo biến cần thiết
    let quantity = null;
    try {
        quantity = await order.countDocuments({}); //đếm order có trong db
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    const quantityPage = parseInt((quantity - 1) / 9 + 1); //tính số trang
    const { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
        return res.status(200).send({
            data: [],
            message: 'Invalid page',
            quantityPage,
        });
    }
    //get order theo is_send
    order
        .find()
        .skip(9 * (parseInt(page) - 1))
        .limit(9)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ data: docs, quantityPage });
        });
};

exports.redisGetOrderDetail = async (req, res) => {
    // const t0 = performance.now();
    const orderdetail = `detail${req.params.id}`;
    client.get(orderdetail, (err, orderFind) => {
        if (orderFind) {
            orderFind = JSON.parse(orderFind);
            res.status(200).json(orderFind);
        } else {
            this.getOrderDetail(req, res);
        }
    });
    // const t1 = performance.now();
    // console.log(t1 - t0);
};
exports.getOrderDetail = async (req, res) => {
    // const t0 = performance.now();
    const orderdetail = `detail${req.params.id}`;
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.id === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }
    let orderFind;
    try {
        orderFind = await order.find({ _id: req.params.id });
    } catch (err) {
        return res.status(500).send('Order not found');
    }
    if (orderFind) {
        client.setex(orderdetail, 8080, JSON.stringify(orderFind));
        res.status(200).send(orderFind);
    } else {
        res.status(404).send('order not found');
    }
    // orderFind ? res.status(200).send(orderFind) : res.status(404).send('order not found');
    // const t1 = performance.now();
    // console.log(t1 - t0);
};

exports.deleteOrder = async (req, res) => {
    order
        .updateOne({ _id: req.params.id }, { $set: { paymentStatus: 'cancelled' } })
        .exec(error => {
            error
                ? res.status(400).send({ message: 'order not found' })
                : res.status(201).send('delete order success');
        });
};
