'usr strict'
const stock = require('../models/stock.model');

exports.getAll = async(req,res)=>{
    // if(typeof req.params.page === 'undefined'){
    //     res.status(402).json({msg:'Data Invalid'});
    //     return;
    // }
    let count = null;
    try{
        count = await stock.countDocuments({});
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
    stock.find({status:true})
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

exports.getDataByID = async(id_stock)=>{
    let result = null;
    try {
        result = await stock.findById(id_stock);
    }
    catch(err) {
        console.log(err);
        return;
    }
    if(result === null){
        console.log("user not found");
        return;
    }
    return [result.name_category, result.name_brand];
}