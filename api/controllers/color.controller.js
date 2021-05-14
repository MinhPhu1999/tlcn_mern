const color = require('../models/color.model');

// Get all color -- find(query, projection)
module.exports.getColors = (req, res) => {
    color.find({ status: true }, (err, colors) => {
        if (err) return res.send(err);
        res.status(200).json({colors});
    });
};
