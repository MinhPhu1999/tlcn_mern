// load  các models và thư viện cần thiết
const product = require('../models/product.model');
const category = require('../models/category.model');
const brand = require('../models/brand.model');
const user = require('../models/user.model');
const stock = require('../models/stock.model');
const size = require('../models/size.model');
const color = require('../models/color.model');
const size_product = require('../models/size_product');
const color_product = require('../models/color_product');

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
        typeof req.files === 'undefined' ||
        typeof req.body.name === 'undefined' ||
        typeof req.body.id_category === 'undefined' ||
        typeof req.body.price === 'undefined' ||
        typeof req.body.id_brand === 'undefined' ||
        typeof req.body.description === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    req.body.sizeProduct = JSON.parse(req.body.sizeProduct);
    req.body.colorProduct = JSON.parse(req.body.colorProduct);

    const { name, id_category, id_brand, quantity, price, description, sizeProduct, colorProduct } =
        req.body;

    let urls = [];
    let id_product;
    const files = req.files;

    for (const file of files) {
        const { path } = file;
        const result = await uploadImg(path);
        urls.push(result);
    }

    const nColor = new color_product({ colorProduct });
    const nSize = new size_product({ sizeProduct });

    const nProduct = new product({
        name,
        id_category,
        id_brand,
        images: urls,
        description,
        price,
        quantity,
    });

    const sP = await nProduct.save((err, docProduct) => {
        if (docProduct) id_product = docProduct._id;
    });

    const sS = await nSize.save(async (err, doc) => {
        if (doc) {
            doc.products = id_product;
            await doc.save();
            product
                .updateOne(
                    { _id: id_product },
                    {
                        $set: {
                            sizeProducts: doc._id,
                        },
                    },
                )
                .then(data => {
                    if (data) {
                        console.log('size ngoai');
                    }
                });
        }
    });

    const sC = await nColor.save(async (err, doc) => {
        if (doc) {
            doc.products = id_product;
            await doc.save();
            product
                .updateOne(
                    { _id: id_product },
                    {
                        $set: {
                            colorProducts: doc._id,
                        },
                    },
                )
                .then(data => {
                    if (data) {
                        console.log('color ngoai');
                    }
                });
        }
    });

    res.status(201).send({ message: 'add product success' });
};

exports.updateProduct = async (req, res) => {
    // kiểm tra có đủ tham số truyền vào hay không
    if (
        typeof req.body.name === 'undefined' ||
        typeof req.body.id === 'undefined' ||
        typeof req.body.id_category === 'undefined' ||
        typeof req.body.price === 'undefined' ||
        typeof req.body.id_brand === 'undefined' ||
        typeof req.body.description === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }
    req.body.sizeProduct = JSON.parse(req.body.sizeProduct);
    req.body.colorProduct = JSON.parse(req.body.colorProduct);
    const {
        id,
        name,
        id_category,
        id_brand,
        price,
        description,
        quantity,
        status,
        sizeProduct,
        colorProduct,
    } = req.body;

    const productFind = await product.findOne({ _id: id }); //tìm kiếm product bằng id

    const id_colorP = productFind.colorProducts;
    const id_sizeP = productFind.sizeProducts;

    let urls = [];
    if (req.files != null) {
        const files = req.files;

        for (const file of files) {
            const { path } = file;
            const result = await uploadImg(path);
            urls.push(result);
        }
    }
	else{
		urls = productFind.images;
	}



    if (colorProduct != "") {
        color_product
            .updateOne(
                { _id: id_colorP },
                {
                    $set: {
                        colorProduct: colorProduct,
                    },
                },
            )
            .then(err => {
                // if (err) console.log('color product');
            });
    }

    if (sizeProduct != "") {
        size_product
            .updateOne(
                { _id: id_sizeP },
                {
                    $set: {
                        sizeProduct: sizeProduct,
                    },
                },
            )
            .then(err => {
                // if (err) console.log('size product');
            });
    }

    product.updateOne(
        { _id: id },
        {
            $set: {
                name,
                id_category,
                price,
                quantity,
                images: urls,
                id_brand,
                description,
                status,
            },
        },
        (err, data) => {
            err
                ? res.status(500).json({ message: 'Fail' })
                : res.status(200).json({ message: 'Success' });
        },
    );
};

exports.deleteProduct = async (req, res) => {
    product.updateOne({ _id: req.params.id }, { $set: { status: false } }).exec(err => {
        err
            ? res.status(400).send({ message: err })
            : res.status(200).send('delete product success');
    });
};

exports.getOne = async (req, res) => {
    product
        .findOne({ _id: req.params.id })
        .populate('colorProducts')
        .populate({
            path: 'colorProducts',
            populate: {
                path: 'colorProduct',
                populate: {
                    path: '_id',
                },
            },
        })
        .populate('sizeProducts')
        .populate({
            path: 'sizeProducts',
            populate: {
                path: 'sizeProduct',
                populate: {
                    path: '_id',
                },
            },
        })
        .exec(function (err, data) {
            err ? res.status(404).json({ message: err }) : res.status(200).json({ data });
        });
};

