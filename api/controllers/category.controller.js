const category = require('../models/category.model');

exports.getCategorys = async (req, res) => {
    category.find({ status: true }, (err, docs) => {
        err
            ? res.status(500).json({ message: 'category not found' })
            : res.status(200).json({ data: docs });
    });
};

exports.getNameByID = async (req, res) => {
    if (req.params.id === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }
    let result;
    try {
        result = await category.findById(req.params.id);
    } catch (err) {
        return res.status(404).send({ message: 'category not found catch' });
    }
    result
        ? res.status(200).send({ name: result.name })
        : res.status(404).send({ message: 'category not found' });
};

exports.getIDBySearchText = async (searchText, res) => {
    let arr = [];
    try {
        arr = await category.find({ name: new RegExp(searchText) }); //, 'i',{name: 0}
    } catch (err) {
        res.status(500).send({ message: err });
        return;
    }
    return arr.map(i => i.id);
};
