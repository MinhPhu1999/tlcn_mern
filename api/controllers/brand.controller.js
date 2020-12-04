'use strict'
const brand = require('../models/brand.model');
exports.getBrand = async (req, res) => {
    brand.find({status:true}, (err, docs) => {
        if(err) {
            res.status(422).send({message:err});
            return;
        }
        res.status(200).send({data:docs});
    })
}

exports.getNameByID = async (req, res) => {
    if(req.params.id === 'undefined') {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let result
    try {
        result = await brand.findById(req.params.id);
    }
    catch(err) {
        console.log(err)
        res.status(500).send({message: err})
        return;
    }
    if(result === null){
        res.status(404).send({message: "not found"})
        return;
    }
    res.status(200).send({name: result.name})
}

exports.getIDBySearchText = async (searchText) => {
    let arr = [];
    try {
        arr = await brand.find({name: new RegExp(searchText, "i")});
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    return arr.map(i => i.id);
}


