'use strict'
const product = require('../models/product.model');
const brandController = require('../controllers/brand.controller');
const categoryController = require('../controllers/category.controller');
const category=require('../models/category.model');
const brand = require('../models/brand.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const bcrypt = require('bcrypt');
var cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dpa6e5lwv',
    api_key: '319431445471854',
    api_secret: 'k4z82XS4CbAVrLubmo_kFbS3A4I'
});

const uploadImg = async (path) => {
    let res;
    try {
        res = await cloudinary.uploader.upload(path);
    }
    catch(err) {
        return false;
    }
    return res.secure_url;
}

exports.addProduct = async (req, res) => {
    if(typeof req.file === 'undefined' 
    || typeof req.body.name === 'undefined' 
    || typeof req.body.id_category === 'undefined' 
    || typeof req.body.price === 'undefined' 
    || typeof req.body.id_brand === 'undefined' 
    || typeof req.body.description === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    //console.log(req.body);
    const {name, id_category, price, id_brand, description} = req.body;
    let urlImg = await uploadImg(req.file.path);
    
    if(urlImg === false) {
        res.status(500).json({msg: 'khong upload duoc anh len cloudinary'});
        return;
    }
    const newProduct = new product({
        id_category:id_category,
        name: name,
        price: price,
        id_brand: id_brand,
        img: urlImg,
        description: description,
        countInStock:1,
        rating:5,
        numReviews:2,
        status:true
    });
    try{
        newProduct.save();
    }
    catch(err) {
        res.status(500).json({msg: 'add product fail'});
        return;
    }
    res.status(201).json({msg: 'add product success'})
}

exports.updateProduct = async (req, res) => {
    if( typeof req.body.name === 'undefined' 
    || typeof req.body.id === 'undefined' 
    || typeof req.body.id_category === 'undefined' 
    || typeof req.body.price === 'undefined' 
    || typeof req.body.id_brand === 'undefined' 
    || typeof req.body.description === 'undefined'
    || typeof req.body.status === "undefined" 
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { name, id, id_category, price, id_brand, description} = req.body;
    let productFind = null;
    try {
        productFind = await product.findById(id);
    }
    catch (err) {
        //console.log(err)
        res.status(500).json({ msg: err })
        return;
    }
    if (productFind === null) {
        res.status(404).json({ msg: "not found product" });
        return;
    }
    let urlImg = null;
    if(typeof req.file !== 'undefined' ) {
        urlImg = await uploadImg(req.file.path)
    }
    if(urlImg !== null) {
        if(urlImg === false) {
            res.status(500).json({msg: 'not update image'});
            return;
        }
    }
    if(urlImg === null)
        urlImg = productFind.img;
    
    productFind.id_category = id_category;
    productFind.name = name;
    productFind.price = parseFloat(price)
    productFind.id_brand = id_brand;
    productFind.description = description;
    productFind.img = urlImg;
    productFind.save((err, docs) => {
        if (err) {
            console.log(err);
        }
    });
    // fs.unlink(req.file.path, (err) => {
    //     if (err) throw err;
    //     console.log('path/file.txt was deleted');
    //   });
    res.status(200).json({ msg: 'update product success', data: productFind });
}

exports.deleteProduct = async (req, res) => {
    if (typeof req.params.id === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let productFind = null;
    productFind = await product.findById(req.params.id);
    if (productFind === null) {
        res.status(404).json({ msg: "not found product" });
        return;
    }
    productFind.status=false;
    try {
        productFind.save();
    }
    catch (err) {
        //console.log(err)
        res.status(500).json({ msg: err })
        return;
    }
    res.status(200).json({ msg: 'delete product success', });
}

exports.getProduct = async(req,res)=>{
    product.find({status:true}, (err, docs) => {
        if(err) {
            res.status(422).json({msg:err});
            return;
        } 
        res.status(200).json({data:docs});
    })
}

exports.getAllProduct=async(req,res)=>{
    // if(typeof req.params.page === 'undefined') {
    //     res.status(402).json({msg: 'Data invalid'});
    //     return;
    // }
    let count = null;
    try { 
        count = await product.count({});
    }
    catch(err) {
        console.log(err);
        res.status(500).json({msg: err});
        return;
    }
    //console.log(count);
    let totalPage = parseInt(((count - 1) / 9) + 1);
    let { page } = req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }
    product.find({status:true})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({ msg: err });//.json
                    return;
        }
        res.status(200).send({data:docs});//json data: docs, totalPage
    })
}

