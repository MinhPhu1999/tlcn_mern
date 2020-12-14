// load  các models và thư viện cần thiết
const product = require('../models/product.model');
const category=require('../models/category.model');
const brand = require('../models/brand.model');
const user = require('../models/user.model');
const stock = require('../models/stock.model');
const stockController = require('../controllers/stock.controller')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cloudinary = require('cloudinary').v2; 

// product
cloudinary.config({ //set up cloudinary
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRECT
});

const uploadImg = async (path) => {
    let res;
    try {
        res = await cloudinary.uploader.upload(path); //upload ảnh lên cloudinary
    }
    catch(err) {
        return false;
    }
    return res.secure_url;
}

exports.addProduct = async (req, res) => {
    //kiểm tra có đủ tham số truyền vào hay không
    if(typeof req.file === 'undefined' 
    || typeof req.body.name === 'undefined' 
    || typeof req.body.id_category === 'undefined' 
    || typeof req.body.price === 'undefined' 
    || typeof req.body.id_brand === 'undefined' 
    || typeof req.body.description === 'undefined'
    || typeof req.body.color === 'undefined'
    || typeof req.body.size === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    const {name, id_category, price, id_brand, description, color, size, count} = req.body;//khai báo các tham số truyền vào
    let urlImg = await uploadImg(req.file.path);  //lấy đường dẫn hình ảnh
    
    if(urlImg === false) {
        res.status(500).send({message: 'khong upload duoc anh len cloudinary'});
        return;
    }

    const newProduct = new product({ //tạo mới product
        id_category:id_category,
        name: name,
        price: price,
        id_brand: id_brand,
        img: urlImg,
        description: description,
        color: color,
        size: size,
        count: count,
        status: true
    });
    try{
        await newProduct.save(); //lưu dữ liệu product vào mongo
    }
    catch(err) {
        res.status(500).send({message: 'add product fail'}); // thông báo nếu lưu thất bại
        return;
    }
    res.status(201).send({message: 'add product success'})
}

exports.updateProduct = async (req, res) => {
    // kiểm tra có đủ tham số truyền vào hay không
    if( typeof req.body.name === 'undefined' 
    || typeof req.body.id === 'undefined' 
    || typeof req.body.id_category === 'undefined' 
    || typeof req.body.price === 'undefined' 
    || typeof req.body.id_brand === 'undefined' 
    || typeof req.body.description === 'undefined'
    || typeof req.body.color === 'undefined'
    || typeof req.body.size === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { name, id, id_category, price, id_brand, description, status, color, size} = req.body; //khai báo các tham số
    let productFind = null;
    try {
        productFind = await product.findById(id); //tìm kiếm product bằng id
    }
    catch (err) {
        //console.log(err)
        res.status(500).send({message: err })
        return;
    }
    if (productFind === null) {
        res.status(404).send({message: "not found product" }); //thông báo nếu không tìm thấy
        return;
    }
    let urlImg = null;
    if(typeof req.file !== 'undefined' ) {
        urlImg = await uploadImg(req.file.path)
    }
    if(urlImg !== null) {
        if(urlImg === false) {
            res.status(500).send({message: 'not update image'});
            return;
        }
    }
    if(urlImg === null)
        urlImg = productFind.img; //thay hình cũ bằng hình mới
    
    //update product
    productFind.id_category = id_category;
    productFind.name = name;
    productFind.price = parseFloat(price)
    productFind.id_brand = id_brand;
    productFind.description = description;
    productFind.img = urlImg;
    productFind.color = color;
    productFind.size = size;
    productFind.status = status;
    
    productFind.save((err, docs) => { // lưu các thay đổi
        if (err) {
            console.log(err);
        }
    });
    // fs.unlink(req.file.path, (err) => {
    //     if (err) throw err;
    //     console.log('path/file.txt was deleted');
    //   });
    res.status(200).send({message: 'update product success', data: productFind }); //thông báo lưu thành công
}

exports.deleteProduct = async (req, res) => {
    //kiểm tra có truyền vào tham số id của sản phảm hay không
    if (typeof req.params.id === 'undefined') {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let productFind = null;
    productFind = await product.findById(req.params.id); //tìm kiếm sản phẩm bằng id
    if (productFind === null) {
        res.status(404).send({message: "not found product" }); //thông báo nếu không tìm thấy sản phẩm
        return;
    }
    productFind.status = false; //update lại status của sản phẩm, true là còn, false là đã xóa
    try {
        productFind.save(); //lưu các thay đổi
    }
    catch (err) {
        //console.log(err)
        res.status(500).send({message: err })
        return;
    }
    res.status(200).send({message: 'delete product success', });// thông báo xóa thành công
}

exports.getAllProduct = async(req,res)=>{
    // kiểm tra tham số truyền vào có hay không
    if(typeof req.params.page === 'undefined') {
        res.status(402).send({message: 'Data invalid'});
        return;
    }
    let count = null;
    try { 
        count = await product.countDocuments({});// đém sản phẩm có bao nhiêu
    }
    catch(err) {
        console.log(err);
        res.status(500).send({message: err});
        return;
    }
    let totalPage = parseInt(((count - 1) / 5) + 1); // từ số lượng sản phẩm sẽ tính ra số trang 
    let { page } = req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).send({ data: [], message: 'Invalid page', totalPage });
        return;
    }
    product.find({})
    .skip(5 * (parseInt(page) - 1))
    .limit(5) // giới hạn hiển thị sản phẩm mỗi trang
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({message: err });
                    return;
        }
        res.status(200).send({data: docs, totalPage});
    })
}

