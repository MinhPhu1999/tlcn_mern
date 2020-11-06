'use strict'
const product_controller = require('../controllers/product.controller');
const multer = require('multer')
const storage = multer.diskStorage({
    destination: './files/',
    filename: (req, file, cb) =>{
        let filename=`${Date.now()}-${file.originalname}`;
       cb(null,filename);
    }
  })
const upload = multer({ storage:storage });


module.exports = (app) => {
    app.route('/product/addproduct')
        .post(upload.single('file'),product_controller.addProduct);

    app.route('/product/updateproduct')
        .post(upload.single('file'),product_controller.updateProduct);

    app.route('/product/deleteproduct/:id')
        .get(product_controller.deleteProduct);

    app.route('/product/getallproduct')
        .get(product_controller.getAllProduct);
        
    app.route('/product/getproduct')
        .get(product_controller.getProduct);
        
    app.route('/product/searchproduct')
        .post(product_controller.searchProduct);

    app.route('/product/getproductbybrand')
        .post(product_controller.getProductByBrand);

    app.route('/product/getproductbycategory')
        .post(product_controller.getProductByCategory);

}