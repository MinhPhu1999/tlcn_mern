'use strict'
const product = require('../models/product.model');
const category=require('../models/category.model');
const brand = require('../models/brand.model');
const user = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var cloudinary = require('cloudinary').v2;


// product
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
    productFind.status = false;
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

//brand
exports.addBrand = async (req, res) => {
    // if (typeof req.body.name === 'undefined') {
    //     res.status(422).json({ msg: 'Invalid data' });
    //     return;
    // }
    let { name } = req.body;
    let brandFind = null;
    try {
        brandFind = await brand.find({ 'name': name });
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (brandFind.length > 0) {
        res.status(409).json({ msg: 'Brand already exist' });
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
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'add brand success', data:newBrand });
}

exports.updateBrand = async (req, res) => {
    if (typeof req.body.id === 'undefined'
        || typeof req.body.name === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { id, name } = req.body;
    let brandFind;
    try {
        brandFind = await brand.findById(id);
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (brandFind === null) {
        res.status(422).json({ msg: "brand not found" });
        return;
    }
    brandFind.name = name;
    try {
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'update brand success', brand: { name: name } });
}

exports.deleteBrand = async(req,res)=>{
    if (typeof req.params.id === "undefined") {
        res.status(402).json({ msg: "data invalid" });
        return;
    }
    let id=req.params.id;
    let brandFind = null;
    try {
        brandFind = await brand.findById(id);
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "server found" });
        return;
    }
    if (brandFind === null) {
        res.status(400).json({ msg: "brand ot found" });
        return;
    }
    brandFind.status = false;
    try {
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(200).json({ msg: "delete brand success" });
}

exports.getBrand = async (req, res) => {
    brand.find({status:true}, (err, docs) => {
        if(err) {
            res.status(422).json({msg:err});
            return;
        }
        res.status(200).json({data:docs});
    })
}


// category
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
    res.status(200).json({ msg: "delete category success" });
}

exports.getCategory=(req,res)=>{
    category.find({status:true},(err,res)=>{
        if(err){
            res.status(422).json({msg:err});
            return;
        }
        res.status(200).json({data:docs});
    })
}

// user
exports.updateUser = async (req, res) => {
    if (typeof req.body.email === 'undefined'
        || typeof req.body.name === 'undefined'
        || typeof req.body.is_admin === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { email, name, is_admin } = req.body;
    let userFind;
    try {
        userFind = await user.findOne({ 'email': email })
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (userFind === null) {
        res.status(422).json({ msg: "user not found" });
        return;
    }
    userFind.firstName = name;
    userFind.is_admin = is_admin;
    try {
        await userFind.save()
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    res.status(200).json({
        msg: 'update user success', user: {
            email: userFind.email,
            name: userFind.name,
            is_admin: userFind.is_admin
        }
    });
}

exports.deleteUser = async (req, res) => {
    if (typeof req.body.email === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let userFind;
    try {
        userFind = await user.findOne({'email': req.body.email})
    }
    catch(err) {
        res.status(500).json({ msg: err });
        return;
    }
    userFind.status=false;
    try{
        await userFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(200).json({ msg: 'delete user success'});
}

exports.addUser = async (req, res) => {
    if ((typeof req.body.email === 'undefined')
        || (typeof req.body.password === 'undefined')
        || typeof req.body.name === 'undefined'
        || typeof req.body.is_admin === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { email, password, name, is_admin } = req.body;
    let userFind = null;
    try {
        userFind = await user.find({ 'email': email });
    }
    catch (err) {
        res.status(500).json({ msg: err });
        console.log(1)
        return;
    }
    if (userFind.length > 0) {
        res.status(409).json({ msg: 'Email already exist' });
        return;
    }
    password = bcrypt.hashSync(password, 10);
    const newUser = new user({
        email: email,
        name: name,
        is_verify: true,
        password: password,
        is_admin: is_admin,
        status:true
    });
    try {
        await newUser.save();
    }
    catch (err) {
        //console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'add user success' });
}

exports.login = async (req, res) => {
    if(typeof req.body.email === 'undefined'
    || typeof req.body.password == 'undefined'){
        res.status(402).json({msg: "Invalid data"});
        return;
    }
    let { email, password } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email, 'is_admin': true});
    }
    catch(err){
        res.json({msg: err});
        return;
    }
    if(userFind == null){
        res.status(422).json({msg: "user not found"});
        return;
    }

    if(!userFind.is_verify){
        res.status(401).json({msg: 'no_registration_confirmation'});
        return;
    }
    
    if(!bcrypt.compareSync(password, userFind.password)){
        res.status(422).json({msg: 'wrong password'});
        return;
    }
    let token = jwt.sign({email: email,  iat: Math.floor(Date.now() / 1000) - 60 * 30}, 'shhhhh');
    res.status(200).json({msg: 'success', token: token, user: {
        email: userFind.email,
        name: userFind.name,
        phone: userFind.phone,
        id: userFind._id
    }});
}

exports.getUser = async(req,res)=>{
    user.find({status:true}, (err, docs) => {
        if(err) {
            console.log(err);
        } 
        res.status(200).json({data:docs});
    })
}

exports.getAllUser = async(req, res) => {
    if(typeof req.params.page === 'undefined') {
        res.status(402).json({msg: 'Data invalid'});
        return;
    }
    let count = null;
    try { 
        count = await user.countDocuments({});
    }
    catch(err) {
        console.log(err);
        res.status(500).json({msg: err});
        return;
    }
    let totalPage = parseInt(((count - 1) / 9) + 1);
    let { page } = req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }
    user.find({})
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