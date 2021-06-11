const promocode = require('../models/promocode.model');
const order = require('../models/order.model');
exports.addPromotionCode = async (req, res) => {
    const exits = await promocode.findOne({ promotion_code: req.body.promotion_code });
    
	if (exits) {
        return res.json({ message: 'promotion code exits' });
    }
    const newPro = new promocode(req.body);

    newPro.save((err, doc) => {
        err ? res.status(500).json({ message: err }) : res.status(200).json({ doc });
    });
};

exports.updatePromoCode = async (req, res) => {
    promocode.updateOne(
        { _id: id },
        {
            $set: req.body,
        },
        (err, data) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ message: 'update promotion code success' });
        },
    );
};

exports.deletePromoCode = async (req, res) => {
    promocode.updateOne({ _id: req.params.id }, { is_public: false }, (err, data) => {
        err
            ? res.status(500).send({ message: err })
            : res.status(200).send({ message: 'delete promotion code success' });
    });
};

exports.getPromoCodes = async (req, res) => {
    promocode.find({}, (err, data) => {
        err ? res.status(500).send({ message: err }) : res.status(200).json(data);
    });
};
exports.check = async (req, res) => {
    const { id_user, promotion_code } = req.body;
    const exits = await promocode.findOne({ promotion_code: promotion_code });
    if (!exits) {
        return res.json(false);
    }

    const orderF = await order.find({ id_user: id_user });

    if (!orderF) {
        return res.json(true);
    }
    for (let or of orderF) {
        if (or.promotion_code == promotion_code) {
            return res.json(false);
        }
    }
    res.json(true);
};
