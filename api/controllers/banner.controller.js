const banner = require('../models/banner.model');
const product = require('../models/product.model');
const categoryCtrl = require('./category.controller');

exports.addBanner = async (req, res) => {
    let searchIDCatefory = await categoryCtrl.getIDBySearchText(req.body.categoryName);
    let productFind;
    try {
        productFind = await product.find({
            id_category: searchIDCatefory,
            // $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    for (let pro of productFind) {
        product
            .updateOne(
                { _id: pro._id },
                {
                    $set: {
                        sellPrice: pro.price - (pro.price * req.body.disCount) / 100,
                    },
                },
                { upsert: true },
            )
            .then(err => {
                // if(err) console.log('');
            });
    }

    const newBanner = new banner(req.body);

    newBanner.save((err, doc) => {
        err
            ? res.status(500).send({ message: err })
            : res.status(201).send({ message: 'add banner success' });
    });
};

exports.updateBanner = async (req, res) => {
    let searchIDCatefory = await categoryCtrl.getIDBySearchText(req.body.categoryName);
    let productFind;
    try {
        productFind = await product.find({ id_category: searchIDCatefory });
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    for (let pro of productFind) {
        product
            .updateOne(
                { _id: pro._id },
                {
                    $set: {
                        sellPrice: pro.price - (pro.price * req.body.disCount) / 100,
                    },
                },
                { upsert: true },
            )
            .then(err => {
                // if(err) console.log('');
            });
    }

    banner.updateOne({ _id: req.body.id }, { $set: req.body }, (err, data) => {
        err
            ? res.status(500).send({ message: 'fail' })
            : res.status(200).send({ message: 'Update success' });
    });
};

exports.updateStatus = async (req, res) => {
    banner.updateOne({ _id: req.params.id }, { status: false }, err => {
        err
            ? res.status(500).send({ message: 'fail' })
            : res.status(200).send({ message: 'Success' });
    });
};

exports.getBanner = async (req, res) => {
    banner.findOne({ _id: req.params.id }, (err, data) => {
        err ? res.status(404).json({ message: 'Banner not found' }) : res.status(200).json(data);
    });
};
exports.getBanners = async (req, res) => {
    banner.find({}, (err, data) => {
        err ? res.status(404).json({ message: 'Banners not found' }) : res.status(200).json(data);
    });
};
