const admin_controller = require('../controllers/admin.controller');
const order_controller = require('../controllers/order.controller');
const product_controller = require('../controllers/product.controller');

const upload = require('../config/multer');

module.exports = app => {
    //product
    app.route('/admin/addproduct').post(upload.array('files'), admin_controller.addProduct);

    app.route('/admin/updateproduct').patch(upload.array('files'), admin_controller.updateProduct);

    app.route('/admin/deleteproduct/:id').patch(admin_controller.deleteProduct);

    app.route('/admin/getallproduct/:page').get(admin_controller.getAllProducts);

    app.route('/admin/product/updateprice').post(product_controller.updatePriceByCategory);

    //brand
    app.route('/admin/addbrand').post(admin_controller.addBrand);

    app.route('/admin/updatebrand').put(admin_controller.updateBrand);

    app.route('/admin/deletebrand/:id').put(admin_controller.deleteBrand);

    app.route('/admin/getallbrand/:page').get(admin_controller.getAllBrands);

    //category
    app.route('/admin/addcategory').post(admin_controller.addCategory);

    app.route('/admin/updatecategory').put(admin_controller.updateCategory);

    app.route('/admin/deletecategory/:id').put(admin_controller.deleteCategory);

    app.route('/admin/getallcategory/:page').get(admin_controller.getAllCategorys);

    //user
    app.route('/admin/adduser').post(admin_controller.addUser);

    app.route('/admin/deleteuser/:id').put(admin_controller.deleteUser);

    app.route('/admin/updateuser').put(admin_controller.updateUser);

    app.route('/admin/getAllUser/:page').get(admin_controller.getAllUsers);

    app.route('/admin/getusers').get(admin_controller.getUsers);

    app.route('/admin/login').post(admin_controller.login);

    //order
    app.route('/admin/order/:id').put(order_controller.deleteOrder);

    app.route('/admin/order/byday').get(order_controller.getOrderByDay);

    app.route('/admin/order/bymonth').get(order_controller.getOrderByMonth);

    app.route('/admin/order/byyear/:year').get(order_controller.getOrderByYear);

    app.route('/admin/order/top10').get(order_controller.getOrderTop10);

    app.route('/admin/order/quantitybyyear/:year').get(order_controller.getQuantityByYear);

	app.route('/admin/order/subtotal/:year').get(order_controller.getOrderSubTotalByYear);
	
	app.route('/admin/order/subtotalcategory').post(order_controller.getOrderSubTotalByYearAndCategory);

    app.route('/admin/order/yearandcategory').post(order_controller.getQuantityByYearAndCategory);

    app.route('/admin/order/countorder').post(order_controller.getQuantityOrderByYearAndCategory);

    //stock
    app.route('/admin/addstock').post(admin_controller.addStock);

    app.route('/admin/updatestock').put(admin_controller.updateStock);

    app.route('/admin/deletestock/:id').put(admin_controller.deleteStock);

    app.route('/admin/getallstock/:page').get(admin_controller.getAllStocks);

    //size
    app.route('/admin/addsize').post(admin_controller.addSize);

    app.route('/admin/updatesize').put(admin_controller.updateSize);

    app.route('/admin/deletesize/:id').put(admin_controller.deleteSize);

    app.route('/admin/getsizes/:page').get(admin_controller.getAllSizes);

    //color
    app.route('/admin/addcolor').post(admin_controller.addColor);

    app.route('/admin/updatecolor').put(admin_controller.updateColor);

    app.route('/admin/deletecolor/:id').put(admin_controller.deleteColor);

    app.route('/admin/getcolors/:page').get(admin_controller.getAllColors);

    //promotion code
    app.route('/admin/promocodes/add').post(admin_controller.addPromotionCode);

    app.route('/admin/promocodes/update').put(admin_controller.updatePromoCode);

    app.route('/admin/promocodes').get(admin_controller.getPromoCodes);

    //banner
    app.route('/admin/banners/add').post(admin_controller.addBanner);

    app.route('/admin/banners/update').put(admin_controller.updateBanner);

    app.route('/admin/banners/:id').get(admin_controller.getBanner);
	
    app.route('/admin/banners').get(admin_controller.getBanners);

};
