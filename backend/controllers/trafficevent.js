const TrafficEvent = require('../models/trafficevent');
const {Setting} = require('../models/setting');
const utils = require('./util');
const config = require('../config/configure');
const geohash = require('ngeohash');
var EventEmitter = require('events'); 

const Stream = new EventEmitter();

const queryEventInTime = function () {
    return {
        $gte: new Date(new Date() - 30 * 60 * 1000) //30 phut
    };
};
const query = function () {
    return {
        status: 'approved',
        createdAt: queryEventInTime()
    };
};

const eventHistory = function (action, actor) {
    return {
        action: action,
        actor: actor,
        timeChange: new Date()
    };
};

const getTrafficEventByBbox = bbox => TrafficEvent.find({
    status: 'approved',
    createdAt: queryEventInTime(),
    loc: {
        $geoWithin: { $box: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] }
    }
}).exec();
const processEvent = (events) => {
    const results = events;
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


function createOnTtgt (req, res) {
    const tevt = new TrafficEvent(req.body);
    if (!config.trafficEventType[tevt.type]) {
        return res.status(500).json({'err':'do something'});
    }
    tevt.createdAt = new Date();
    tevt.creator = {
        source: 'TTGT',
        name: req.user['https://hoang0650.com/name']
    };
    tevt.origins = [{ geohash: geohash.encode(tevt.loc.coordinates[1], tevt.loc.coordinates[0], 7) }];

    const queryFunction = query();
    queryFunction.origins = tevt.origins;
    TrafficEvent.find(queryFunction).exec((err, listTevt) => {
        if (err) {
            return res.status(500).end();
        } else {
            if (listTevt.length > 0) {
                const listReferences = [];
                listTevt.forEach(function (event) {
                    if (event.references && (event.references.length > 0)) {
                        event.references.forEach(function (reference) {
                            listReferences.push(reference);
                        }, this);
                    }
                    listReferences.push(event);
                }, this);
                tevt.references = listReferences;
            }
            if (req.user && req.user.name) {
                tevt.history = [eventHistory('create', req.user.name)];
            } else {
                tevt.history = [eventHistory('create')];
            }
            tevt.status = 'created';
            tevt.save().then(tevt =>{
                Stream.emit('push', 'newEvent', {data:tevt})
                res.status(200).send(tevt)
            } ,
                err => res.status(500).send(err));
        }
    });

};

function updateEvent (req, res) {
    console.log("hello");
    if (req.body._id) {
        delete req.body._id;
    }
    const requestTE = new TrafficEvent(req.body);
    const tevt = req.body.tevt;
    requestTE.origins = tevt.origins;
    if (tevt.status === 'approved' || tevt.status === 'created') {
        tevt.status = 'updated';
        tevt.history.push(eventHistory('update', req.user.name));
        tevt.save().then(() => {
            requestTE.createdAt = new Date();
            requestTE.creator = {
                source: 'TTGT',
                name: req.user['https://hoang0650.com/name']
            };
            requestTE.history = [eventHistory('create', req.user.name)];
            requestTE.status = 'created';
            requestTE.save().then(evt => res.status(200).send(evt),
                () => res.status(500).send('requestTE'));
        }, () => {
            res.status(500).send('tevt');
        });
    } else {
        res.status(500).end();
    }
};

function approveEvent (req, res) {
    const requestTE = new TrafficEvent(req.body);
    const tevt = req.body.tevt;
    if (tevt.status === 'created' || tevt.status === 'updated') {
        delete requestTE._id;
        if (requestTE.loc) {
            tevt.loc = requestTE.loc;
        }
        if (requestTE.desc) {
            tevt.desc = requestTE.desc;
        }
        if (requestTE.type) {
            tevt.type = requestTE.type;
        }
        if (requestTE.snapshot) {
            tevt.snapshot = requestTE.snapshot;
        }
        tevt.status = 'approved';
        tevt.approvedBy = {
            source: 'TTGT',
            name: req.user.name
        };
        tevt.history.push(eventHistory('approve', req.user.name));
        tevt.save().then(result => res.status(200).send(result), err => {
            res.status(500).send(err);
        });
    } else {
        res.status(500).end();
    }
};

function rejectEvent (req, res) {
    const tevt = req.body.tevt;
    if (tevt.status === 'created') {
        tevt.status = 'rejected';
        tevt.history.push(eventHistory('reject', req.user.name));
        tevt.save().then(e => res.status(200).send(e), err => res.status(500).send(err));
    } else {
        res.status(500).end();
    }
};

function expireEvent (req, res) {
    const tevt = req.body.tevt;
    if (tevt.status === 'approved') {
        tevt.status = 'expired';
        tevt.history.push(eventHistory('expire', req.user.name));
        tevt.save().then(e => res.status(200).send(e), err => res.status(500).send(err));
    } else {
        res.status(500).end();
    }
};

function findAllApproved (req, res) {
    TrafficEvent.aggregate(
        [
            {
                $match: query()
            },
            {
                $group: {
                    _id: '$origins',
                    tevtId: { $last: '$_id' }
                }
            }
        ]
    ).exec((err, tevtIds) => {
        const listId = [];
        // for(const i = tevtIds.length - 6; i < tevtIds.length; i++) {
        //     listId.push(tevtIds[i].tevtId);
        // }
        tevtIds.forEach(function (tevtId) {
            listId.push(tevtId.tevtId);
        }, this);
        TrafficEvent.find({
            _id: { $in: listId }
        }).populate('references').lean().exec((err, tevts) => {
            if (err) {
                return res.status(500).end();
            } else {
                tevts.forEach(function (tevt) {
                    if (tevt.references.length > 5) {
                        tevt.references = tevt.references.splice(tevt.references.length - 5, tevt.references.length);
                    }
                }, this);
                res.status(200).json(tevts);
            }
        });
    });
};

function streamEvent (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
    })

    
    Stream.on('push', (event, data) => {
        res.write("data: "+JSON.stringify(data)+"\n\n")
    })
};

