const brand = require('../models/brand.model');
exports.getBrand = async (req, res) => {
    //get tất cả brand theo status = true
    brand.find({ status: true }, (err, docs) => {
        if (err) {
            res.status(422).send({ message: err });
            return;
        }
        res.status(200).send({ data: docs });
    });
};

exports.getNameByID = async (req, res) => {
    //kiểm tra có truyền vô id hay không
    if (req.params.id === 'undefined') {
        res.status(422).send({ message: 'Invalid data' });
        return;
    }
    //khai báo biến result
    let result;
    try {
        result = await brand.findById(req.params.id); //tìm kiếm brand theo id
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: err });
        return;
    }
    if (result === null) {
        //thông báo nếu không tìm thấy
        res.status(404).send({ message: 'not found' });
        return;
    }
    res.status(200).send({ name: result.name }); //trả vể kết quả
};

exports.getIDBySearchText = async (searchText) => {
    //khai báo mảng
    let arr = [];
    try {
        arr = await brand.find({ name: new RegExp(searchText, 'i') }); //tìm kiếm theo tên
    } catch (err) {
        res.status(500).send({ message: err });
        return;
    }
    return arr.map((i) => i.id); //trả về cái mảng
};
