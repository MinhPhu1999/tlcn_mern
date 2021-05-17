const banner = require('../models/banner.model');
const product = require('../models/product.model');
const categoryCtrl = require('./category.controller');

exports.addBanner = async (req, res) => {
    if (
        req.body.content === 'undefined' ||
        req.body.disCount === 'undefined' ||
        req.body.categoryName === 'undefined' ||
        req.body.startDate === 'undefined' ||
        req.body.endDate === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    const { content, disCount, categoryName, startDate, endDate } = req.body;

    let searchIDCatefory = await categoryCtrl.getIDBySearchText(categoryName);
    let productFind;
    try {
        productFind = await product.find({
            $or: [{ id_category: new RegExp(searchIDCatefory, 'i') }],
        });
    } catch (err) {
        return res.status(500).send({ message: err });
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

    const newBanner = new banner({
        content,
        disCount,
        categoryName,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
    });

    newBanner.save((err, doc) => {
        err
            ? res.status(500).send({ message: err })
            : res.status(201).send({ message: 'add banner success' });
    });
};
