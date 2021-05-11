// load  các models và thư viện cần thiết
const product = require('../models/product.model');
const category = require('../models/category.model');
const brand = require('../models/brand.model');
const user = require('../models/user.model');
const stock = require('../models/stock.model');
const image_product = require('../models/image_product');
const stockController = require('../controllers/stock.controller');
const bcrypt = require('bcrypt');
require('dotenv').config();
const cloudinary = require('../config/cloudinary');

const uploadImg = async path => {
    let res;
    try {
        res = await cloudinary.uploader.upload(path); //upload ảnh lên cloudinary
    } catch (err) {
        return false;
    }
    return res.secure_url;
};

exports.addProduct = async (req, res) => {
    //kiểm tra có đủ tham số truyền vào hay không
    if (
        typeof req.file === 'undefined' ||
        typeof req.body.name === 'undefined' ||
        typeof req.body.id_category === 'undefined' ||
        typeof req.body.price === 'undefined' ||
        typeof req.body.id_brand === 'undefined' ||
        typeof req.body.description === 'undefined' ||
        typeof req.body.quantity === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    const { name, id_category, price, id_brand, description, color, quantity } = req.body; //khai báo các tham số truyền vào
    let urlImg = await uploadImg(req.file.path); //lấy đường dẫn hình ảnh

    if (urlImg === false) {
        return res.status(500).send({
            message: 'khong upload duoc anh len cloudinary',
        });
    }

    const newProduct = new product({
        //tạo mới product
        id_category: id_category,
        name: name,
        price: price,
        id_brand: id_brand,
        img: urlImg,
        quantity: quantity,
        description: description,
        color: color,
    });
    newProduct.save((err, doc) => {
        if (err) return res.status(500).send({ message: err }); // thông báo nếu lưu thất bại
        res.status(201).send({ message: 'add product success' });
    });
};

exports.updateProduct = async (req, res) => {
    // kiểm tra có đủ tham số truyền vào hay không
    if (
        typeof req.body.name === 'undefined' ||
        typeof req.body.id === 'undefined' ||
        typeof req.body.id_category === 'undefined' ||
        typeof req.body.price === 'undefined' ||
        typeof req.body.id_brand === 'undefined' ||
        typeof req.body.description === 'undefined' ||
        typeof req.body.quantity === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }
    let { name, id, id_category, price, id_brand, description, color, status, quantity } = req.body; //khai báo các tham số
    let productFind = null;
    try {
        productFind = await product.findById(id); //tìm kiếm product bằng id
    } catch (err) {
        //console.log(err)
        return res.status(500).send({ message: err });
    }
    if (productFind === null) {
        return res.status(404).send({ message: 'not found product' }); //thông báo nếu không tìm thấy
    }
    let urlImg = null;
    if (typeof req.file !== 'undefined') {
        urlImg = await uploadImg(req.file.path);
    }
    if (urlImg !== null) {
        if (urlImg === false) {
            return res.status(500).send({ message: 'not update image' });
        }
    }
    if (urlImg === null) urlImg = productFind.img; //thay hình cũ bằng hình mới

    //update product
    productFind.id_category = id_category;
    productFind.name = name;
    productFind.price = parseFloat(price);
    productFind.id_brand = id_brand;
    productFind.description = description;
    productFind.img = urlImg;
    productFind.quantity = quantity;
    productFind.color = color;
    productFind.status = status;

    productFind.save((err, docs) => {
        // lưu các thay đổi
        if (err) {
            // console.log(err);
            return res.status(201).send({ message: 'update product fail' });
        }
    });
    res.status(200).send({
        message: 'update product success',
        data: productFind,
    }); //thông báo lưu thành công
};

exports.deleteProduct = async (req, res) => {
    product.updateOne({ _id: req.params.id }, { $set: { status: false } }).exec(error => {
        if (error) return res.status(400).send({ error });
        res.status(201).send('delete product success');
    });
};

exports.getAllProduct = async (req, res) => {
    // kiểm tra tham số truyền vào có hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    let count = null;

    try {
        count = await product.countDocuments({}); // đém sản phẩm có bao nhiêu
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }

    let totalPage = parseInt((count - 1) / 5 + 1); // từ số lượng sản phẩm sẽ tính ra số trang
    let { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    product
        .find({})
        .skip(5 * (parseInt(page) - 1))
        .limit(5) // giới hạn hiển thị sản phẩm mỗi trang
        .exec((err, docs) => {
            if (err) {
                // console.log(err);
                return res.status(500).send({ message: err });
            }
            res.status(200).send({ data: docs, totalPage });
        });
};

//stock
exports.addStock = async (req, res) => {
    //kiểm tra các tham số truyền vào có đủ hay không
    if (
        typeof req.body.name_category === 'undefined' ||
        typeof req.body.name_brand === 'undefined' ||
        typeof req.body.quantity === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    let { name_category, name_brand, quantity } = req.body; //khai cái tham số cần thiết
    let stockFind;

    try {
        stockFind = await stock.find({
            name_category: name_category,
            name_brand: name_brand,
        }); //tìm kiếm tên category và tên brand
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (stockFind.length > 0) {
        //nếu độ dài lớn hơn 0 thì thông báo đã có trong database
        return res.status(409).send({ message: 'stock already exist' });
    }

    const newStock = new stock({
        //tạo mới stock
        name_category: name_category,
        name_brand: name_brand,
        quantity: quantity,
        status: true,
    });

    const newCategory = new category({
        //tạo mới category
        name: name_category,
        path: path,
        status: true,
    });

    const newBrand = new brand({
        // tạo mới brand
        name: name_brand,
        status: true,
    });
    try {
        // lưu tất cả vào trong mongo
        await newStock.save();
        await newCategory.save();
        await newBrand.save();
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }
    res.status(201).send({ message: 'add stock success' }); // thông báo thên thành công
};

exports.updateStock = async (req, res) => {
    // kiểm tra các tham số truyền vào có đủ hay không
    if (
        typeof req.body.id === 'undefined' ||
        typeof req.body.name_category === 'undefined' ||
        typeof req.body.path === 'undefined' ||
        typeof req.body.name_brand === 'undefined' ||
        typeof req.body.quantity === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    let { id, name_category, path, name_brand, quantity, status } = req.body; //khai báo tham số
    const getNameStock = await stockController.getDataByID(id); // lấy tên theo id
    let stockFind = null;
    let categoryFind = null;
    let brandFind = null;

    try {
        stockFind = await stock.findById(id); //tìm bằng id
        categoryFind = await category.findOne({
            name: getNameStock[0],
            status: true,
        }); //tìm kiếm bằng tên và status là true
        brandFind = await brand.findOne({
            name: getNameStock[1],
            status: true,
        }); //tìm kiếm bằng tên và status là true
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    if (stockFind === null) {
        return res.status(422).send({ message: 'stock not found' });
    }
    // update lại thông tin
    stockFind.name_category = name_category;

    stockFind.name_brand = name_brand;
    stockFind.quantity = quantity;
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
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }
    res.status(201).send({
        message: 'update stock success',
        stock: {
            name_category: name_category,
            name_brand: name_brand,
            quantity: quantity,
        },
    });
};

exports.deleteStock = async (req, res) => {
    //kiểm tra các tham số truyền vào có đủ hay không
    if (typeof req.params.id === 'undefined') {
        return res.status(402).send({ message: 'data invalid' });
    }

    let id = req.params.id; //khai báo tham số
    const getNameStock = await stockController.getDataByID(id); //tìm kiếm tên theo id
    let stockFind = null;
    let categoryFind = null;
    let brandFind = null;

    try {
        stockFind = await stock.findById(id); //tìm kiếm bằng id
        categoryFind = await category.findOne({
            name: getNameStock[0],
            status: true,
        }); //tìm kiếm bằng tên và status là true
        brandFind = await brand.findOne({
            name: getNameStock[1],
            status: true,
        }); //tìm kiếm bằng tên và status là true
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: 'server found' });
    }
    if (brandFind === null) {
        return res.status(400).send({ message: 'stock not found' });
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
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }
    res.status(200).send({ message: 'delete stock success' }); //thông báo xóa thành công
};

exports.getAllStock = async (req, res) => {
    //kiểm tra có đủ tham số hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data Invalid' });
    }

    let count = null;
    try {
        count = await stock.countDocuments({}); //đém số lượng cho việc phân trang
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }

    let totalPage = parseInt((count - 1) / 9 + 1); //tính số trang cần phân chia
    let { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    stock
        .find() //lấy stock
        .skip(9 * (parseInt(page) - 1))
        .limit(9)
        .exec((err, docs) => {
            if (err) {
                // console.log(err);
                return res.status(500).send({ message: err });
            }
            res.status(200).send({ data: docs, totalPage });
        });
};

exports.getStock = async (req, res) => {
    stock.find({ status: true }, (err, docs) => {
        if (err) {
            return res.status(422).send({ message: err });
        }
        res.status(200).send({ data: docs });
    });
};

//brand
exports.addBrand = async (req, res) => {
    //kiểm tra có đủ tham số truyền vào hay không
    if (typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    let { name } = req.body; //khai báo biến
    let brandFind = null;

    try {
        brandFind = await brand.find({ name: name }); //tìm kiếm brand theo tên
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (brandFind.length > 0) {
        // trường hợp có brand
        return res.status(409).send({ message: 'Brand already exist' });
    }

    const newBrand = new brand({
        //tạo brand mới
        name: name,
    });

    try {
        await newBrand.save(); //lưu brand
    } catch (err) {
        // xuất ra lỗi
        // console.log(err);
        return res.status(500).send({ message: err });
    }
    res.status(201).send({ message: 'add brand success', data: newBrand }); // thông báo add brand thành công
};

exports.updateBrand = async (req, res) => {
    //kiểm tra có đủ tham số truyền vào hay không
    if (typeof req.body.id === 'undefined' || typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    let { id, name, status } = req.body; // khai báo biến
    let brandFind;

    try {
        brandFind = await brand.findById(id); //tìm kiếm brand theo id
    } catch (err) {
        return res.status(500).send({ message: err }); //xuất lỗi
    }

    if (brandFind === null) {
        //không tìm thấy brand thì xuất ra lỗi
        return res.status(422).send({ message: 'brand not found' });
    }

    //update các thông tin của brand
    brandFind.name = name;
    brandFind.status = status;
    try {
        await brandFind.save(); //lưu lại branđ đã thay đổi
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err }); //xuất lỗi
    }

    res.status(201).send({
        message: 'update brand success',
        brand: { name: name },
    }); //thông báo update brand thành công
};

exports.deleteBrand = async (req, res) => {
    brand.updateOne({ _id: req.params.id }, { $set: { status: false } }).exec(error => {
        if (error) return res.status(400).send({ error });
        res.status(201).send('delete brand success');
    });
};

exports.getAllBrand = async (req, res) => {
    //kiểm tra có truyền đủ tham số hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    let count = null; //khai báo biến
    try {
        count = await brand.countDocuments(); //đếm brand
    } catch (err) {
        //xuất lỗi
        // console.log(err);
        return res.status(500).send({ message: err });
    }

    let totalPage = parseInt((count - 1) / 5 + 1); //tính tổng số trang
    let { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }
    brand
        .find() //lấy brand
        .skip(5 * (parseInt(page) - 1))
        .limit(5)
        .exec((err, docs) => {
            if (err) {
                // console.log(err);
                return res.status(500).send({ message: err });
            }
            res.status(200).send({ data: docs, totalPage });
        });
};

// category
exports.addCategory = async (req, res) => {
    //kiểm tra có truyền đủ tham số hay không
    if (typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //khai báo biến
    let { name, path } = req.body;
    let categoryFind;

    try {
        categoryFind = await category.find({ name: name, path: path }); //tìm kiếm theo name và path
    } catch (err) {
        //xuất lỗi
        return res.status(500).send({ message: err });
    }

    if (categoryFind.length > 0) {
        //trường hợp tìm thấy category
        return res.status(409).send({ message: 'category already exist' });
    }

    const newCategory = new category({
        //nếu không thấy thì sẽ tiến hành thêm mới category
        name: name,
    });

    try {
        await newCategory.save(); //lưu category mới thêm vào database
    } catch (err) {
        //nếu không lưu được thì thông báo lỗi
        // console.log(err);
        return res.status(500).send({ message: err });
    }
    res.status(201).send({ message: 'add category success' }); //lưu được thì thông báo thêm mới thành công
};

exports.updateCategory = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.body.id === 'undefined' || typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //khai báo biến cần thiết
    let { id, name, status } = req.body;
    let categoryFind = null;

    try {
        categoryFind = await category.findById(id); //tiến hành tìm kiếm category theo id
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (categoryFind === null) {
        //trường hợp không có category trong cơ sở dữ liệu
        return res.status(422).send({ message: 'category not found' });
    }

    //tiến hành update các thông tin cho category
    categoryFind.name = name;
    categoryFind.status = status;

    try {
        await categoryFind.save(); //lưu các thay đổi
    } catch (err) {
        //xuất lỗi nếu không lưu được
        // console.log(err);
        return res.status(500).send({ message: err });
    }

    res.status(201).send({
        message: 'update category success',
        category: { name: name },
    }); //thông báo update thành công
};

exports.deleteCategory = async (req, res) => {
    category.updateOne({ _id: req.params.id }, { $set: { status: false } }).exec(error => {
        if (error) return res.status(400).send({ error });
        res.status(201).send('delete product success');
    });
};

exports.getAllCategory = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data Invalid' });
    }

    //khai báo biến cần thiết
    let count = null;
    try {
        count = await category.countDocuments(); //đém category
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }

    let totalPage = parseInt((count - 1) / 5 + 1); //tính số trang
    let { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    category
        .find() //get category them status = true
        .skip(5 * (parseInt(page) - 1))
        .limit(5)
        .exec((err, docs) => {
            if (err) {
                // console.log(err);
                return res.status(500).send({ message: err });
            }
            res.status(200).send({ data: docs, totalPage });
        });
};

// user
exports.updateUser = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.body.email === 'undefined' || typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //khai báo biến cần thiết
    let { email, name, status } = req.body;
    let userFind;

    try {
        userFind = await user.findOne({ email: email, is_admin: true }); //tiến hành tìm kiếm user theo email
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (userFind === null) {
        //trường hợp không có user trong cơ sở dữ liệu
        return res.status(422).send({ message: 'user not found' });
    }

    //update thông tin cho user
    userFind.name = name;
    userFind.status = status;

    try {
        await userFind.save(); //lưu lại các thay đổi
    } catch (err) {
        //xuất lỗi nếu không lưu lại được
        return res.status(500).send({ message: err });
    }

    //thông báo update thành công
    res.status(200).send({
        message: 'update user success',
        user: {
            email: userFind.email,
            name: userFind.name,
        },
    });
};

exports.deleteUser = async (req, res) => {
    user.updateOne({ _id: req.params.id }, { $set: { status: false } }).exec(error => {
        if (error) return res.status(400).send({ error });
        res.status(201).send('delete product success');
    });
};

exports.addUser = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.email === 'undefined' ||
        typeof req.body.password === 'undefined' ||
        typeof req.body.name === 'undefined' ||
        typeof req.body.is_admin === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //khai báo biến cần thiết
    let { email, password, name, is_admin } = req.body;
    let userFind = null;

    //kiểm tra email có hợp lệ không, password phải trên 6 kí tự
    if ((email.indexOf('@') === -1 && email.indexOf('.') === -1) || password.length < 6) {
        res.status(422).send({ message: 'Invalid data or password too short' });
    }

    try {
        userFind = await user.find({ email: email }); //tiến hành tìm kiếm user theo email
    } catch (err) {
        return res.status(500).send({ message: err });
        // console.log(1);
    }
    if (userFind.length > 0) {
        //trường hợp đã có user trong cơ sở dữ liệu
        return res.status(409).send({ message: 'Email already exist' });
    }

    password = bcrypt.hashSync(password, 10); //hash password
    const newUser = new user({
        //tạo mới user để thêm vào databasr
        email: email,
        name: name,
        is_verify: true,
        password: password,
        is_admin: is_admin,
    });

    try {
        await newUser.save().then(function () {
            newUser.generateJWT(); //tạo token
        }); //lưu user vào database
    } catch (err) {
        //xuất lỗi nếu không lưu lại được
        return res.status(500).send({ message: err });
    }
    res.status(201).send({ message: 'add user success' }); //thông báo thêm thành công
};

exports.login = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.body.email === 'undefined' || typeof req.body.password == 'undefined') {
        return res.status(402).send({ message: 'Invalid data' });
    }

    //khai báo biến cần thiết
    let { email, password } = req.body;
    let userFind = null;

    try {
        userFind = await user.findOne({ email: email, is_admin: true }); //tiến hành tìm kiếm user theo email và is_admin
    } catch (err) {
        return res.send({ message: err });
    }

    if (userFind == null) {
        //trường hợp không có user trong cơ sở dữ liệu
        return res.status(422).send({ message: 'user not found' });
    }

    if (!userFind.is_verify) {
        //trường hợp chưa verify
        return res.status(401).send({ message: 'no_registration_confirmation' });
    }

    if (!bcrypt.compareSync(password, userFind.password)) {
        //trường hợp sai mật khẩu
        return res.status(422).send({ message: 'wrong password' });
    }
    //tạo token cho user khi đăng nhập
    userFind.generateJWT();
    //thông báo đăng nhập thành công
    res.status(200).send({
        message: 'success',
        token: userFind.token,
        user: {
            email: userFind.email,
            name: userFind.name,
            id: userFind._id,
        },
    });
};

exports.getUser = async (req, res) => {
    //get toàn bộ user
    user.find({ status: true }, (err, docs) => {
        if (err) {
            return res.send({ message: err });
        }
        res.status(200).send({ data: docs });
    });
};

exports.getAllUser = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    //khai báo biến cần thiết
    let count = null;

    try {
        count = await user.countDocuments({ is_admin: true }); //đếm admin
    } catch (err) {
        // console.log(err);
        return res.status(500).send({ message: err });
    }

    let totalPage = parseInt((count - 1) / 9 + 1); //tính số trang
    let { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    //get user
    user.find({ is_admin: true })
        .skip(9 * (parseInt(page) - 1))
        .limit(9)
        .exec((err, docs) => {
            if (err) {
                // console.log(err);
                return res.status(500).send({ message: err });
            }
            res.status(200).send({ data: docs, totalPage });
        });
};
