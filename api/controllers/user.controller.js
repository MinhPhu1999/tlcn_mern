const user = require('../models/user.model');
const nodemailer = require('../utils/nodemailer');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const maotp = require('../utils/otp');
const client = new OAuth2Client(process.env.GOOGLE_API_KEY);

exports.register = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if ((typeof req.body.email === 'undefined')
        || (typeof req.body.password === 'undefined')
        || typeof req.body.name === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return; 
    }
    //khai báo các biến cần thiết
    let { email, password, name, repassword} = req.body;
    function isValidName (string) {
        var re = /[^a-z0-9A-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]/u
        return re.test(string)
    }
    function isValidPassWord (string) {
        var re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,12}$/
        return re.test(string)
    }
    if(!isValidPassWord(password)){
        return res.status(422).send({message: "Mật khẩu có độ dài từ 8-12 kí tự phải chứa số,chữ thường và chữ hoa "})
    }
    if(!isValidName(name)){
        return res.status(422).send({message: "Nhập đầy đủ họ và tên"});
    }
    //kiểm tra điều kiện email và password
    if (email.indexOf("@")=== -1 && email.indexOf('.') === -1 
        || password.length < 6 ){
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    //nếu password và repassword khác nhau
    if(password != repassword){
        res.status(422).send({message: 'password incorect'});
        return;
    }
    let userFind = null;
    try {
        userFind = await user.find({ 'email': email });//tìm kiếm user theo email
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (userFind.length > 0) {//trường hợp có user trong db
        res.status(409).send({message: 'Email already exist' }); 
        return;
    }
    //hash password
    password = bcrypt.hashSync(password, 10);
    //tạo mới user
    const newUser = new user({
        email: email,
        name: name,
        password: password
    });
    try {
        await newUser.save()//lưu user
                    .then(function() {
                        newUser.generateJWT(); //tạo token                       
                    })
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    let sendEmail = await nodemailer.sendEmail(email, newUser.token);//gửi mail để verify account
    if (!sendEmail) {//trường hợp gửi mail fail
        res.status(500).send({message: 'Send email fail' });
        return;
    }
    res.status(201).send({message: 'success' });//thông báo thành công
}

exports.verifyAccount = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if(typeof req.params.token === 'undefined'){
        res.status(402).send({message: "!invalid"});
        return;
    }
    //khai báo các biến cần thiết
    let token = req.params.token;
    let tokenFind = null;
    try{
        tokenFind = await user.findOne({'token': token});//tìm kiếm user theo token
    }
    catch(err){
        res.status(500).send({message: err});
        return;
    }
    if(tokenFind == null){//trường hợp không có user trong db
        res.status(404).send({message: "user not found!!!"});
        return;
    }
    try{
        //lưu các thay đổi
        await user.findByIdAndUpdate(tokenFind._id ,
            { $set: { is_verify: true }}, { new: true });
    }
    catch(err){
        res.status(500).send({message: err});
        return;
    }
    res.status(200).send({message:"verify account success!"});//thông báo verify thành công
}

exports.login = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if(typeof req.body.email === 'undefined'
    || typeof req.body.password == 'undefined'){
        res.status(402).send({message: "email or password wrrong"});
        return;
    }
    //khai báo các biến cần thiết
    let { email, password } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email});//tìm kiếm user theo email
    }
    catch(err){
        res.status(402).send({message:"loi"});
        return;
    }
    if(userFind === null){//trường hợp không có user trong db
        res.status(422).send({message: "not found user in database"});
        return;
    }
    if(!userFind.is_verify){//trường hợp account chưa verify 
        res.status(401).send({message: 'no_registration_confirmation'});
        return;
    }
    
    if(!bcrypt.compareSync(password, userFind.password)){//trường hợp sai mật  khẩu
        res.status(422).send({message: 'password wrong'});
        return;
    }
    userFind.generateJWT();//tạo token
    //thông báo login success
    res.status(200).send({message: 'login success', token: userFind.token, newUser: {
        email: userFind.email,
        name: userFind.name,
        _id: userFind._id
    }});
}

