const product = require('../models/product.model');
const brandController = require('../controllers/brand.controller');
const categoryController = require('../controllers/category.controller');

exports.sortProduct = async(req, res)=>{
    //khai báo các biến cần thiết
    let sapXep = req.params.inc;
    const listProduct = await product.find({status: true});
    const sortListProduct =  listProduct.sort(function(a, b) {
        if(sapXep == 'increase')
            return parseFloat(a.price) - parseFloat(b.price);//sắp xếp sản phẩm tăng dần theo giá
        return parseFloat(b.price) - parseFloat(a.price);//sắp xếp sản phẩm giảm dần theo giá
    });
    if(sortListProduct){
        res.status(200).send(sortListProduct);
        return;
    }
    res.status(404).send({message: "product not found"});
}

exports.getProductByID = async(req, res) =>{
    let id = req.params.id;
    const productFind = await product.findOne({_id: id})
    if(productFind){
        res.status(200).send(productFind);
        return;
    }
    res.status(404).send({message: "product not found"});
}

exports.getProduct = async(req,res)=>{
    if(typeof req.params.page === 'undefined') {
        res.status(402).send({message: 'Data invalid'});
        return;
    }
    let count = null;
    try { 
        count = await product.countDocuments({status: true});// đém sản phẩm có bao nhiêu
    }
    catch(err) {
        console.log(err);
        res.status(500).send({message: err});
        return;
    }
    let totalPage = parseInt(((count - 1) / 8) + 1); // từ số lượng sản phẩm sẽ tính ra số trang 
    let { page } = req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).send({ data: [], message: 'Invalid page', totalPage });
        return;
    }
    product.find({status: true})
    .skip(8 * (parseInt(page) - 1))
    .limit(8) // giới hạn hiển thị sản phẩm mỗi trang
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({message: err });
                    return;
        }
        res.status(200).send({data: docs, totalPage});
    })
}

exports.getAllProduct = async(req, res) =>{
    const productFind = await product.find({status: true});
    if(productFind){
        res.status(200).send(productFind);
        return;
    }
    res.status(404).send({message: "product not found"});
}

exports.searchProduct = async(req,res)=>{
    let searchText = "";
    console.log(typeof req.params.search);
    if (typeof req.params.search !== 'undefined') {
        searchText = req.params.search;
    }
    const productFind = await product.find({ $or: [{ name: new RegExp(searchText, "i"), status:true }]});
    if(productFind){
        res.status(200).send(productFind);
        return;
    }
    res.status(404).send({message: "product not found"});

}

exports.getProductByBrand = async(req, res) =>{
    let brandName = "";
    if (typeof req.params.brand !== 'undefined') 
        brandName = req.params.brand;

    let searchIDBrand = null;
    searchIDBrand= await brandController.getIDBySearchText(brandName);
   
    let productFind = await product.find({ $or: [{id_brand: new RegExp(searchIDBrand, "i")}]});
    if(productFind){
        res.status(200).send(productFind);
        return;
    }
    res.status(404).send({message: "product not found"});

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
        res.status(200).send(productFind);
        return;
    }
    res.status(404).send({message: "product not found"});
}


exports.getNameByID = async (req, res) => {
    if(req.params.id === 'undefined') {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let result;
    let id = req.body.id;
    try {
        result = await product.findOne({_id:id});
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
    console.log(result)
    res.status(200).send({name: result.name, count: result.count})
}

