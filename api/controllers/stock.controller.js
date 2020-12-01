'usr strict'
const stock = require('../models/stock.model');

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