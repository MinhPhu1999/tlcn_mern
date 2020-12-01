'use strict'
const product = require('../models/product.model');
const category=require('../models/category.model');
const brand = require('../models/brand.model');
const user = require('../models/user.model');
const stock = require('../models/stock.model');
const stockController = require('../controllers/stock.controller')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { count } = require('../models/product.model');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// product
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRECT
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
    || typeof req.body.color === 'undefined'
    || typeof req.body.size === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    const {name, id_category, price, id_brand, description, color, size, count} = req.body;
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
        color: color,
        size: size,
        count: count,
        status: true
    });
    try{
        await newProduct.save();
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
    || typeof req.body.color === 'undefined'
    || typeof req.body.size === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { name, id, id_category, price, id_brand, description, status, color, size} = req.body;
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
    productFind.color = color;
    productFind.size = size;
    productFind.status = status;
    
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

exports.getAllProduct = async(req,res)=>{
    if(typeof req.params.page === 'undefined') {
        res.status(402).json({msg: 'Data invalid'});
        return;
    }
    let count = null;
    try { 
        count = await product.countDocuments({});
    }
    catch(err) {
        console.log(err);
        res.status(500).json({msg: err});
        return;
    }
    let totalPage = parseInt(((count - 1) / 5) + 1);
    let { page } = req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }
    product.find({})
    .skip(5 * (parseInt(page) - 1))
    .limit(5)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).json({ msg: err });
                    return;
        }
        res.status(200).json({data: docs, totalPage});
    })
}

//stock
exports.addStock = async (req, res) => {
    if (typeof req.body.name_category === 'undefined'
        || typeof req.body.path === 'undefined'
        || typeof req.body.name_brand === 'undefined'
        || typeof req.body.count_import === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { name_category,path, name_brand, count_import } = req.body;
    let stockFind;
    try {
        stockFind = await stock.find({ 'name_category': name_category, 'name_brand':name_brand });
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (stockFind.length > 0) {
        res.status(409).json({ msg: 'stock already exist' });
        return;
    }
    const newStock = new stock({ 
        name_category: name_category,
        name_brand:name_brand,
        count_import:count_import,
        status:true });

    const newCategory = new category({
        name: name_category,
        path: path,
        status: true
    });

    const newBrand = new brand({
        name: name_brand,
        status: true
    });
    try {
        await newStock.save();
        await newCategory.save();
        await newBrand.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'add stock success' });
}

exports.updateStock = async (req, res) => {
    if (typeof req.body.id === 'undefined'
        || typeof req.body.name_category === 'undefined'
        || typeof req.body.path === 'undefined'
        || typeof req.body.name_brand === 'undefined'
        || typeof req.body.count_import === 'undefined'
    ) {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
    let { id, name_category, path, name_brand, count_import, status} = req.body;
    const getNameStock = await stockController.getDataByID(id);
    let stockFind = null;
    let categoryFind = null;
    let brandFind = null;
    try {
        stockFind = await stock.findById(id);
        categoryFind = await category.findOne({name: getNameStock[0], status: true});
        brandFind = await brand.findOne({name: getNameStock[1], status: true});
    }
    catch (err) {
        res.status(500).json({ msg: err });
        return;
    }
    if (stockFind === null) {
        res.status(422).json({ msg: "stock not found" });
        return;
    }
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
        await stockFind.save();
        await categoryFind.save();
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(201).json({ msg: 'update stock success', stock: { name_category: name_category, name_brand: name_brand, count_import:count_import} });
}

exports.deleteStock = async(req,res)=>{
    if (typeof req.params.id === "undefined") {
        res.status(402).json({ msg: "data invalid" });
        return;
    }
    let id = req.params.id;
    const getNameStock = await stockController.getDataByID(id);
    let stockFind = null;
    let categoryFind = null;
    let brandFind = null;

    try {
        stockFind = await stock.findById(id);
        categoryFind = await category.findOne({name: getNameStock[0], status: true});
        brandFind = await brand.findOne({name: getNameStock[1], status: true});
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "server found" });
        return;
    }
    if (brandFind === null) {
        res.status(400).json({ msg: "stock not found" });
        return;
    }
    stockFind.status = false;
    categoryFind.status = false;
    brandFind.status = false;
    try {
        await stockFind.save();
        await categoryFind.save();
        await brandFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ msg: err });
        return;
    }
    res.status(200).json({ msg: "delete stock success" });
}

exports.getAllStock = async(req,res)=>{
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

exports.getStock = async(req,res)=>{
    stock.find({status:true}, (err, docs) => {
        if(err) {
            res.status(422).json({msg:err});
            return;
        } 
        res.status(200).json({data:docs});
    })
}

//brand
exports.addBrand = async (req, res) => {
    if (typeof req.body.name === 'undefined') {
        res.status(422).json({ msg: 'Invalid data' });
        return;
    }
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
    let { id, name, status} = req.body;
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
    brandFind.status = status;
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

exports.getAllBrand = async (req, res) => {
    if(typeof req.params.page === 'undefined') {
        res.status(402).json({msg: 'Data invalid'});
        return;
    }
    let count = null;
    try { 
        count = await brand.countDocuments({})
    }
    catch(err) {
        console.log(err);
        res.status(500).json({msg: err});
        return;
    }
    let totalPage = parseInt(((count - 1) / 5) + 1);
    let { page } = req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }
    brand.find({status:true})
    .skip(5 * (parseInt(page) - 1))
    .limit(5)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).json({ msg: err });
                    return;
        }
        res.status(200).json({ data: docs, totalPage });
    });
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
        categoryFind = await category.find({ 'name': name, 'path':path });
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
    let { id, name, status} = req.body;
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
    categoryFind.status = status;
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

exports.getAllCategory=async(req,res)=>{
    if(typeof req.params.page === 'undefined'){
        res.status(402).json({msg:'Data Invalid'});
        return;
    }
    let count = null;
    try{
        count = await category.countDocuments({});
    }
    catch(err){
        console.log(err);
        res.status(500).json({msg:err});
        return;
    }
    let totalPage = parseInt(((count-1)/5)+1);
    let {page}=req.params;
    if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
        res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
        return;
    }
    category.find({status:true})
    .skip(5 * (parseInt(page) - 1))
    .limit(5)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).json({ msg: err });
                    return;
        }
        res.status(200).json({ data: docs, totalPage });
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
    let { email, name, is_admin, status} = req.body;
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
    userFind.name = name;
    userFind.is_admin = is_admin;
    userFind.status = status;
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
    let { email} = req.body;
    let userFind;
    try {
        userFind = await user.findOne({email: email})
    }
    catch(err) {
        res.status(500).json({ msg: err });
        return;
    }
    userFind.status = false;
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
    if (email.indexOf("@")=== -1 && email.indexOf('.') === -1 
        || password.length < 6 ){
        res.status(422).json({ msg: 'Invalid data or password too short' });
        return;
    }
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
        status: true
    });
    try {
        await newUser.save();
    }
    catch (err) {
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
    user.find({status: true})
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