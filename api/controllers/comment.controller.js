const comment = require('../models/comment.model');

class APIfeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    sorting() {
        this.query = this.query.sort('-createdAt');
        return this;
    }
    paginating() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 5;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

exports.getComment = async (req, res) => {
    // try{
    //     const comments = await comment.find({product_id: req.params.id, status: true});

    //     res.status(200).send({comments});

    // }catch(err) {
    //     return res.status(500).send({message: err });
    // }

    try {
        const features = new APIfeatures(
            comment.find({ product_id: req.params.id }),
            req.query
        )
            .sorting()
            .paginating();

        const comments = await features.query;

        res.json({
            status: 'success',
            result: comments.length,
            comments,
        });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

exports.updateComment = async (req, res) => {
    if (
        typeof req.body.id === 'undefined' ||
        typeof req.body.content === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    const { id, content } = req.body;

    comment
        .updateOne(
            { _id: id },
            {
                $set: {
                    content: content,
                },
            }
        )
        .exec((err) => {
            if (err) {
                return res.status(400).send({ error });
            }
            res.status(201).send({ message: 'success' });
        });
};

exports.deleteComment = async (req, res) => {
    //kiểm tra tham số truyền vào đúng hay không
    if (
        typeof req.body.id === 'undefined' ||
        typeof req.body.user_id === 'undefined'
    ) {
        return res.status(422).send({ message: 'Invalid data' });
    }

    //tìm kiếm theo id và user_id trong model comment
    const commentFind = await comment.find({ id: id, user_id: user_id });
    if (commentFind === null)
        return res
            .status(404)
            .send({ message: 'Bạn không thể xóa comment của người khác' });

    //update lại status của comment
    comment
        .updateOne(
            { _id: req.params.id },
            {
                $set: {
                    status: false,
                },
            }
        )
        .exec((err) => {
            if (err) {
                return res.status(400).send({ error });
            }
            res.status(201).send({ message: 'delete success' });
        });
};
