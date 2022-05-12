const _ = require('lodash');
const Feedback = require('../models/feedback');
const Comment = require('../models/comment');
const utils = require('./util');
const q = require('q');
const jwt = require('jsonwebtoken');

const convertFeedback = function (oFeedback) {
    const defer = q.defer();
    const feedback = JSON.parse(JSON.stringify(oFeedback));
    if (feedback.status !== 'created') {
        _.extend(feedback, feedback.reviewed);
        delete feedback.reviewed;
    } else {
        _.extend(feedback, feedback.draft);
    }
    if (feedback.status === 'done' || feedback.status === 'close') {
        _.extend(feedback, feedback.assignment[feedback.assignment.length - 1]);
        delete feedback.assignment;
    }
    if (feedback.status === 'assigned') {
        _.extend(feedback, feedback.assignment[feedback.assignment.length - 1]);
    }
    delete feedback.tmpAssignment;
    delete feedback.draft;
    _.extend(feedback, feedback.contact);
    delete feedback.contact;
    Comment.count({
        feedbackId: feedback._id,
        $nor: [{ status: 'deleted' }]
    }, (err, count) => {
        if (!err) {
            feedback.numberOfComments = count;
            defer.resolve(feedback);
        } else {
            defer.resolve(feedback);
        }
    });
    return defer.promise;
};

const convertListFeedback = function (oFeedbacks) {
    const defer = q.defer();
    const promises = [];
    oFeedbacks.forEach(function (oFeedback) {
        promises.push(convertFeedback(oFeedback));
        // feedbacks.push(convertFeedback(oFeedback));
    }, this);
    q.all(promises).then((feedbacks) => {
        defer.resolve(feedbacks);
    }, (err) => {
        defer.reject(err);
    });
    return defer.promise;
};

 function create(req, res) {
    const feedback = new Feedback();
    _.extend(feedback, req.body);
    _.extend(feedback.draft, req.body);
    _.extend(feedback.contact, req.body);
    feedback.status = 'created';
    if (req.body.lat && req.body.lng) {
        feedback.loc = {
            type: 'Point',
            coordinates: [Number(req.body.lng), Number(req.body.lat)]
        };
    }
    feedback.images = req.files;
    feedback.createAt = new Date();
    if (!feedback.contact.email && !feedback.contact.phone) {
        res.status(500).send();
    }
    feedback.save().then(fb => {
        convertFeedback(fb).then((feedback) => {
            res.status(200).json(feedback);
        }, (err) => res.status(500).send(err));
    }, err => res.status(500).send(err));
};

 function reviewFeedback(req, res) {
    Feedback.findOne({
        _id: req.body._id
    }).exec().then(originalFeedback => {
        if (originalFeedback.status === 'created') {
            _.extend(originalFeedback.reviewed, req.body);
            originalFeedback.status = 'reviewed';
            originalFeedback.update(originalFeedback).then(fb => {
                convertFeedback(fb).then((feedback) => {
                    res.status(200).json(feedback);
                }, (err) => res.status(500).send(err));
            }, err => res.status(500).send(err));
        } else {
            res.status(500).send('only review feedback just created');
        }
    }, err => res.status(500).send(err));
};

 function assignFeedback(req, res) {
    Feedback.findOne({
        _id: req.body._id
    }).exec().then(originalFeedback => {
        _.extend(originalFeedback.tmpAssignment, req.body);
        originalFeedback.tmpAssignment.asTs = new Date();
        originalFeedback.assignment.push(originalFeedback.tmpAssignment);
        originalFeedback.status = 'assigned';
        originalFeedback.update(originalFeedback).then(fb => {
            convertFeedback(fb).then((feedback) => {
                res.status(200).json(feedback);
            }, (err) => res.status(500).send(err));
        }, err => res.status(500).send(err));
    }, err => res.status(500).send(err));
};

 function doneFeedback(req, res) {
    Feedback.findOne({
        _id: req.body._id
    }).exec().then(originalFeedback => {
        _.extend(originalFeedback.tmpAssignment, req.body);
        originalFeedback.tmpAssignment.asTs = new Date();
        originalFeedback.tmpAssignment.asImages = req.files;
        originalFeedback.assignment.push(originalFeedback.tmpAssignment);
        originalFeedback.status = 'done';
        originalFeedback.update(originalFeedback).then(fb => {
            convertFeedback(fb).then((feedback) => {
                res.status(200).json(feedback);
            }, (err) => res.status(500).send(err));
        }, err => res.status(500).send(err));
    }, err => res.status(500).send(err));

};

 function closeFeedback(req, res) {
    const originalFeedback = req.feedback;
    originalFeedback.status = 'closed';
    originalFeedback.update(originalFeedback).then(fb => {
        convertFeedback(fb).then((feedback) => {
            res.status(200).json(feedback);
        }, (err) => res.status(500).send(err));
    }, err => res.status(500).send(err));
};

 function getAllByDate(req, res) {
    const requestDate = new Date(req.query.requestDate);
    Feedback.find({
        createAt: { $gte: requestDate },
        $or: [{ status: 'reviewed' }, { status: 'assigned' }, { status: 'done' }]
    }).sort({ createAt: -1 }).limit(18).exec()
        .then(fbs => {
            convertListFeedback(fbs).then((feedbacks) => {
                res.status(200).json(feedbacks);
            }, (err) => {
                res.status(500).send(err);
            });
        }, err => res.status(500).send(err));

};

 function getAllByDateToManage(req, res) {
    const requestDate = new Date(req.query.requestDate);
    const requestStatus = [];
    if (req.query.liststatus) {
        if (req.query.liststatus.constructor === Array) {
            req.query.liststatus.forEach(function (_status) {
                if (_status !== 'closed') {
                    requestStatus.push({ status: _status });
                }
            }, this);
        } else {
            if (req.query.liststatus !== 'closed') {
                requestStatus.push({ status: req.query.liststatus });
            }
        }
    }
    Feedback.find({
        createAt: { $gte: requestDate },
        $or: requestStatus
    }).sort({ createAt: -1 }).limit(18).exec()
        .then(fbs => {
            convertListFeedback(fbs).then((feedbacks) => {
                res.status(200).json(feedbacks);
            }, (err) => {
                res.status(500).send(err);
            });
        }, err => res.status(500).send(err));
};

 function findAll(req, res) {
    Feedback.find({
        status: { $ne: 'closed' }
    }).sort({ createAt: -1 }).exec()
        .then(fbs => {
            convertListFeedback(fbs).then((feedbacks) => {
                res.status(200).json(feedbacks);
            }, (err) => {
                res.status(500).send(err);
            });
        }, err => res.status(500).send(err));
};

 function findById(req, res) {
    if (!req.feedback) {
        return res.status(404).end();
    }
    else {
        convertFeedback(req.feedback).then((feedback) => {
            res.status(200).json(feedback);
        }, (err) => res.status(500).send(err));
    }
};

 function displayImage(req, res) {
    res.sendfile(utils.displayFile(req.params.imageName));
};

 function sortByLocationWithDistance(req, res) {
    const sortLocationLng = req.params.lng || req.query.lng || req.body.lng;
    const sortLocationLat = req.params.lat || req.query.lat || req.body.lat;
    const sortLocationDistance = req.params.distance || req.query.distance || req.body.distance;

    if (!sortLocationLng) {
        return res.status(400).end();
    }

    Feedback.find({
        loc:
        {
            $near:
            {
                $geometry:
                {
                    type: 'Point',
                    coordinates: [Number(sortLocationLng), Number(sortLocationLat)]
                },
                $maxDistance: Number.parseInt(sortLocationDistance)
            }
        }
    }).exec().then(prk => res.status(200).send(prk), err => res.status(500).send(err));
};

 function createUserId(req, res) {
    const identifyId = req.body.identifyId;
    if (!identifyId) {
        return res.status(500).end();
    } else {
        const userToken = jwt.sign({ userId: '' + identifyId },
            new Buffer('erymg2LEtnB8A0grwqLJlj-Je3M_9MsGJzFPk-ToNXFQ341e4R1p5cEMk2IKusYD', 'base64'),
            { expiresIn: 1440, audience: 'WX0fySfhhSe9mRR5xAkELIJKnYnLczBQ' }); // 60*5 minutes
        res.status(200).json({ token: userToken });
    }
};

 function getFeedbackByUserId(req, res) {
    const userId = req.user.userId;
    if (!userId) {
        return res.status(500).end();
    } else {
        Feedback.find({
            contact: {
                userId: userId
            }
        }).sort({ createAt: -1 }).exec()
            .then(fbs => {
                convertListFeedback(fbs).then((feedbacks) => {
                    res.status(200).json(feedbacks);
                }, (err) => {
                    res.status(500).send(err);
                });
            }, err => res.status(500).send(err));
    }
};

