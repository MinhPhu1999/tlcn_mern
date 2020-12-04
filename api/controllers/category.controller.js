'use strict'
const category = require('../models/category.model');

exports.getCategory= async (req,res)=>{
    category.find({status:true},(err,res)=>{
        if(err){
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
    let result = null;
    try {
        result = await category.findById(req.params.id);
    }
    catch(err) {
        console.log(err);
        res.status(500).send({message: err});
        return;
    }
    if(result === null){
        res.status(404).send({message: "category not found"});
        return;
    }
    res.status(200).send({name: result.name});
}  

exports.getIDBySearchText = async (searchText) => {
    let arr = [];
    try {
        arr = await category.find({name: new RegExp(searchText)});//, "i",{name: 0}
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    return arr.map(i => i.id);
}


