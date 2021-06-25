const color = require('../models/color.model');

// Get all color -- find(query, projection)
module.exports.getColors = (req, res) => {
    color.find({ status: true }, (err, colors) => {
        err
            ? res.status(500).json({ message: 'colors not found' })
            : res.status(200).json({ data: colors });
    });
};