function findAllWithoutCondition (req, res) {
    TrafficEvent.aggregate(
        [
            {
                $match: {
                    createdAt: queryEventInTime(),
                    status: { $nin: ['expired', 'updated'] }
                }
            },
            {
                $group: {
                    _id: '$origins',
                    tevtId: { $last: '$_id' }
                }
            }
        ]
    ).exec((err, tevtIds) => {
        const listId = [];
        tevtIds.forEach(function (tevtId) {
            listId.push(tevtId.tevtId);
        }, this);
        TrafficEvent.find({
            _id: { $in: listId }
        }).populate('references').exec((err, tevts) => {
            if (err) {
                return res.status(500).end();
            } else {
                res.status(200).json(tevts);
            }
        });
    });
};

function findById (req, res) {
    if (!req.body.tevt) {
        return res.status(404).end();
    }
    else {
        return res.status(200).json(req.body.tevt);
    }
};

function getAllByDateToManage (req, res) {
    const requestDate = new Date(req.query.requestDate);
    const requestStatus = [];
    if (req.query.liststatus) {
        if (req.query.liststatus.constructor === Array) {
            req.query.liststatus.forEach(function (_status) {
                requestStatus.push({ status: _status });
            }, this);
        } else {
            requestStatus.push({ status: req.query.liststatus });
        }
    }
    TrafficEvent.find({
        createAt: { $gte: requestDate },
        $or: requestStatus
    }).sort({ createdAt: -1 }).limit(18).exec()
        .then(tevts => {
            res.status(200).json(tevts);
        }, (err) => {
            res.status(500).send(err);
        });
};

function sortByLocation(req, res) {
    const sortLocationLng = req.params.lng || req.query.lng || req.body.lng;
    const sortLocationLat = req.params.lat || req.query.lat || req.body.lat;
    const sortLocationDistance = req.params.distance || req.query.distance || req.body.distance;

    if (!sortLocationLng || !sortLocationLat || !sortLocationDistance) {
        return res.status(400).end();
    }

    TrafficEvent.find({
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
        },
        createdAt: queryEventInTime(),
        status: 'approved'
    }).exec().then(tevt => res.status(200).send(tevt), err => res.status(500).send(err));
};

function getAllType (req, res) {


    Setting.find({
        status: 'applied'
    }).sort({ 'createdAt': -1 }).limit(1).exec()
        .then(st => {
            if (st && st.length > 0) {
                const setting = st[0];
                if (setting.trafficEvents && setting.trafficEvents.configVelocity) {
                    Object.keys(config.trafficEventType).forEach(function (eventType) {
                        if (Object.keys(setting.trafficEvents.configVelocity).indexOf(eventType) > -1) {
                            config.trafficEventType[eventType].name = setting.trafficEvents.configVelocity[eventType].name;
                        }
                    }, this);
                }
                return res.status(200).json(config.trafficEventType);
            } else {
                return res.status(200).json(config.trafficEventType);
            }
        }, () => {
            return res.status(200).json(config.trafficEventType);
        });
};

function getByTile (req, res) {
    const x = req.params.x;
    const y = req.params.y;
    const z = req.params.z;

    if (!x || !y || !z) {
        return res.status(404).end();
    }
    const bbox = utils.getBbox(z, x, y);
    getTrafficEventByBbox(bbox).then(tevts => res.json(processEvent(tevts)), () => res.status(404).end());

};

function getByBbox (req, res) {
    const bbox = req.params.bbox;
    if (!bbox || bbox.split(',').length !== 4) {
        return res.status(404).end();
    }
    bbox = bbox.split(',');
    bbox = bbox.map(c => {
        return +c;
    });
    getTrafficEventByBbox(bbox).then(tevts => res.json(processEvent(tevts)), () => res.status(404).end());
};

function all (req, res) {
    TrafficEvent.find(query()).exec().then(tevts => res.json(processEvent(tevts)), () => res.status(404).end());
};

module.exports = {createOnTtgt,updateEvent,approveEvent,rejectEvent,
expireEvent, findAllApproved,findAllWithoutCondition,findById,getAllByDateToManage,
sortByLocation,getAllType,getByTile,getByBbox,all, streamEvent}