
var _ = require('lodash');
var FeedbackType = require('../models/feedback.type');

function create(req, res) {
    var fbType = new FeedbackType(req.body);
    fbType.save().then(fbt => res.status(200).send(fbt), err => res.status(500).send(err));
};

function findAll(req, res) {
    FeedbackType.find({}).exec()
        .then(fbts => res.status(200).send(fbts), err => res.status(500).send(err));
};

function findById(req, res) {
    if (!req.fbType) {
        return res.status(404).end();
    }
    else {
        return res.status(200).json(req.fbType);
    }
};

function update(req, res) {
    var requestFeedbackType = new FeedbackType(req.body);
    var fbType = req.fbType;
    delete requestFeedbackType._id;
    _.extend(fbType, requestFeedbackType);
    fbType.update(fbType).then(fbt => { res.status(200).json(fbt);}, err => res.status(500).send(err));
};

module.exports = {
    create,findAll,findById,update
}