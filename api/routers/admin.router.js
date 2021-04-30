const admin_controller = require('../controllers/admin.controller');
const order_controller = require('../controllers/order.controller');
const upload = require('../config/multer');

module.exports = (app) => {
  //product
    app.route('/admin/addproduct')
        .post(upload.single('file'),admin_controller.addProduct); 
    // app.route('/admin/addproduct')
    //     .post(upload.single('file'),admin_controller.addProductTest); 
    app.route('/admin/updateproduct')
        .put(upload.single('file'),admin_controller.updateProduct);
    app.route('/admin/deleteproduct/:id')
        .put(admin_controller.deleteProduct);
    app.route('/admin/getallproduct/:page')
        .get(admin_controller.getAllProduct);


    //brand
    app.route('/admin/addbrand')
        .post(admin_controller.addBrand);
    app.route('/admin/updatebrand')
        .put(admin_controller.updateBrand);
    app.route('/admin/deletebrand/:id')
        .put(admin_controller.deleteBrand);
    app.route('/admin/getallbrand/:page')
        .get(admin_controller.getAllBrand);
    
    //category
    app.route('/admin/addcategory')
        .post(admin_controller.addCategory);
    app.route('/admin/updatecategory')
        .put(admin_controller.updateCategory);
    app.route('/admin/deletecategory/:id')
        .put(admin_controller.deleteCategory);
    app.route('/admin/getallcategory/:page')
        .get(admin_controller.getAllCategory);

    //user
    app.route('/admin/adduser')
        .post(admin_controller.addUser);
    app.route('/admin/deleteuser/:id')
        .put(admin_controller.deleteUser);
    app.route('/admin/updateuser')
        .put(admin_controller.updateUser);
    app.route('/admin/getAllUser/:page')
        .get(admin_controller.getAllUser);
    app.route('/admin/getuser')
        .get(admin_controller.getUser);
    app.route('/admin/login')
        .post(admin_controller.login);

    //order
    app.route('/admin/order/:id')
        .put(order_controller.deleteOrder);
    app.route('/admin/order/byday')
        .get(order_controller.getOrderByDay);
    app.route('/admin/order/bymonth')
        .get(order_controller.getOrderByMonth);
    app.route('/admin/order/byyear')
        .get(order_controller.getOrderByYear);
    app.route('/admin/order/top10')
        .get(order_controller.getOrderTop10);
    app.route('/admin/order/quantitybyyear')
        .get(order_controller.getQuantityByYear);
    
    //stock
    app.route('/admin/addstock')
        .post(admin_controller.addStock);
    app.route('/admin/updatestock')
        .put(admin_controller.updateStock);
    app.route('/admin/deletestock/:id')
        .put(admin_controller.deleteStock);
    app.route('/admin/getallstock/:page')
        .get(admin_controller.getAllStock);
}