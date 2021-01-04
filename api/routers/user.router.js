const user_controller = require('../controllers/user.controller');
const auth = require('../utils/auth');

module.exports = (app) => {

   app.route('/user/register')
      .post(user_controller.register);

   app.route('/user/verify/:token')
      .get(user_controller.verifyAccount);

   app.route('/user/login')
      .post(user_controller.login);
   // app.route('/user/:id')
   //    .get(user_controller.getUser);
   app.route('/user/:id')
      .get(auth.authLogin,user_controller.getUser);

   app.route('/user/request/forgotpassword/:email')
      .get(user_controller.requestForgotPassword)

   app.route('/user/verify/forgotpassword')
      .post(user_controller.verifyForgotPassword)

   app.route('/user/forgotpassword')
      .post(user_controller.forgotPassword)

   app.route('/auth')
      .post(auth.verify)

   app.route('/user/updateinfor')
      .put(auth.authLogin, user_controller.updateInfor)
   // app.route('/user/updateinfor')
   //    .put(user_controller.updateInfor)

   app.route('/user/updatepassword')
      .put(auth.authLogin, user_controller.updatePassword)

   app.route('/googlelogin')
      .post(user_controller.googleController);
   
   app.route('/facebooklogin')
      .post(user_controller.facebookController);

}