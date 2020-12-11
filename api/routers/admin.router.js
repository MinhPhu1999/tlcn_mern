const admin_controller = require('../controllers/admin.controller');
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
  //product
    app.route('/admin/addproduct')
        .post(upload.single('file'),admin_controller.addProduct); 
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
    app.route('/admin/deleteuser')
        .put(admin_controller.deleteUser);
    app.route('/admin/getAllUser/:page')
        .get(admin_controller.getAllUser);
    app.route('/admin/getuser')
        .get(admin_controller.getUser);
    app.route('/admin/login')
        .post(admin_controller.login);

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