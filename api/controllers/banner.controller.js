const banner = require('../models/banner.model');

exports.getBanners = async (req, res) => {
    banner.find({status: true}, (err, data) => {
        err ? res.status(404).json({ message: 'Banners not found' }) : res.status(200).json(data);
    });
};