exports.getUser = async (req, res) =>{
    //kiểm tra có truyền tham số đủ hay không
    if(typeof req.params.id === 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }
    //khai báo các biến cần thiết
    let id = req.params.id;
    let email;
    let userFind = null;
    try{
        userFind = await user.findOne({_id: id});//tìm kiếm user theo id
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null) {//trường hợp không có user trong db
        res.status(422).send({message: "Invalid data"});
        return;
    }
    if(userFind.fbEmail != null)
    {
        email = userFind.fbEmail;
    }
    else if(userFind.ggEmail != null)
    {
        email = userFind.ggEmail;
    }
    else
    {
        email = userFind.email;
    }

    res.status(200).send({ user: {//trả về email và name của user
        email: email,
        name: userFind.name,
    }});

}

exports.requestForgotPassword = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if(typeof req.params.email === 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }   
    //khai báo các biến cần thiết
    let email = req.params.email;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email});//tìm kiếm user theo email
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null) {//trường hợp không có user trong db
        res.status(422).send({message: "Invalid data"});
    }
    if(!userFind.is_verify){//trường hợp account chưa verify
        res.status(401).send({message: 'no_registration_confirmation'});
        return;
    }
    //sinh mã otp
    let otp = maotp.generateOTP();
    //gửi otp qua email của email
    let sendEmail = await nodemailer.sendEmailForgotPassword(email, otp);
    if (!sendEmail) {//trường hợp gửi mail fail
        res.status(500).send({message: 'Send email fail' });
        return;
    }
    userFind.otp = otp;//cập nhật mã otp
    try {
        await userFind.save();//lưu các thay đổi
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'success', email: email })//thông báo thành công
}

exports.verifyForgotPassword = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if(typeof req.body.email === 'undefined'
    || typeof req.body.otp === 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }
    //khai báo các biến cần thiết
    let { email, otp } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'otp': otp});//tìm kiếm user theo email
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null){//trường hợp không có user trong db
        res.status(422).send({message: "Invalid data"});
        return;
    }
    if(userFind.otp != otp) {//trường hợp kiểm tra otp nhập vào khác với otp trong db
        res.status(422).send({message: "OTP fail"});
        return;
    }
    res.status(200).send({message: "success", otp: otp});//thông báo thành công
}

exports.forgotPassword = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if(typeof req.body.email === 'undefined'
    || typeof req.body.otp === 'undefined'
    || typeof req.body.newPassword === 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }
    //khai báo các biến cần thiết
    let { email, otp, newPassword } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email});//tìm kiếm user theo email
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null){//trường hợp không có user trong db
        res.status(422).send({message: "Invalid data"});
        return;
    }
    //trường hợp kiểm tra otp nhập vào khác với otp trong db
    if(userFind.otp != otp) {
        res.status(422).send({message: "OTP fail"});
        return;
    }
    //hash password
    userFind.password = bcrypt.hashSync(newPassword, 10);
    try {
        await userFind.save();//lưu các thay đổi
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'success' })//thông báo thành công
}

exports.updateInfor = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if ( typeof req.body.name === 'undefined'
        || typeof req.body.id === 'undefined'
        || typeof req.body.email === 'undefined'
    ) {
        res.status(422).send({ message: 'Invalid data' });
        return;
    }
    //khai báo các biến cần thiết
    let { email, name, id} = req.body;
    let newUser = await user.findById(id);
    //tìm kiếm user theo email
    let userFind = await user.findOne({'email': email});
    //trường hợp email đã có trong db
    if(userFind != null && newUser.email !== email) {
        res.status(422).send({ message: "Email already exist" });
        return;
    }
    //cập nhật thay đổi
    newUser.name = name;
    newUser.email = email;
    try {
        await newUser.save();//lưu các thay đổi
    }
    catch(err) {
        res.status(500).send({message: err });
        return;
    }
    //thông báo update infor thành công
    res.status(200).send({message: 'success', token: newUser.token, newUser: {
        email: newUser.email,
        name: newUser.name,
        _id: newUser._id
    }});
}

