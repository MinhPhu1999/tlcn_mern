const promocode = require('../models/promocode.model');
const order = require('../models/order.model');

exports.getPromoCodes = async (req, res) => {
    promocode.find({ status: true }, (err, data) => {
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
