const size = require('../models/size.model');

// Get all size -- find(query, projection)
module.exports.getSizes = (req, res) => {
    size.find({ status: true }, (err, sizes) => {
        err ? res.status(500).json({ message: 'size not found' }) : res.status(200).json({ sizes });
    });
};