//stock
exports.addStock = async (req, res) => { 
    //kiểm tra các tham số truyền vào có đủ hay không
    if (typeof req.body.name_category === 'undefined'
        || typeof req.body.path === 'undefined'
        || typeof req.body.name_brand === 'undefined'
        || typeof req.body.count_import === 'undefined') {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { name_category,path, name_brand, count_import } = req.body; //khai cái tham số cần thiết
    let stockFind;
    try {
        stockFind = await stock.find({ 'name_category': name_category, 'name_brand':name_brand });//tìm kiếm tên category và tên brand
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (stockFind.length > 0) {//nếu độ dài lớn hơn 0 thì thông báo đã có trong database
        res.status(409).send({message: 'stock already exist' });
        return;
    }
    const newStock = new stock({  //tạo mới stock
        name_category: name_category,
        name_brand:name_brand,
        count_import:count_import,
        status:true });

    const newCategory = new category({ //tạo mới category 
        name: name_category,
        path: path,
        status: true
    });

    const newBrand = new brand({ // tạo mới brand
        name: name_brand,
        status: true
    });
    try {
        // lưu tất cả vào trong mongo
        await newStock.save();
        await newCategory.save();
        await newBrand.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'add stock success' });// thông báo thên thành công
}

exports.updateStock = async (req, res) => {
    // kiểm tra các tham số truyền vào có đủ hay không
    if (typeof req.body.id === 'undefined'
        || typeof req.body.name_category === 'undefined'
        || typeof req.body.path === 'undefined'
        || typeof req.body.name_brand === 'undefined'
        || typeof req.body.count_import === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { id, name_category, path, name_brand, count_import, status} = req.body;//khai báo tham số
    const getNameStock = await stockController.getDataByID(id); // lấy tên theo id
    let stockFind = null;
    let categoryFind = null;
    let brandFind = null;
    try {
        stockFind = await stock.findById(id);//tìm bằng id
        categoryFind = await category.findOne({name: getNameStock[0], status: true}); //tìm kiếm bằng tên và status là true
        brandFind = await brand.findOne({name: getNameStock[1], status: true});//tìm kiếm bằng tên và status là true
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (stockFind === null) {
        res.status(422).send({message: "stock not found" });
        return;
    }
    // update lại thông tin
    stockFind.name_category = name_category;
    
    stockFind.name_brand = name_brand;
    stockFind.count_import = count_import;
    stockFind.status = status;

    categoryFind.name = name_category;
    categoryFind.path = path;
    categoryFind.status = status;

    brandFind.name = name_brand;
    brandFind.status = status;
    try {
        //lưu các thay đổi vào mongo
        await stockFind.save();
        await categoryFind.save();
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'update stock success', stock: { name_category: name_category, name_brand: name_brand, count_import:count_import} });
}

exports.deleteStock = async(req,res)=>{
    //kiểm tra các tham số truyền vào có đủ hay không
    if (typeof req.params.id === "undefined") {
        res.status(402).send({message: "data invalid" });
        return;
    }
    let id = req.params.id; //khai báo tham số
    const getNameStock = await stockController.getDataByID(id); //tìm kiếm tên theo id
    let stockFind = null;
    let categoryFind = null;
    let brandFind = null;

    try {
        stockFind = await stock.findById(id);//tìm kiếm bằng id
        categoryFind = await category.findOne({name: getNameStock[0], status: true});//tìm kiếm bằng tên và status là true
        brandFind = await brand.findOne({name: getNameStock[1], status: true});//tìm kiếm bằng tên và status là true
    } catch (err) {
        console.log(err);
        res.status(500).send({message: "server found" });
        return;
    }
    if (brandFind === null) {
        res.status(400).send({message: "stock not found" });
        return;
    }
    //update lại status
    stockFind.status = false;
    categoryFind.status = false;
    brandFind.status = false;
    try {
        //lưu các thay đổi vào mongo
        await stockFind.save();
        await categoryFind.save();
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(200).send({message: "delete stock success" });//thông báo xóa thành công
}

exports.getAllStock = async(req,res)=>{
    // if(typeof req.params.page === 'undefined'){
    //     res.status(402).send({message:'Data Invalid'});
    //     return;
    // }
    let count = null;
    try{
        count = await stock.countDocuments({});
    }
    catch(err){
        console.log(err);
        res.status(500).send({message:err});
        return;
    }
    let totalPage = parseInt(((count-1)/9)+1);
    let {page}=req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).send({ data: [], message: 'Invalid page', totalPage });
        return;
    }
    stock.find({status:true})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({message: err });
                    return;
        }
        res.status(200).send({ data: docs, totalPage });
    })
}