exports.getAllProducts = async (req, res) => {
    // kiểm tra tham số truyền vào có hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    let count = null;

    try {
        count = await product.countDocuments({}); // đém sản phẩm có bao nhiêu
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    const totalPage = parseInt((count - 1) / 5 + 1); // từ số lượng sản phẩm sẽ tính ra số trang
    const { page } = req.params;
    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    product
        .find({})
        .populate('colorProducts')
        .populate({
            path: 'colorProducts',
            populate: {
                path: 'colorProduct',
                populate: {
                    path: '_id',
                },
            },
        })
        .populate('sizeProducts')
        .populate({
            path: 'sizeProducts',
            populate: {
                path: 'sizeProduct',
                populate: {
                    path: '_id',
                },
            },
        })
        .skip(5 * (parseInt(page) - 1))
        .limit(5) // giới hạn hiển thị sản phẩm mỗi trang
        .exec((err, docs) => {
            err
                ? res.status(404).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
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

    const { name_category, name_brand, quantity } = req.body; //khai cái tham số cần thiết
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

    const { id, name_category, path, name_brand, quantity, status } = req.body; //khai báo tham số
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

    const getNameStock = await stockController.getDataByID(req.params.id); //tìm kiếm tên theo id
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

exports.getAllStocks = async (req, res) => {
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
            err
                ? res.status(404).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
        });
};

exports.getStocks = async (req, res) => {
    stock.find({ status: true }, (err, docs) => {
        err ? res.status(404).send({ message: err }) : res.status(200).send({ data: docs });
    });
};

//brand
exports.addBrand = async (req, res) => {
    //kiểm tra có đủ tham số truyền vào hay không
    if (typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    let brandFind = null;
    const { name } = req.body;
    try {
        brandFind = await brand.find({ name: name }); //tìm kiếm brand theo tên
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (brandFind.length > 0) {
        // trường hợp có brand
        return res.status(409).send({ message: 'Brand already exist' });
    }

    const newBrand = new brand({ name });

    try {
        await newBrand.save(); //lưu brand
    } catch (err) {
        // xuất ra lỗi
        return res.status(500).send({ message: err });
    }
    res.status(201).send({ message: 'add brand success', data: newBrand }); // thông báo add brand thành công
};

exports.updateBrand = async (req, res) => {
    //kiểm tra có đủ tham số truyền vào hay không
    if (typeof req.body.id === 'undefined' || typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    const { id, name, status } = req.body; // khai báo biến
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
        //lưu lại branđ đã thay đổi
        await brandFind.save(err => {
            err
                ? res.status(404).send({ message: 'add brand fail' })
                : res.status(201).send({
                      message: 'update brand success',
                      brand: { name: name },
                  });
        });
    } catch (err) {
        return res.status(500).send({ message: err }); //xuất lỗi
    }
};

exports.deleteBrand = async (req, res) => {
    brand.updateOne({ _id: req.params.id }, { $set: { status: false } }).exec(error => {
        error ? res.status(400).send({ error }) : res.status(201).send('delete brand success');
    });
};

exports.getAllBrands = async (req, res) => {
    //kiểm tra có truyền đủ tham số hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    let count = null; //khai báo biến
    try {
        count = await brand.countDocuments(); //đếm brand
    } catch (err) {
        //xuất lỗi
        return res.status(500).send({ message: err });
    }

    const totalPage = parseInt((count - 1) / 5 + 1); //tính tổng số trang
    const { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }
    brand
        .find() //lấy brand
        .skip(5 * (parseInt(page) - 1))
        .limit(5)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
        });
};

// category
exports.addCategory = async (req, res) => {
    //kiểm tra có truyền đủ tham số hay không
    if (typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //khai báo biến
    const { name } = req.body;
    let categoryFind;

    try {
        categoryFind = await category.find({ name: name }); //tìm kiếm theo name và path
    } catch (err) {
        //xuất lỗi
        return res.status(500).send({ message: err });
    }

    if (categoryFind.length > 0) {
        //trường hợp tìm thấy category
        return res.status(409).send({ message: 'category already exist' });
    }

    const newCategory = new category({ name });
    try {
        newCategory.save(err => {
            err
                ? res.status(500).send({ message: 'add categoy fail' })
                : res.status(201).send({ message: 'add category success' });
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.updateCategory = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.body.id === 'undefined' || typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //khai báo biến cần thiết
    const { id, name, status } = req.body;
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
        //lưu các thay đổi
        categoryFind.save(err => {
            err
                ? res.status(500).send({ message: err })
                : res.status(201).send({
                      message: 'update category success',
                      category: { name: name },
                  });
        });
    } catch (err) {
        //xuất lỗi nếu không lưu được
        return res.status(500).send({ message: err });
    }

    //thông báo update thành công
};

exports.deleteCategory = async (req, res) => {
    category.updateOne({ _id: req.params.id }, { $set: { status: false } }).exec(error => {
        error ? res.status(400).send({ error }) : res.status(200).send('delete product success');
    });
};

exports.getAllCategorys = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data Invalid' });
    }

    //khai báo biến cần thiết
    let count = null;
    try {
        count = await category.countDocuments(); //đém category
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    const totalPage = parseInt((count - 1) / 5 + 1); //tính số trang
    const { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    category
        .find() //get category them status = true
        .skip(5 * (parseInt(page) - 1))
        .limit(5)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
        });
};

// user
exports.updateUser = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.body.email === 'undefined' || typeof req.body.name === 'undefined') {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //khai báo biến cần thiết
    const { email, name, status } = req.body;
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
        error ? res.status(400).send({ error }) : res.status(201).send('delete product success');
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
    const { email, password, name, is_admin } = req.body;
    let userFind = null;

    //kiểm tra email có hợp lệ không, password phải trên 6 kí tự
    if ((email.indexOf('@') === -1 && email.indexOf('.') === -1) || password.length < 6) {
        res.status(422).send({ message: 'Invalid data or password too short' });
    }

    try {
        userFind = await user.find({ email: email }); //tiến hành tìm kiếm user theo email
    } catch (err) {
        return res.status(500).send({ message: err });
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
    const { email, password } = req.body;
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

exports.getUsers = async (req, res) => {
    //get toàn bộ user
    user.find({ status: true }, (err, docs) => {
        err ? res.status(500).send({ message: err }) : res.status(200).send({ data: docs });
    });
};

exports.getAllUsers = async (req, res) => {
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

    const totalPage = parseInt((count - 1) / 9 + 1); //tính số trang
    const { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    //get user
    user.find({ is_admin: true })
        .skip(9 * (parseInt(page) - 1))
        .limit(9)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
        });
};

// Add new size
module.exports.addSize = (req, res) => {
    const nSize = new size(req.body);

    nSize.save((err, doc) => {
        err
            ? res.status(500).json({ message: 'add size fail' })
            : res.status(200).json({
                  message: 'add size success',
                  size: doc,
              });
    });
};

// Get all size -- find(query, projection)
module.exports.getAllSizes = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    //khai báo biến cần thiết
    let count = null;

    try {
        count = await size.countDocuments({}); //đếm color
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (count === null) {
        return res.status(500).json({ message: 'sizes not found' });
    }

    const totalPage = parseInt((count - 1) / 5 + 1); //tính số trang
    const { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    //get colors
    size.find({})
        .skip(5 * (parseInt(page) - 1))
        .limit(5)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
        });
};

// Update size by ID
module.exports.updateSize = (req, res) => {
    const { id, name, description, status } = req.body;
    size.updateOne({ _id: id }, { $set: { name, description, status } }, (err, data) => {
        err
            ? res.status(500).send({ message: err })
            : res.status(200).send({ message: 'update size success' });
    });
};

//Delete size
module.exports.deleteSize = (req, res) => {
    size.updateOne({ _id: req.params.id }, { status: false }, (err, data) => {
        err
            ? res.status(500).send({ message: err })
            : res.status(200).send({ message: 'delete size success' });
    });
};

// Add new color
module.exports.addColor = (req, res) => {
    const nColor = new color(req.body);

    nColor.save((err, doc) => {
        err
            ? res.status(500).json({ message: err })
            : res.status(200).json({
                  color: doc,
              });
    });
};

// Get all color -- find(query, projection)
module.exports.getAllColors = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.page === 'undefined') {
        return res.status(402).send({ message: 'Data invalid' });
    }

    //khai báo biến cần thiết
    let count = null;

    try {
        count = await color.countDocuments({}); //đếm color
    } catch (err) {
        return res.status(500).send({ message: err });
    }

    if (count === null) return res.status(500).json({ message: 'colors not found' });

    const totalPage = parseInt((count - 1) / 5 + 1); //tính số trang
    const { page } = req.params;

    if (parseInt(page) < 1 || parseInt(page) > totalPage) {
        return res.status(200).send({ data: [], message: 'Invalid page', totalPage });
    }

    //get colors
    color
        .find({})
        .skip(5 * (parseInt(page) - 1))
        .limit(5)
        .exec((err, docs) => {
            err
                ? res.status(500).send({ message: err })
                : res.status(200).send({ data: docs, totalPage });
        });
};

// Update color
module.exports.updateColor = (req, res) => {
    const { id, name, description, status } = req.body;
    color.updateOne({ _id: id }, { $set: { name, description, status } }, (err, data) => {
        err
            ? res.status(500).send({ message: err })
            : res.status(200).send({ message: 'update color success' });
    });
};

// Delete color
module.exports.deleteColor = (req, res) => {
    color.updateOne({ _id: req.params.id }, { status: false }, (err, data) => {
        err
            ? res.status(500).send({ message: err })
            : res.status(200).send({ message: 'delete color success' });
    });
};
