const _ = require('lodash');
const {RoadEvent,RoadEventGeodata} = require('../models/roadevent');
const fs = require('fs');
// function setDataFromBody(roadevent) {
//     if (roadevent.featureCollection.features.length > 0) {
//         roadevent.featureCollection.features = roadevent.featureCollection.features.map(data => (data._id) && data || new RoadEventGeodata(data));
//     }
// }

function setDataFromBody(roadevent,bodyRefs) {
    if (bodyRefs) {
        roadevent.featureCollection.features = bodyRefs.map(data => (data._id) && data || new RoadEventGeodata(data));
    }
}

function create(req, res) {
    const roadevent = new RoadEvent(req.body);
    if (roadevent.featureCollection && roadevent.featureCollection.features) {
        setDataFromBody(roadevent);
    }
    roadevent.creator = {
        source: 'TTGT',
        name: req.user['https://hoang0650.com/name']
    };
    roadevent.save().then((re, err) => re && res.status(200).send(re) || res.status(500).send(err));

}

function findAll(req, res) {
    RoadEvent.find({ status: { $ne: 'deleted' } }).sort('createdAt').exec()
        .then((rw, err) => rw && res.status(200).send(rw) || res.status(500).send(err));
}

function findAllPublish(req, res) {
    RoadEvent.find({ publish: true, status: { $ne: 'deleted' } }).sort('createdAt').exec()
        .then((rw, err) => rw && res.status(200).send(rw) || res.status(500).send(err));
}

function update(req, res) {
    const requestRoadevent = new RoadEvent(req.body);
    setDataFromBody(requestRoadevent, req.body.featureCollection.features);
    const re = req.body.re;
    delete requestRoadevent._id;
    _.extend(re, requestRoadevent);
    re.update(re).then((data,err) => (data) && res.status(200).send(data) || res.status(500).send(err));
    
}
function findById(req, res) {
    if (!req.body.re) {
        return res.status(404).end();
    }
    return res.status(200).json(req.body.re);
}
function deleteRoadevent(req, res) {
    const re = req.body.re;
    if (re) {
        re.status = 'deleted';
        re.save((err, p) => (err) && res.status(500).end() || res.status(200).send(p));
    }
}

function exportToCsv(req, res){
    const query = { status: { $ne: 'deleted' } };
    const filename = 'ttgt_phan-luong.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('content-type', 'text/csv');
    RoadEvent.findAndStreamCsv(query).pipe(res);
    // RoadEvent.find(query)
    // .populate('findAndStreamCsv')
    // .exec().then((err,data)=> (err) && res.status(500).end() || res.status(200).json(data));
};

// exports.create = create;
// exports.findAll = findAll;
// exports.update = update;
// exports.findById = findById;
// exports.deleteRoadevent = deleteRoadevent;
// exports.findAllPublish = findAllPublish;
module.exports = {exportToCsv,create,findAll,update,findById,deleteRoadevent,findAllPublish}