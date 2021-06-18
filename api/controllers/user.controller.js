const user = require('../models/user.model');
const nodemailer = require('../utils/nodemailer');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const maotp = require('../utils/otp');
const validate = require('../utils/validate');
require('dotenv').config();
const client = new OAuth2Client(process.env.GOOGLE_API_KEY);

exports.register = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.email === 'undefined' ||
        typeof req.body.password === 'undefined' ||
        typeof req.body.name === 'undefined' ||
        typeof req.body.repassword === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //khai báo các biến cần thiết
    let { email, password, name, repassword } = req.body;
    //kiểm tra điều kiện password hợp lệ
    // if (!validate.isValidPassWord(password)) {
    //     return res.status(422).send({
    //         message: 'Mật khẩu có độ dài từ 8-12 kí tự phải chứa số,chữ thường và chữ hoa ',
    //     });
    // }
    if (password.length < 6) {
        return res.status(422).send({ message: 'Mật khẩu phải có đồ dài ít nhất 6 kí tự' });
    }
    //kiểm tra tên có hợp lệ không
    // if (!validate.isValidName(name)) {
    //     return res.status(422).send({ message: 'Nhập đầy đủ họ và tên' });
    // }
    if (name.length < 6) {
        return res.status(422).send({ message: 'Tên phải có độ dài ít nhất là 6 kí tự' });
    }
    //kiểm tra điều kiện email và password
    if (email.indexOf('@') === -1 && email.indexOf('.') === -1) {
        return res.status(422).send({ message: 'Invalid data' });
    }
    //nếu password và repassword khác nhau
    if (password != repassword) {
        return res.status(422).send({ message: 'password incorect' });
    }
    let userFind = null;
    try {
        userFind = await user.find({ email: email }); //tìm kiếm user theo email
    } catch (err) {
        return res.status(500).send({ message: 'user not found' });
    }
    if (userFind.length > 0) {
        //trường hợp có user trong db
        return res.status(409).send({ message: 'Email already exist' });
    }
    //hash password
    password = bcrypt.hashSync(password, 10);
    //tạo mới user
    const newUser = new user({
        email: email,
        name: name,
        password: password,
    });
    try {
        await newUser
            .save() //lưu user
            .then(function () {
                newUser.generateJWT(); //tạo token
            });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    const sendEmail = await nodemailer.sendEmail(email, newUser.token); //gửi mail để verify account
    console.log(sendEmail);
    !sendEmail
        ? res.status(500).send({ message: 'Send email fail' })
        : res.status(201).send({ message: 'success' });
};

exports.verifyAccount = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.token === 'undefined') {
        return res.status(402).send({ message: '!invalid' });
    }
    //khai báo các biến cần thiết
    let tokenFind = null;
    try {
        tokenFind = await user.findOne({ token: req.params.token }); //tìm kiếm user theo token
    } catch (err) {
        return res.status(500).send({ message: 'user not found' });
    }

    try {
        //lưu các thay đổi
        await user.findByIdAndUpdate(tokenFind._id, { $set: { is_verify: true } }, err => {
            err
                ? res.status(500).send({ message: 'verify account fail' })
                : res.status(200).send({ message: 'verify account success' });
        });
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.login = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.body.email === 'undefined' || typeof req.body.password == 'undefined') {
        return res.status(402).send({ message: 'email or password wrrong' });
    }
    //khai báo các biến cần thiết
    const { email, password } = req.body;
    let userFind = null;
    try {
        userFind = await user.findOne({ email: email }); //tìm kiếm user theo email
    } catch (err) {
        return res.status(402).send({ message: 'user not found' });
    }
    if (userFind === null) {
        //trường hợp không có user trong db
        return res.status(422).send({ message: 'not found user in database' });
    }
    if (!userFind.is_verify) {
        //trường hợp account chưa verify
        return res.status(401).send({ message: 'no_registration_confirmation' });
    }

    if (!bcrypt.compareSync(password, userFind.password)) {
        //trường hợp sai mật  khẩu
        return res.status(422).send({ message: 'password wrong' });
    }
    userFind.generateJWT(); //tạo token
    //thông báo login success
    res.status(200).send({
        message: 'login success',
        token: userFind.token,
        newUser: {
            email: userFind.email,
            name: userFind.name,
            _id: userFind._id,
        },
    });
};

exports.getUser = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.id === 'undefined') {
        return res.status(402).send({ message: 'Invalid data' });
    }
    //khai báo các biến cần thiết
    const { id } = req.params;
    let email;
    let userFind = null;
    try {
        userFind = await user.findOne({ _id: id }); //tìm kiếm user theo id
    } catch (err) {
        return res.send({ message: 'user not found' });
    }

    if (userFind.fbEmail != null) {
        email = userFind.fbEmail;
    }
    if (userFind.ggEmail != null) {
        email = userFind.ggEmail;
    } else {
        email = userFind.email;
    }

    res.status(200).send({
        user: {
            //trả về email và name của user
            email: email,
            name: userFind.name,
        },
    });
};

