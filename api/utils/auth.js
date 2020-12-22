const user = require('../models/user.model');
const jwt = require('jsonwebtoken');
exports.verify = async(req, res) => {
    if(typeof req.body.token === 'undefined'
        ||typeof req.body.email === 'undefined'){
        res.status(422).send({message: "Invalid data"});
        return;
    }

    let token = req.body.token;
    let email = req.body.email;
    let userFind = await user.findOne({'email': email});
    try{
        let decoded = await jwt.verify(token, process.env.JWT_KEY);
        if(decoded._id == userFind._id){
            res.status(200).send({message: 'success'});
            return;
        }
    }
    catch(err){
        res.status(404).send({message: 'unsuccess1'});
        return
    }
    res.status(404).send({message: 'unsuccess'});
}

exports.authLogin = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data = jwt.verify(token, process.env.JWT_KEY);
        user.findOne({ _id: data._id, 'token': token })
            .then((user) => {
                if (!user) {
                    return res.status(401).send({
                        message: "Please login"
                    });
                }
                req.user = user;
                next();
            })
            .catch((err) => {
                return res.status(401).send({
                    message: "Not authorized to access this resource",
                });
            });
    } catch (error) {
        res.status(401).send({ message: 'Time out, Please login again' })
    }
}