exports.updatePassword = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if ( typeof req.body.oldpassword === 'undefined'
        || typeof req.body.newpassword === 'undefined'
        || typeof req.body.id === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    //khai báo các biến cần thiết
    let { id, oldpassword, newpassword } = req.body;
    let userFind = null;
    try{
        userFind = await user.findById(id);//tìm kiếm user theo id
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null){//trường hợp không có user trong db
        res.status(422).send({message: "Invalid data"});
        return;
    }
    //trường hợp nhập mật khẩu cũ không khớp
    if(!bcrypt.compareSync(oldpassword, userFind.password)){
        res.status(422).send({message: 'Invalid data'});
        return;
    }
    //hash newpassword
    userFind.password = bcrypt.hashSync(newpassword, 10);
    try {
        await userFind.save();//lưu các thay đổi
    }
    catch(err) {
        res.status(500).send({message: err });
        return;
    }
    res.status(200).send({message: 'success'});//thông báo đổi mật khẩu thành công
}

exports.getDataByID = async(id_user)=>{
    let userFind = await user.findOne({_id: id_user});
    return userFind ;
}

exports.googleController = async (req, res) => {
    const { idToken } = req.body;
  
    client
      .verifyIdToken({ idToken, audience: process.env.GOOGLE_API_KEY })
      .then(response => {
        // console.log('GOOGLE LOGIN RESPONSE',response)
        const { email_verified, name, email } = response.payload;
        if (email_verified) {
            user.findOne({'ggEmail': email }).exec((err, newUser) => {
                if (newUser) {
                    //newUser.generateJWT();
                    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_KEY, {
                        expiresIn: '3h'
                    });
                    newUser.token = token;
                    newUser.save();
                    //const token = newUser.token;
                    const { _id, email, name} = newUser;
                    return res.json({
                        token,
                        newUser: { _id, email, name}
                    });
                } else {
                    let password = email + process.env.JWT_KEY;
                    newUser = new user({
                            name: name, 
                            ggEmail: email, 
                            password: password,
                            is_verify: true
                    });

                    newUser.save((err, data) => {
                        if (err) {
                            console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                            return res.status(400).json({
                                error: 'User signup failed with google'
                            });
                        }
                        const token = jwt.sign(
                            { _id: data._id },
                            process.env.JWT_KEY,
                            { expiresIn: '3h' }
                        );
                        data.token = token;
                        data.save();
                        const { _id, email, name, role } = data;
                        return res.json({
                            token,
                            newUser: { _id, email, name, role }
                        });                       
                    }); 
                }
          });
        }else {
            return res.status(400).json({
                error: 'Google login failed. Try again'
            });
        }
      });
};

exports.facebookController = (req, res) => {
    console.log('FACEBOOK LOGIN REQ BODY', req.body);
    const { userID, accessToken } = req.body;
  
    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
  
    return (
      fetch(url, {
        method: 'GET'
      })
        .then(response => response.json())
        // .then(response => console.log(response))
        .then(response => {
          const { email, name } = response;
          user.findOne({'fbEmail': email }).exec((err, newUser) => {
            if (newUser) {
                //newUser.generateJWT();
                const token = jwt.sign({ _id: newUser._id }, process.env.JWT_KEY, {
                    expiresIn: '3h'
                });
                newUser.token = token;
                newUser.save();
                const { _id, email, name} = newUser;
                return res.json({
                    token,
                    newUser: { _id, email, name}
                });
            } else {
                let password = email + process.env.JWT_KEY;
                newUser = new user({ 
                    name: name,
                    fbEmail: email, 
                    password: password,
                    is_verify: true });
                newUser.save((err, data) => {
                if (err) {
                    console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                    return res.status(400).json({
                            error: 'User signup failed with facebook'
                    });
                }
                const token = jwt.sign(
                    { _id: data._id },
                    process.env.JWT_KEY,
                    { expiresIn: '3h' }
                );
                data.token = token;
                data.save();
                const { _id, email, name} = data;
                return res.json({
                    token,
                    newUser: { _id, email, name}
                });
              }); 
            }
          });
        })
        .catch(error => {
            res.json({
                error: 'Facebook login failed. Try later'
            });
        })
    );
};
  