'use strict'
const user = require('../models/user.model');
const nodemailer = require('../utils/nodemailer');
const sendgrid = require('../utils/sendgrid');
const randomstring = require('randomstring');
const bcrypt = require('bcrypt');
const maotp = require('../utils/otp');

exports.register = async (req, res) => {
    if ((typeof req.body.email === 'undefined')
        || (typeof req.body.password === 'undefined')
        || typeof req.body.name === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { email, password, name, repassword} = req.body;

    if (email.indexOf("@")=== -1 && email.indexOf('.') === -1 
        || password.length < 6 ){
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    if(password != repassword){
        res.status(422).send({message: 'password incorect'});
        return;
    }
    let userFind = null;
    try {
        userFind = await user.find({ 'email': email });
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    if (userFind.length > 0) {
        res.status(409).send({message: 'Email already exist' }); 
        return;
    }
 
    password = bcrypt.hashSync(password, 10);
    const newUser = new user({
        email: email,
        name: name,
        password: password,
        status: true
    });
    try {
        await newUser.save()
                    .then(function() {
                        newUser.generateJWT();
                        
                    })
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    let sendEmail = await nodemailer.sendEmail(email, newUser.token);
    // let token = '123456789';
    // let sendMail = await sendgrid.sendEmail(email, token);
    //console.log(sendMail);
    if (!sendEmail) {
        res.status(500).send({message: 'Send email fail' });
        return;
    }
    res.status(201).send({message: 'success' })
}

exports.verifyAccount = async (req, res) => {
    if(typeof req.params.token === 'undefined'){
        res.status(402).send({message: "!invalid"});
        return;
    }
    let token = req.params.token;
    let tokenFind = null;
    try{
        tokenFind = await user.findOne({'token': token});
    }
    catch(err){
        res.status(500).send({message: err});
        return;
    }
    if(tokenFind == null){
        res.status(404).send({message: "user not found!!!"});
        return;
    }
    try{
        await user.findByIdAndUpdate(tokenFind._id ,
            { $set: { is_verify: true }}, { new: true });
    }
    catch(err){
        res.status(500).send({message: err});
        return;
    }
    res.status(200).send({message:"verify account success!"});
}

exports.login = async (req, res) => {
    if(typeof req.body.email === 'undefined'
    || typeof req.body.password == 'undefined'){
        res.status(402).send({message: "email or password wrrong"});
        return;
    }
    let { email, password } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email});
    }
    catch(err){
        res.status(402).send({message:"loi"});
        return;
    }
    if(userFind === null){
        res.status(422).send({message: "not found user in database"});
        return;
    }
    if(!userFind.is_verify){
        res.status(401).send({message: 'no_registration_confirmation'});
        return;
    }
    
    if(!bcrypt.compareSync(password, userFind.password)){
        res.status(422).send({message: 'password wrong'});
        return;
    }
    res.status(200).send({message: 'login success', token: userFind.token, user: {
        email: userFind.email,
        name: userFind.name,
        id: userFind._id
    }});
}

exports.getUser = async (req, res) =>{
    if(typeof req.params.id === 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }
    let id = req.params.id;
    let userFind = null;
    try{
        userFind = await user.findOne({_id: id});
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null) {
        res.status(422).send({message: "Invalid data"});
        return;
    }
    //console.log(userFind);
    res.status(200).send({ user: {
        email: userFind.email,
        name: userFind.name,
    }});

}
exports.requestForgotPassword = async (req, res) => {
    if(typeof req.params.email === 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }   
    let email = req.params.email;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email});
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null) {
        res.status(422).send({message: "Invalid data"});
    }
    if(!userFind.is_verify){
        res.status(401).send({message: 'no_registration_confirmation'});
        return;
    }
    let otp = maotp.generateOTP();
    let sendEmail = await nodemailer.sendEmailForgotPassword(email, otp);
    if (!sendEmail) {
        res.status(500).send({message: 'Send email fail' });
        return;
    }
    userFind.otp = otp;
    try {
        await userFind.save();
    }
    catch (err) {
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'success', email: email })
}

exports.verifyForgotPassword = async (req, res) => {
    if(typeof req.body.email === 'undefined'
    || typeof req.body.otp === 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }

    let { email, otp } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email});
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null){
        res.status(422).send({message: "Invalid data"});
        return;
    }
    if(userFind.otp != otp) {
        res.status(422).send({message: "OTP fail"});
        return;
    }
    res.status(200).send({message: "success", otp: otp});
}

exports.forgotPassword = async (req, res) => {
    if(typeof req.body.email === 'undefined'
    || typeof req.body.otp === 'undefined'
    || typeof req.body.newPassword === 'undefined'){
        res.status(402).send({message: "Invalid data"});
        return;
    }
    let { email, otp, newPassword } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'email': email});
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null){
        res.status(422).send({message: "Invalid data"});
        return;
    }
    if(userFind.otp != otp) {
        res.status(422).send({message: "OTP fail"});
        return;
    }

    userFind.password = bcrypt.hashSync(newPassword, 10);
    try {
        await userFind.save();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({message: err });
        return;
    }
    res.status(201).send({message: 'success' })
}

exports.updateInfor = async (req, res) => {
    if ( typeof req.body.name === 'undefined'
        || typeof req.body.id === 'undefined'
        || typeof req.body.email === 'undefined'
    ) {
        res.status(422).send({ message: 'Invalid data' });
        return;
    }
    let { email, name, id} = req.body;
    let newUser = await user.findById(id);
    let userFind = await user.findOne({'email': email});

    if(userFind != null && newUser.email !== email) {
        res.status(422).send({ message: "Email already exist" });
        return;
    }
    newUser.name = name;
    newUser.email = email;
    try {
        await newUser.save();
    }
    catch(err) {
        res.status(500).send({message: err });
        return;
    }
    res.status(200).send({message: 'success', token: newUser.token, user: {
        email: newUser.email,
        name: newUser.name,
        id: newUser._id
    }});
}

exports.updatePassword = async (req, res) => {
    if ( typeof req.body.oldpassword === 'undefined'
        || typeof req.body.newpassword === 'undefined'
        || typeof req.body.id === 'undefined'
    ) {
        res.status(422).send({message: 'Invalid data' });
        return;
    }
    let { id, oldpassword, newpassword } = req.body;
    let userFind = null;
    try{
        userFind = await user.findOne({'_id': id});
    }
    catch(err){
        res.send({message: err});
        return;
    }
    if(userFind == null){
        res.status(422).send({message: "Invalid data"});
        return;
    }
    if(!bcrypt.compareSync(oldpassword, userFind.password)){
        res.status(422).send({message: 'Invalid data'});
        return;
    }
    userFind.password = bcrypt.hashSync(newpassword, 10);
    try {
        await userFind.save()
    }
    catch(err) {
        res.status(500).send({message: err });
        return;
    }
    res.status(200).send({message: 'success'});
}

exports.getDataByID = async(id_user)=>{
    let userFind = await user.findOne({_id: id_user});
    return userFind ;
}

exports.addToCart = async (req, res) => {
    if (typeof req.body.id === 'undefined'
      || typeof req.body.cart === 'undefined') {
        res.status(422).send({message: "invalid data" });
      return;
    }
    const { id, cart} = req.body;
    let userFind = null;
    userFind = await user.findById(id);
    if(!userFind)
      return res.status(400).json({ msg: "User does not exists" });
  
    await user.findOneAndUpdate({_id: id}, {cart: cart})
    res.status(200).send({message: "add cart success" });
  }