exports.requestForgotPassword = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.params.email === 'undefined') {
        return res.status(402).send({ message: 'Invalid data' });
    }
    //khai báo các biến cần thiết
    const { email } = req.params;
    let userFind = null;
    try {
        userFind = await user.findOne({ email: email }); //tìm kiếm user theo email
    } catch (err) {
        return res.send({ message: 'user not found' });
    }
    if (userFind === null) {
        //trường hợp không có user trong db
        return res.status(422).send({ message: 'Invalid data' });
    }
    if (!userFind.is_verify) {
        //trường hợp account chưa verify
        return res.status(401).send({ message: 'no_registration_confirmation' });
    }
    //sinh mã otp
    let otp = maotp.generateOTP();
    //gửi otp qua email của email
    const sendEmail = await nodemailer.sendEmailForgotPassword(email, otp);
    if (!sendEmail) {
        //trường hợp gửi mail fail
        return res.status(500).send({ message: 'Send email fail' });
    }
    userFind.otp = otp; //cập nhật mã otp
    try {
        userFind.save(err => {
            err
                ? res.status(500).send({ message: 'fail' })
                : res.status(201).send({ message: 'success', email: email });
        }); //lưu các thay đổi
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    //thông báo thành công
};

exports.verifyForgotPassword = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (typeof req.body.email === 'undefined' || typeof req.body.otp === 'undefined') {
        return res.status(402).send({ message: 'Invalid data' });
    }
    //khai báo các biến cần thiết
    const { email, otp } = req.body;
    let userFind = null;
    try {
        userFind = await user.findOne({ otp: otp }); //tìm kiếm user theo email
    } catch (err) {
        return res.send({ message: 'user not found' });
    }

    userFind
        ? res.status(200).send({ message: 'success', otp: otp })
        : res.status(422).send({ message: 'OTP fail' });
};

exports.forgotPassword = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.email === 'undefined' ||
        typeof req.body.otp === 'undefined' ||
        typeof req.body.newPassword === 'undefined'
    ) {
        return res.status(402).send({ message: 'Invalid data' });
    }
    //khai báo các biến cần thiết
    const { email, otp, newPassword } = req.body;
    let userFind = null;
    try {
        userFind = await user.findOne({ email: email }); //tìm kiếm user theo email
    } catch (err) {
        return res.send({ message: 'user not found' });
    }
    if (userFind === null) {
        //trường hợp không có user trong db
        return res.status(422).send({ message: 'Invalid data' });
    }
    //trường hợp kiểm tra otp nhập vào khác với otp trong db
    if (userFind.otp != otp) {
        return res.status(422).send({ message: 'OTP fail' });
    }
    //hash password
    userFind.password = bcrypt.hashSync(newPassword, 10);
    try {
        await userFind.save(err => {
            err
                ? res.status(500).send({ message: 'fail' })
                : res.status(201).send({ message: 'success' });
        }); //lưu các thay đổi
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.updateInfor = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.name === 'undefined' ||
        typeof req.body.id === 'undefined' ||
        typeof req.body.email === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }
    //khai báo các biến cần thiết
    const { email, name, id } = req.body;
    let newUser = await user.findById(id);
    //tìm kiếm user theo email
    let userFind = await user.findOne({ email: email });
    //trường hợp email đã có trong db
    if (userFind != null && newUser.email !== email) {
        return res.status(422).send({ message: 'Email already exist' });
    }
    //cập nhật thay đổi
    newUser.name = name;
    newUser.email = email;
    try {
        await newUser.save(); //lưu các thay đổi
    } catch (err) {
        return res.status(500).send({ message: err });
    }
    //thông báo update infor thành công
    res.status(200).send({
        message: 'success',
        token: newUser.token,
        newUser: {
            email: newUser.email,
            name: newUser.name,
            _id: newUser._id,
        },
    });
};

exports.updatePassword = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
    if (
        typeof req.body.oldpassword === 'undefined' ||
        typeof req.body.newpassword === 'undefined' ||
        typeof req.body.id === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }
    //khai báo các biến cần thiết
    let { id, oldpassword, newpassword } = req.body;
    let userFind = null;
    try {
        userFind = await user.findById(id); //tìm kiếm user theo id
    } catch (err) {
        return res.send({ message: 'user not found' });
    }
    if (userFind === null) {
        //trường hợp không có user trong db
        return res.status(422).send({ message: 'Invalid data' });
    }
    //trường hợp nhập mật khẩu cũ không khớp
    if (!bcrypt.compareSync(oldpassword, userFind.password)) {
        return res.status(422).send({ message: 'Invalid data' });
    }
    //hash newpassword
    userFind.password = bcrypt.hashSync(newpassword, 10);
    try {
        userFind.save(err => {
            err
                ? res.status(500).send({ message: 'fail' })
                : res.status(200).send({ message: 'success' });
        }); //lưu các thay đổi
    } catch (err) {
        return res.status(500).send({ message: err });
    }
};

