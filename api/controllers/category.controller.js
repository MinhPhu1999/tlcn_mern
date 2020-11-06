'use strict'
const category = require('../models/category.model');
exports.getCategory=(req,res)=>{
    category.find({status:true},(err,res)=>{
        if(err){
            res.status(422).json({msg:err});
            return;
        }
        res.status(200).json({data:docs});
    })
}


exports.getAll=async(req,res)=>{
    // if(typeof req.params.page === 'undefined'){
    //     res.status(402).json({msg:'Data Invalid'});
    //     return;
    // }
    let count = null;
    try{
        count = await category.count({});
    }
    catch(err){
        console.log(err);
        res.status(500).json({msg:err});
        return;
    }
    let totalPage = parseInt(((count-1)/9)+1);
    let {page}=req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }
    category.find({status:true})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).json({ msg: err });
                    return;
        }
        res.status(200).json({ data: docs, totalPage });
    })
}

exports.getNameByID = async (req, res) => {
    if(req.params.id === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let result = null;
    try {
        result = await category.findById(req.params.id);
    }
    catch(err) {
        console.log(err);
        res.status(500).json({msg: err});
        return;
    }
    if(result === null){
        res.status(404).json({msg: "category not found"});
        return;
    }
    res.status(200).json({name: result.name});
}  

exports.getIDBySearchText = async (searchText) => {
    let arr = [];
    try {
        arr = await category.find({name: new RegExp(searchText)});//, "i",{name: 0}
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    return arr.map(i => i.id);
}

exports.addCategory = async (req, res) => {
    if (typeof req.body.name === 'undefined'
        || typeof req.body.path === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { name, path } = req.body;
    let categoryFind;
    try {
        categoryFind = await category.find({ 'name': name });
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (categoryFind.length > 0) {
        res.status(409).json({ msg: 'category already exist' });
        return;
    }
    const newCategory = new category({ 
        name: name,
        path:path,
        status:true });
    try {
        await newCategory.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'add category success' });
}

exports.updateCategory = async (req, res) => {
    if (typeof req.body.id === 'undefined'
        || typeof req.body.name === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { id, name } = req.body;
    let categoryFind = null;
    try {
        categoryFind = await category.findById(id);
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (categoryFind === null) {
        res.status(422).json({ msg: "category not found" });
        return;
    }
    categoryFind.name = name;
    try {
        await categoryFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'update category success', category: { name: name } });
}

exports.deleteCategory = async(req,res)=>{
    if (typeof req.params.id === "undefined") {
        res.status(402).json({ msg: "data invalid" });
        return;
    }
    let id = req.params.id;
    let categoryFind = null;
    try {
        categoryFind = await category.findById(id);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "server found" });
        return;
    }
    if (brandFind === null) {
        res.status(400).json({ msg: "category not found" });
        return;
    }
    categoryFind.status = false;
    try {
        await categoryFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(200).json({ msg: "delete success" });
}

