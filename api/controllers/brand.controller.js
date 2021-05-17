const brand = require('../models/brand.model');
exports.getBrands = async (req, res) => {
    //get tất cả brand theo status = true
    brand.find({ status: true }, (err, docs) => {
        err
            ? res.status(500).json({ message: 'brand not found' })
            : res.status(200).json({ data: docs });
    });
};

exports.getNameByID = async (req, res) => {
    //kiểm tra có truyền vô id hay không
    if (req.params.id === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }
    //khai báo biến result
    let result = null;
    try {
        result = await brand.findOne({ _id: req.params.id }); //tìm kiếm brand theo id
    } catch (err) {
        return res.status(404).send({ message: 'brand not found' });
    }
    result
        ? res.status(200).send({ name: result.name })
        : res.status(404).send({ message: 'not found' });
};

exports.getIDBySearchText = async searchText => {
    //khai báo mảng
    let arr = [];
    try {
        arr = await brand.find({ name: new RegExp(searchText, 'i') }); //tìm kiếm theo tên
    } catch (err) {
        res.status(500).send({ message: err });
        return;
    }
    return arr.map(i => i.id); //trả về cái mảng
};