exports.getDataByID = async id_user => {
    let userFind = await user.findOne({ _id: id_user });
    if (userFind.fbEmail != null) {
        email = userFind.fbEmail;
    } else if (userFind.ggEmail != null) {
        email = userFind.ggEmail;
    } else {
        email = userFind.email;
    }
    return [userFind.name, email];
};

exports.googleController = async (req, res) => {
    const { idToken } = req.body;
    // console.log(idToken);
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_API_KEY }).then(response => {
        // console.log('GOOGLE LOGIN RESPONSE',response)
        const { email_verified, name, email } = response.payload;
        if (email_verified) {
            user.findOne({ ggEmail: email }).exec((err, newUser) => {
                if (newUser) {
                    //newUser.generateJWT();
                    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_KEY, {
                        expiresIn: '3h',
                    });
                    newUser.token = token;
                    newUser.save();
                    //const token = newUser.token;
                    const { _id, email, name } = newUser;
                    return res.json({
                        token,
                        newUser: { _id, email, name },
                    });
                } else {
                    let password = email + process.env.JWT_KEY;
                    newUser = new user({
                        name: name,
                        ggEmail: email,
                        password: password,
                        is_verify: true,
                    });

                    newUser.save((err, data) => {
                        if (err) {
                            console.log('ERROR GOOGLE LOGIN ON USER SAVE', err);
                            return res.status(400).json({
                                error: 'User signup failed with google',
                            });
                        }
                        const token = jwt.sign({ _id: data._id }, process.env.JWT_KEY, {
                            expiresIn: '3h',
                        });
                        data.token = token;
                        data.save();
                        const { _id, email, name, role } = data;
                        return res.json({
                            token,
                            newUser: { _id, email, name, role },
                        });
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google login failed. Try again',
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
            method: 'GET',
        })
            .then(response => response.json())
            // .then(response => console.log(response))
            .then(response => {
                const { email, name } = response;
                user.findOne({ fbEmail: email }).exec((err, newUser) => {
                    if (newUser) {
                        //newUser.generateJWT();
                        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_KEY, {
                            expiresIn: '3h',
                        });
                        newUser.token = token;
                        newUser.save();
                        const { _id, email, name } = newUser;
                        return res.json({
                            token,
                            newUser: { _id, email, name },
                        });
                    } else {
                        let password = email + process.env.JWT_KEY;
                        newUser = new user({
                            name: name,
                            fbEmail: email,
                            password: password,
                            is_verify: true,
                        });
                        newUser.save((err, data) => {
                            if (err) {
                                console.log('ERROR FACEBOOK LOGIN ON USER SAVE', err);
                                return res.status(400).json({
                                    error: 'User signup failed with facebook',
                                });
                            }
                            const token = jwt.sign({ _id: data._id }, process.env.JWT_KEY, {
                                expiresIn: '3h',
                            });
                            data.token = token;
                            data.save();
                            const { _id, email, name } = data;
                            return res.json({
                                token,
                                newUser: { _id, email, name },
                            });
                        });
                    }
                });
            })
            .catch(error => {
                res.json({
                    error: 'Facebook login failed. Try later',
                });
            })
    );
};

exports.addAddress = async (req, res) => {
    try {
        const userF = await user.findById(req.body.id);
        if (!user) return res.status(400).json({ message: 'User not found' });
        if (req.body.address.name.length === 0 || req.body.address.name.length >= 30)
            return res.status(400).json({ msg: 'Form is not format' });
        if (req.body.address.phone.length !== 10)
            return res.status(400).json({ msg: 'Please enter the correct phone number' });

        await user.findOneAndUpdate(
            { _id: req.body.id },
            {
                $set: {
                    address: req.body.address,
                },
            },
        );
        return res.status(200).json('Add address');
    } catch (err) {
        return res.status(500).json({ msg: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const userF = await user.findById(req.body.id);
        if (!user) return res.status(400).json({ message: 'User not found' });
        if (req.body.address.name.length === 0 || req.body.address.name.length >= 30)
            return res.status(400).json({ msg: 'Form is not format' });
        if (req.body.address.phone.length !== 10)
            return res.status(400).json({ msg: 'Please enter the correct phone number' });

        await user.findOneAndUpdate(
            { _id: req.body.id },
            {
                $set: {
                    address: req.body.address,
                },
            },
        );
        return res.status(200).json('Update address');
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};
