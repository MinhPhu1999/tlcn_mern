'use strict'
const product = require('../models/product.model');
const brandController = require('../controllers/brand.controller');
const categoryController = require('../controllers/category.controller');

exports.sortProduct = async(req, res)=>{
    let sapXep = req.params.inc;
    const listProduct = await product.find({status: true});
    const sortListProduct =  listProduct.sort(function(a, b) {
        if(sapXep == 'increase')
            return parseFloat(a.price) - parseFloat(b.price);
        return parseFloat(b.price) - parseFloat(a.price);
    });
    if(sortListProduct){
        res.status(200).json(sortListProduct);
        return;
    }
    res.status(404).json({msg: "product not found"});
}

exports.getProductByID = async(req, res) =>{
    let id = req.params.id;
    const productFind = await product.findOne({_id: id})
    if(productFind){
        res.status(200).json(productFind);
        return;
    }
    res.status(404).json({msg: "product not found"});
}

exports.getProduct = async(req,res)=>{
    const productFind = await product.find({status: true});
    if(productFind){
        res.status(200).json(productFind);
        return;
    }
    res.status(404).json({msg: "product not found"});
}

exports.searchProduct = async(req,res)=>{
    let searchText = "";
    if (typeof req.params.search !== 'undefined') {
        searchText = req.params.search;
    }
    const productFind = await product.find({ $or: [{ name: new RegExp(searchText, "i"), status:true }]});
    if(productFind){
        res.status(200).json(productFind);
        return;
    }
    res.status(404).json({msg: "product not found"});

}

exports.getProductByBrand = async(req, res) =>{
    let brandName = "";
    if (typeof req.params.brand !== 'undefined') 
        brandName = req.params.brand;

    let searchIDBrand = null;
    searchIDBrand= await brandController.getIDBySearchText(brandName);
   
    let productFind = await product.find({ $or: [{id_brand: new RegExp(searchIDBrand, "i")}]});
    if(productFind){
        res.status(200).json(productFind);
        return;
    }
    res.status(404).json({msg: "product not found"});

}

exports.getProductByCategory = async(req,res)=>{
    let categoryName = "";
    if (typeof req.params.category !== 'undefined') {
        categoryName = req.params.category;
    }

    let searchIDCatefory = null;
    searchIDCatefory= await categoryController.getIDBySearchText(categoryName);
    let productFind = await product.find({ $or: [{id_category: new RegExp(searchIDCatefory, "i")}]});
    if(productFind){
        res.status(200).json(productFind);
        return;
    }
    res.status(404).json({msg: "product not found"});
}

// exports.getProductByPrice = async(req, res) =>{
//     let giaTren = req.body.giaTren;
//     let giaDuoi = req.body.giaDuoi;
//     const productFind = product.find({price > giaTren})
// }

exports.getNameByID = async (req, res) => {
    if(req.params.id === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let result;
    let id = req.body.id;
    try {
        result = await product.findOne({_id:id});
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
    console.log(result)
    res.status(200).json({name: result.name, count: result.count})
}