exports.searchProduct = async(req,res)=>{
    let searchText = "";
    if (typeof req.body.searchtext !== 'undefined') {
        searchText = req.body.searchtext;
    }
    product.find({ $or: [{ name: new RegExp(searchText, "i"), status:true }]}, (err, docs) => {
        if(err) {
            res.status(422).json({msg:err});
            return;
        }
        res.status(200).json({data:docs});
    })

    // if ((typeof req.body.page === 'undefined')) {
    //     res.status(422).json({ msg: 'Invalid data' });
    //     return;
    // }
    // let searchText = "";
    // if (typeof req.body.searchtext !== 'undefined') {
    //     searchText = req.body.searchtext;
    // }

    // let productCount = null;
    // try {
    //     productCount = await product.count({ $or: [{ name: new RegExp(searchText, "i") }] });
    // }
    // catch (err) {
    //     res.status(500).json({ msg: err });
    //     return;
    // }
    // let totalPage = parseInt(((productCount - 1) / 9) + 1);
    // let { page } = req.body;
    // if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
    //     res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
    //     return;
    // }

    // product.find({ $or: [{ name: new RegExp(searchText, "i") }]})
    //     .skip(9 * (parseInt(page) - 1))
    //     .limit(9)
    //     .exec((err, docs) => {
    //         if (err) {
    //             console.log(err);
    //             res.status(500).json({ msg: err });
    //             return;
    //         }
    //         res.status(200).json({ data: docs, totalPage });
    // });
}

exports.getProductByBrand = async(req,res)=>{
    // if ((typeof req.body.page === 'undefined')) {
    //     res.status(422).json({ msg: 'Invalid data' });
    //     return;
    // }

     //Search Text
    let brandName = "";
    if (typeof req.body.brandname !== 'undefined') {
        brandName = req.body.brandname;
    }

    let searchIDBrand = null;
    searchIDBrand= await brandController.getIDBySearchText(brandName);
   
    let brandCount = null;
    try{
        brandCount = await product.count({ id_brand: new RegExp(searchIDBrand, "i")});
    }
    catch(err)
    {
        res.status(500).json({msg : err});
        return;
    }

    let totalPage = parseInt(((brandCount - 1) / 9) + 1);
    let { page } = req.body;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }

    product.find({ $or: [{id_brand: new RegExp(searchIDBrand, "i")}]})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if (err) {
            console.log(err);
            res.status(500).json({ msg: err });
            return;
        }
        //console.log(docs.price);
        res.status(200).json({ data: docs, totalPage });
    });

}

exports.getProductByCategory = async(req,res)=>{
    // if ((typeof req.body.page === 'undefined')) {
    //     res.status(422).json({ msg: 'Invalid data' });
    //     return;
    // }

     //Search Text
    let categoryName = "";
    if (typeof req.body.categoryname !== 'undefined') {
        categoryName = req.body.categoryname;
    }

    let searchIDCatefory = null;
    searchIDCatefory= await categoryController.getIDBySearchText(categoryName);
    console.log(searchIDCatefory);
    let categoryCount = null;
    try{
        categoryCount = await product.count({ id_category: new RegExp(searchIDCatefory)});//, "i"
    }
    catch(err)
    {
        res.status(500).json({msg : err});
        return;
    }

    let totalPage = parseInt(((categoryCount - 1) / 9) + 1);
    let { page } = req.body;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }


    product.find({ $or: [{id_category: new RegExp(searchIDCatefory)}]})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if (err) {
            console.log(err);
            res.status(500).json({ msg: err });
            return;
        }
        res.status(200).json({ data: docs, totalPage }); 
    });

}

exports.getNameByID = async (req, res) => {
    if(req.params.id === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let result
    try {
        result = await product.findById(req.params.id);
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

