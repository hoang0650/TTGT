const CapEvent = require('../models/capevent');
const _ = require('lodash');
const utils = require('./util');

const expireTime = 10;

//Get by ZXY
//const eventExpireTime = 30; //minutes

const getEventsByBbox = bbox => CapEvent.find({
    center: {
        $geoWithin: { $box: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] }
    },
    sent: {
        $gt: new Date(Date.now() - 1000 * 60 * expireTime)
    },
    'cap.alertInfo.severity': { $ne: 'Moderate' }
}).sort({ sent: -1 }).populate('references').exec();

const processEvents = (events) => {
    const results = events;
    results = _.groupBy(results, 'linkId');
    results = _.mapValues(results, (o) => {
        const event = o[0];
        const geometry = event.center;
        const info = event.cap.alertInfo;

        const properties = info;
        properties.sent = event.sent;

        properties.histories = event.references.map(r=> {
            const info = r.cap.alertInfo;
            return {
                severity: info.severity,
                areaDesc: info.areaDesc,
                velocity: info.parameter.velocity || 0,
                count: info.parameter.count || 0,
                sent: r.sent
            };
        });

        const feature = {
            type: 'Feature',
            properties,
            geometry
        };
        return feature;
    });
    results = _.values(results);
    const geoJson = {
        type: 'FeatureCollection',
        features: results
    };
    return geoJson;
};

function getByTilee(req, res) {
    const x = req.params.x;
    const y = req.params.y;
    const z = req.params.z;

    if (!x || !y || !z) {
        return res.status(404).end();
    }

    const bbox = utils.getBbox(z, x, y);
    
    console.log(bbox);
    getEventsByBbox(bbox).then(events => res.json(processEvents(events)), () => res.status(404).end());

};

function getByBboxx(req, res) {
    const bbox = req.params.bbox;
    if (!bbox || bbox.split(',').length !== 4) {
        return res.status(404).end();
    }

    const coords = bbox.split(',');
    coords = coords.map(c => {
        return +c;
    });
    getEventsByBbox(coords).then(events => res.json(processEvents(events)), () => res.status(404).end());
};


function alls(req, res) {
    const query = {
        sent: { $gt: new Date(Date.now() - 1000 * 60 * expireTime) }
    };

    const sort = { sent: -1 };
    CapEvent.find(query).sort(sort).populate('references').exec().then(events => res.json(processEvents(events)), () => res.status(404).end());
};

module.exports = {getByTilee,getByBboxx,alls}