exports.getStock = async(req,res)=>{
    stock.find({status:true}, (err, docs) => {
        if(err) {
            res.status(422).send({message:err});
            return;
        } 
        res.status(200).send({data:docs});
    })
}

//brand
exports.addBrand = async (req, res) => {
    if (typeof req.body.name === 'undefined') {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { name } = req.body;
    let brandFind = null;
    try {
        brandFind = await brand.find({ 'name': name });
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (brandFind.length > 0) {
        res.status(409).send({message: 'Brand already exist' });
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
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'add brand success', data:newBrand });
}

exports.updateBrand = async (req, res) => {
    if (typeof req.body.id === 'undefined'
        || typeof req.body.name === 'undefined') {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { id, name, status} = req.body;
    let brandFind;
    try {
        brandFind = await brand.findById(id);
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (brandFind === null) {
        res.status(422).send({message: "brand not found" });
        return;
    }
    brandFind.name = name;
    brandFind.status = status;
    try {
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'update brand success', brand: { name: name } });
}

exports.deleteBrand = async(req,res)=>{
    if (typeof req.params.id === "undefined") {
        res.status(402).send({message: "data invalid" });
        return;
    }
    let id=req.params.id;
    let brandFind = null;
    try {
        brandFind = await brand.findById(id);
    } catch (err) {
        console.log(err);
        res.status(500).send({message: "server found" });
        return;
    }
    if (brandFind === null) {
        res.status(400).send({message: "brand ot found" });
        return;
    }
    brandFind.status = false;
    try {
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(200).send({message: "delete brand success" });
}

exports.getAllBrand = async (req, res) => {
    if(typeof req.params.page === 'undefined') {
        res.status(402).send({message: 'Data invalid'});
        return;
    }
    let count = null;
    try { 
        count = await brand.countDocuments({})
    }
    catch(err) {
        console.log(err);
        res.status(500).send({message: err});
        return;
    }
    let totalPage = parseInt(((count - 1) / 5) + 1);
    let { page } = req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).send({ data: [], message: 'Invalid page', totalPage });
        return;
    }
    brand.find({status:true})
    .skip(5 * (parseInt(page) - 1))
    .limit(5)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({message: err });
                    return;
        }
        res.status(200).send({ data: docs, totalPage });
    });
}

// category
exports.addCategory = async (req, res) => {
    if (typeof req.body.name === 'undefined'
        || typeof req.body.path === 'undefined') {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { name, path } = req.body;
    let categoryFind;
    try {
        categoryFind = await category.find({ 'name': name, 'path':path });
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (categoryFind.length > 0) {
        res.status(409).send({message: 'category already exist' });
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
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'add category success' });
}

exports.updateCategory = async (req, res) => {
    if (typeof req.body.id === 'undefined'
        || typeof req.body.name === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { id, name, status} = req.body;
    let categoryFind = null;
    try {
        categoryFind = await category.findById(id);
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (categoryFind === null) {
        res.status(422).send({message: "category not found" });
        return;
    }
    categoryFind.name = name;
    categoryFind.status = status;
    try {
        await categoryFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'update category success', category: { name: name } });
}

exports.deleteCategory = async(req,res)=>{
    if (typeof req.params.id === "undefined") {
        res.status(402).send({message: "data invalid" });
        return;
    }
    let id = req.params.id;
    let categoryFind = null;
    try {
        categoryFind = await category.findById(id);
    } catch (err) {
        console.log(err);
        res.status(500).send({message: "server found" });
        return;
    }
    if (brandFind === null) {
        res.status(400).send({message: "category not found" });
        return;
    }
    categoryFind.status = false;
    try {
        await categoryFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(200).send({message: "delete category success" });
}

exports.getAllCategory=async(req,res)=>{
    if(typeof req.params.page === 'undefined'){
        res.status(402).send({message:'Data Invalid'});
        return;
    }
    let count = null;
    try{
        count = await category.countDocuments({});
    }
    catch(err){
        console.log(err);
        res.status(500).send({message:err});
        return;
    }
    let totalPage = parseInt(((count-1)/5)+1);
    let {page}=req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).send({ data: [], message: 'Invalid page', totalPage });
        return;
    }
    category.find({status:true})
    .skip(5 * (parseInt(page) - 1))
    .limit(5)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({message: err });
                    return;
        }
        res.status(200).send({ data: docs, totalPage });
    })
}


