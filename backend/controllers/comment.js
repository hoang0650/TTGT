const _ = require('lodash');
const Comment = require('../models/comment');

function create(req, res) {
    const oComment = new Comment(req.body);
    if (oComment.feedbackId && oComment.message.length <= 1000) {
        _.extend(oComment.contact, req.body);
        oComment.createAt = new Date();
        if (oComment.refId) {
            Comment.findOne({
                _id: oComment.refId
            }).exec().then(cm => {
                if (cm.floor) {
                    oComment.floor = cm.floor + 1;
                } else {
                    oComment.floor = 1;
                }
                oComment.status = 'created';
                oComment.save().then(cm => res.status(200).send(cm), err => res.status(500).send(err));
            }, err => res.status(500).send(err));
        } else {
            oComment.floor = 0;
            oComment.status = 'created';
            oComment.save().then(cm => res.status(200).send(cm), err => res.status(500).send(err));
        }
    } else {
        res.status(500).send('no feedback depend');
    }

};

function findById(req, res) {
    if (!req.cm) {
        return res.status(404).end();
    }
    else {
        return res.status(200).json(req.cm);
    }
};

function update(req, res) {
    const requestComment = new Comment(req.body);
    const cm = req.cm;
    delete requestComment._id;
    _.extend(cm, requestComment);
    cm.update(cm).then(comment => { res.status(200).json(comment); }, err => res.status(500).send(err));
};

function deleteComment(req, res) {
    const oComment = req.cm;
    oComment.find({ $text: { $search: oComment._id } }).exec().then(comments => {
        comments.forEach(function(cm) {
            cm.status = 'deleted';
        }, this);
        comments.update(comments).then(cm => res.status(200).json(cm), err => res.status(500).send(err));
    }, err => { res.status(500).send(err); });
};

function getAllByCommentId(req, res) {
    const oComment = req.cm;
    if (oComment) {
        const listComment = [];
        listComment.push(oComment);
        Comment.find({
            status: 'reviewed',
            refId: oComment._id + ''
        }).sort({ createAt: -1 }).exec().then(comments => {
            listComment = listComment.concat(comments);
            res.status(200).json(listComment);
        }, err => res.status(500).send(err));
    } else {
        res.status(500).send('Does not exist');
    }
};

function getAllByFeedbackId(req, res) {
    Comment.find({
        feedbackId: req.params.id,
        $nor: [{ status: 'deleted' }]
    }).sort({ floor: -1, createAt: 1 }).exec().then(comments => {
        comments = JSON.parse(JSON.stringify(comments));
        const commentList = [];
        for (const i = 0; i < comments.length; i++) {
            const cm = comments[i];
            if (cm.floor !== 0) {
                for (const j = i + 1; j < comments.length; j++) {
                    const otherCm = comments[j];
                    if (cm.refId === otherCm._id) {
                        if (otherCm.child) {
                            otherCm.child.push(cm);
                        } else {
                            otherCm.child = [cm];
                        }
                    }
                }
            } else {
                commentList.push(cm);
            }
        }


        res.status(200).json(commentList);
    }, err => res.status(500).send(err));
};

function getAllByDateToManage(req, res) {
    const requestDate = new Date(req.query.requestDate);
    const requestStatus = [];
    if (req.query.liststatus) {
        if (req.query.liststatus.constructor === Array) {
            req.query.liststatus.forEach(function(_status) {
                if (_status !== 'deleted') {
                    requestStatus.push({ status: _status });
                }
                requestStatus.push({ status: _status });
            }, this);
        } else {
            if (req.query.liststatus !== 'deleted') {
                requestStatus.push({ status: req.query.liststatus });
            }
        }
    }
    Comment.find({
        createAt: { $gte: requestDate },
        $or: requestStatus
    }).sort({ createAt: -1 }).limit(20).exec()
        .then(oComment => {
            res.status(200).send(oComment);
        }, err => res.status(500).send(err));

};

module.exports = {
    create,findById,update,deleteComment,getAllByCommentId,getAllByFeedbackId,getAllByDateToManage
}