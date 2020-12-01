'use strict'
const product = require('../models/product.model');
const brandController = require('../controllers/brand.controller');
const categoryController = require('../controllers/category.controller');

exports.getProduct = async(req,res)=>{

    const productFind = await product.find({status: true});
    if(productFind)
    {
        res.status(200).json(productFind);
    }
    else{
        res.status(404).json({msg: "product not found"})
    }
}

exports.getProductByID = async(req, res) =>{
    let id = req.params.id;
    const productFind = await product.findOne({_id: id})
    if(productFind)
    {
        res.status(200).json(productFind);
    }
    else{
        res.status(404).json({msg: "product not found"})
        return;
    }
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
    //     productCount = await product.countDocuments({ $or: [{ name: new RegExp(searchText, "i") }] });
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
        brandCount = await product.countDocuments({ id_brand: new RegExp(searchIDBrand, "i")});
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
        console.log(docs);
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
        categoryCount = await product.countDocuments({ id_category: new RegExp(searchIDCatefory)});//, "i"
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