// user
exports.updateUser = async (req, res) => {
    if (typeof req.body.email === 'undefined'
        || typeof req.body.name === 'undefined'
        || typeof req.body.is_admin === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { email, name, is_admin, status} = req.body;
    let userFind;
    try {
        userFind = await user.findOne({ 'email': email })
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (userFind === null) {
        res.status(422).send({message: "user not found" });
        return;
    }
    userFind.name = name;
    userFind.is_admin = is_admin;
    userFind.status = status;
    try {
        await userFind.save()
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    res.status(200).send({
        message: 'update user success', user: {
            email: userFind.email,
            name: userFind.name,
            is_admin: userFind.is_admin
        }
    });
}

exports.deleteUser = async (req, res) => {
    if (typeof req.body.email === 'undefined') {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { email} = req.body;
    let userFind;
    try {
        userFind = await user.findOne({email: email})
    }
    catch(err) {
        res.status(500).send({message: err });
        return;
    }
    userFind.status = false;
    try{
        await userFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(200).send({message: 'delete user success'});
}

exports.addUser = async (req, res) => {
    if ((typeof req.body.email === 'undefined')
        || (typeof req.body.password === 'undefined')
        || typeof req.body.name === 'undefined'
        || typeof req.body.is_admin === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { email, password, name, is_admin } = req.body;
    if (email.indexOf("@")=== -1 && email.indexOf('.') === -1 
        || password.length < 6 ){
        res.status(422).send({message: 'Invalid data or password too short' });
        return;
    }
    let userFind = null;
    try {
        userFind = await user.find({ 'email': email });
    }
    catch (err) {
        res.status(500).send({message: err });
        console.log(1)
        return;
    }
    if (userFind.length > 0) {
        res.status(409).send({message: 'Email already exist' });
        return;
    }
    password = bcrypt.hashSync(password, 10);
    const newUser = new user({
        email: email,
        name: name,
        is_verify: true,
        password: password,
        is_admin: is_admin,
        status: true
    });
    try {
        await newUser.save();
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'add user success' });
}

exports.login = async (req, res) => {
    if(typeof req.body.email === 'undefined'
    || typeof req.body.password == 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }
    let { email, password } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email, 'is_admin': true});
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null){
        res.status(422).send({message: "user not found"});
        return;
    }

    if(!userFind.is_verify){
        res.status(401).send({message: 'no_registration_confirmation'});
        return;
    }
    
    if(!bcrypt.compareSync(password, userFind.password)){
        res.status(422).send({message: 'wrong password'});
        return;
    }
    let token = jwt.sign({email: email,  iat: Math.floor(Date.now() / 1000) - 60 * 30}, process.env.JWT_KEY);
    res.status(200).send({message: 'success', token: token, user: {
        email: userFind.email,
        name: userFind.name,
        id: userFind._id
    }});
}

exports.getUser = async(req,res)=>{
    user.find({status:true}, (err, docs) => {
        if(err) {
            console.log(err);
        } 
        res.status(200).send({data:docs});
    })
}

exports.getAllUser = async(req, res) => {
    if(typeof req.params.page === 'undefined') {
        res.status(402).send({message: 'Data invalid'});
        return;
    }
    let count = null;
    try { 
        count = await user.countDocuments({});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({message: err});
        return;
    }
    let totalPage = parseInt(((count - 1) / 9) + 1);
    let { page } = req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).send({ data: [], message: 'Invalid page', totalPage });
        return;
    }
    user.find({status: true})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({message: err });
                    return;
        }
        res.status(200).send({ data: docs, totalPage });
    })
}