const getFeedbackByBbox = (bbox) =>{ return Feedback.find({
    loc: {
        $geoWithin: { $box: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] }
    }
}).exec();
} 
const processFeedback = (feedbacks) => {
    const results = feedbacks;
    results = results.map((o) => {
        const geometry = o.loc;
        const properties = o;
        const feature = {
            type: 'Feature',
            properties,
            geometry
        };
        return feature;
    });
    const geoJson = {
        type: 'FeatureCollection',
        features: results
    };
    return geoJson;
};

 function getByTile(req, res){
    const x = req.params.x;
    const y = req.params.y;
    const z = req.params.z;

    if (!x || !y || !z) {
        return res.status(404).end();
    }

    const bbox = utils.getBbox(z, x, y);
    getFeedbackByBbox(bbox).then(feedbacks => res.json(processFeedback(feedbacks)), () => res.status(404).end());

};

 function getByBbox(req, res){
    const bbox = req.params.bbox;
    if (!bbox || bbox.split(',').length !== 4) {
        return res.status(404).end();
    }

    const coords = bbox.split(',');
    coords = coords.map(c => {
        return +c;
    });
    getFeedbackByBbox(coords).then(feedbacks => res.json(processFeedback(feedbacks)), () => res.status(404).end());
};

 function all(req, res) {
    const query = {};
    Feedback.find(query).exec().then(feedbacks => res.json(processFeedback(feedbacks)), () => res.status(404).end());
};

module.exports = {
    convertFeedback,convertListFeedback,create,reviewFeedback,assignFeedback,
    doneFeedback,closeFeedback,getAllByDate,getAllByDateToManage,findAll,findById,
    displayImage,sortByLocationWithDistance,createUserId,getFeedbackByUserId,getFeedbackByBbox,
    processFeedback,getByTile,getByBbox,all
}