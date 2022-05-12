const _ = require('lodash');
const Roadwork = require('../models/roadwork');
const utils = require('./util');

function create (req, res) {
    const roadwork = new Roadwork(req.body);
    roadwork.save().then((rw, err) => (rw) && res.status(200).send(rw) || res.status(500).send(err));
};
function findAll(req, res) {
    Roadwork.find({ documentStatus: { $ne: 'deleted' } }).sort('startAt').exec()
        .then((rw, err) => rw && res.status(200).send(rw) || res.status(500).send(err));
};
function update (req, res) {
    const requestRoadwork = new Roadwork(req.body);
    const rw = req.body.roadwork;
    delete requestRoadwork._id;
    _.extend(rw, requestRoadwork);
    rw.update(rw).then((stt, err) => stt && res.status(200).send(rw) || res.status(500).send(err));
};

function deleteRoadwork(req, res) {
    const rw = req.body.roadwork;
    if (rw) {
        rw.documentStatus = 'deleted';
        rw.save((err, p) => (err) && res.status(500).end() || res.status(200).send(p));
    }
};

function sortByDistrict(req, res) {
    const sortDistrict = req.params.district || req.query.district || req.body.district;

    if (!sortDistrict) {
        return res.status(400).end();
    }

    Roadwork.find({
        dist: { $all: [sortDistrict] },
        documentStatus: { $ne: 'deleted' }
    }).exec().then((rw, err) => rw && res.status(200).send(rw) || res.status(500).send(err));
};

function findById(req, res) {
    if (!req.body.roadwork) {
        return res.status(404).end();
    }
    else {
        return res.status(200).json(req.body.roadwork);
    }
};

function uploadFile(req, res) {
    res.status(200).json(req.files);
};

function displayFile(req, res) {
    res.sendfile(utils.displayFile(req.params.fileName));
};

function deleteFile(req, res) {
    res.send(utils.deleteFile(req.params.fileName));
};

const getRoadworksByBbox = (bbox) =>{
    Roadwork.find({
        loc: {
            $geoWithin: { $box: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] }
        },
        documentStatus: { $ne: 'deleted' }
    }).exec();
} 

const processRoadworks = (roadworks) => {
    const results = roadworks;
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

function getByTile (req, res){
    const x = req.params.x;
    const y = req.params.y;
    const z = req.params.z;

    if (!x || !y || !z) {
        return res.status(404).end();
    }

    const bbox = utils.getBbox(z, x, y);
    getRoadworksByBbox(bbox).then(roadworks => roadworks && res.json(processRoadworks(roadworks)) || res.status(404).end());

};

function getByBbox (req, res){
    const bbox = req.params.bbox;
    if (!bbox || bbox.split(',').length !== 4) {
        return res.status(404).end();
    }

    const coords = bbox.split(',');
    coords = coords.map(c => {
        return +c;
    });
    getRoadworksByBbox(coords).then(roadworks => roadworks && res.json(processRoadworks(roadworks)) || res.status(404).end());
};

function all(req, res) {
    const query = { documentStatus: { $ne: 'deleted' } };
    Roadwork.find(query).exec().then(roadworks => roadworks && res.json(processRoadworks(roadworks)) || res.status(404).end());
};

function exportToCsv(req, res){
    var query = { status: { $ne: 'deleted' } };
    var filename = 'ttgt_cong-trinh-thi-cong.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('content-type', 'text/csv');

    Roadwork.findAndStreamCsv(query).pipe(res);
};

module.exports = {
    create,findAll,update,deleteRoadwork,sortByDistrict,findById,
    uploadFile,displayFile,deleteFile,processRoadworks,getByTile,
    getByBbox,all,exportToCsv
}
