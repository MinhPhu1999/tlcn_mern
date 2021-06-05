const promocost = require('../models/promocost.model');
const order = require('../models/order.model');
exports.addPromotionCost = async (req, res) => {
    const exits = await promocost.findOne({ promotion_cost: req.body.promotion_cost });
    
	if (exits) {
        return res.json({ message: 'promotion cost exits' });
    }
    const newPro = new promocost(req.body);

    newPro.save((err, doc) => {
        err ? res.status(500).json({ message: err }) : res.status(200).json({ doc });
    });
};

exports.updatePromoCost = async (req, res) => {
    promocost.updateOne(
        { _id: id },
        {
            $set: req.body,
        },
        (err, data) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ message: 'update promotion cost success' });
        },
    );
};

exports.deletePromoCost = async (req, res) => {
    promocost.updateOne({ _id: req.params.id }, { is_public: false }, (err, data) => {
        err
            ? res.status(500).send({ message: err })
            : res.status(200).send({ message: 'delete promotion cost success' });
    });
};

exports.getPromoCost = async (req, res) => {
    promocost.find({}, (err, data) => {
        err ? res.status(500).send({ message: err }) : res.status(200).json(data);
    });
};
exports.check = async (req, res) => {
    const { id_user, promotion_cost } = req.body;
    const exits = await promocost.findOne({ promotion_cost: promotion_cost });
    if (!exits) {
        return res.json(false);
    }

    const orderF = await order.find({ id_user: id_user });

    if (!orderF) {
        return res.json(true);
    }
    for (let or of orderF) {
        if (or.promotion_cost == promotion_cost) {
            return res.json(false);
        }
    }
    res.json(true);
};
