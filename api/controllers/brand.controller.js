'use strict'
const brand = require('../models/brand.model');
exports.getBrand = async (req, res) => {
    brand.find({status:true}, (err, docs) => {
        if(err) {
            res.status(422).json({msg:err});
            return;
        } 
        //console.log(typeof docs);
        res.status(200).json({data:docs});
    })
}

exports.getAll = async (req, res) => {



    // if(typeof req.params.page === 'undefined') {
    //     res.status(402).json({msg: 'Data invalid'});
    //     return;
    // }
    // let count = null;
    // try { 
    //     count = await brand.count({})
    // }
    // catch(err) {
    //     console.log(err);
    //     res.status(500).json({msg: err});
    //     return;
    // }
    // let totalPage = parseInt(((count - 1) / 9) + 1);
    // let { page } = req.params;
    // if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
    //     res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
    //     return;
    // }
    // brand.find({status:true})
    // .skip(9 * (parseInt(page) - 1))
    // .limit(9)
    // .exec((err, docs) => {
    //     if(err) {
    //         console.log(err);
    //                 res.status(500).json({ msg: err });
    //                 return;
    //     }
    //     res.status(200).json({ data: docs, totalPage });
    // });
}

exports.getNameByID = async (req, res) => {
    if(req.params.id === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let result
    try {
        result = await brand.findById(req.params.id);
    }
    catch(err) {
        console.log(err)
        res.status(500).json({msg: err})
        return;
    }
    if(result === null){
        res.status(404).json({msg: "not found"})
        return;
    }
    res.status(200).json({name: result.name})
}

exports.getIDBySearchText = async (searchText) => {
    let arr = [];
    try {
        arr = await brand.find({name: new RegExp(searchText, "i")});
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    return arr.map(i => i.id);
}

exports.addBrand = async (req, res) => {
    if (typeof req.body.name === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { name } = req.body;
    let brandFind = null;
    try {
        brandFind = await brand.find({ 'name': name });
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (brandFind.length > 0) {
        res.status(409).json({ msg: 'Brand already exist' });
        return;
    }
    const newBrand = new brand({ 
        name: name,
        status:true });
    try {
        await newBrand.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'success', data:newBrand });
}

exports.updateBrand = async (req, res) => {
    if (typeof req.body.id === 'undefined'
        || typeof req.body.name === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { id, name } = req.body;
    let brandFind;
    try {
        brandFind = await brand.findById(id);
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (brandFind === null) {
        res.status(422).json({ msg: "not found" });
        return;
    }
    brandFind.name = name;
    try {
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'success', brand: { name: name } });
}

exports.deleteBrand = async(req,res)=>{
    if (typeof req.params.id === "undefined") {
        res.status(402).json({ msg: "data invalid" });
        return;
    }
    let id=req.params.id;
    let brandFind = null;
    try {
        brandFind = await brand.findById(id);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "server found" });
        return;
    }
    if (brandFind === null) {
        res.status(400).json({ msg: "Not Found" });
        return;
    }
    brandFind.status = false;
    try {
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(200).json({ msg: "success" });
}
