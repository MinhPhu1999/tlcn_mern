const size = require('../models/size.model');


// Get all size -- find(query, projection)
module.exports.getSizes = (req, res) => {
    size.find({status: true}, (err, sizes) => {
        if (err) return res.send(err);
        res.status(200).json({sizes});
    });
};

