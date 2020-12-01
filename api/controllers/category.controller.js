'use strict'
const category = require('../models/category.model');

exports.getCategory= async (req,res)=>{
    category.find({status:true},(err,res)=>{
        if(err){
            res.status(422).json({msg:err});
            return;
        }
        res.status(200).json({data:docs});
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


