const _ = require('lodash');
const Parking = require('../models/parking');
// const multer = require('multer');
const fs = require('fs');
// const listDate = [];
// const counter = 0;
const utils = require('./util');
// const path = require('path');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './uploads/');
//     },
//     filename: function (req, file, cb) {
//         const datetimestamp = Date.now();
//         listDate[counter] = datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];
//         counter++;
//         cb(null, datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
//     }
// });

// const upload = multer({ //multer settings
//     storage: storage
// }).array('file', 18);

function create (req, res) {
    const parking = new Parking(req.body);
    parking.save().then((park) => (park) && res.status(200).send(park) || res.status(500).end());
};

function findAll (req, res) {
    Parking.find({ status: { $ne: 'deleted' } }).exec()
        .then(park => (park) && res.status(200).send(park) || res.status(500).end());
};

function findById (req, res) {
    if (!req.body.parking) {
        return res.status(404).end();
    }
    else {
        return res.status(200).json(req.body.parking);
    }
};

function update (req, res) {
    const requestParking = new Parking(req.body);
    const prk = req.body.parking;
    delete requestParking._id;
    _.extend(prk, requestParking);
    prk.update(prk).then(park => (park) && res.status(200).send(park) || res.status(500).end());
};

function deleteParking (req, res) {
    const prk = req.body.parking;
    if (prk) {
        prk.status = 'deleted';
        prk.save((err, p) => (err) && res.status(500).end() || res.status(200).send(p));
    }
};

function uploadImages (req, res) {
    res.status(200).json(req.files);
};

function loaddistrict (req, res) {
    const content = fs.readFileSync('./data/hcmdistrict.json');
    const jsonContent = JSON.parse(content);
    res.status(200).json(jsonContent);
};

function displayImage (req, res) {
    res.sendfile(utils.displayFile(req.params.imageName));
};

function deleteImage (req, res) {
    res.send(utils.deleteFile(req.params.imageName));
};

function sortByRegion (req, res) {
    const sortRegion = req.params.region || req.query.region || req.body.region;
    if (!sortRegion) {
        return res.status(400).end();
    }
    Parking.find({
        region: { $all: [sortRegion] },
        status: { $ne: 'deleted' }
    }).exec().then(prk => (prk) && res.status(200).send(prk) || res.status(500).end());
};

function sortByDistrict(req, res) {
    const sortDistrict = req.params.district || req.query.district || req.body.district;
    if (!sortDistrict) {
        return res.status(400).end();
    }

    Parking.find({
        dist: { $all: [sortDistrict] },
        status: { $ne: 'deleted' }
    }).exec().then(prk => (prk) && res.status(200).send(prk) || res.status(500).end());
};

function sortByLocationWithDistance(req, res) {
    const sortLocationLng = req.params.lng || req.query.lng || req.body.lng;
    const sortLocationLat = req.params.lat || req.query.lat || req.body.lat;
    const sortLocationDistance = req.params.distance || req.query.distance || req.body.distance;

    if (!sortLocationLng || !sortLocationLat) {
        return res.status(400).end();
    }

    Parking.find({
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
        status: { $ne: 'deleted' }
    }).exec().then((prk, err) => prk && res.status(200).send(prk) || res.status(500).send(err));
};

function loadDistrictName (req, res) {
    Parking.aggregate([
        {
            $group: {
                _id: '$dist',
                amount: { $sum: 1 }
            }
        }
    ], function (err, result) {
        err && res.status(500).send(err) || res.status(200).send(result);
    });
};

const getParkingsByBbox = bbox => Parking.find({
    loc: {
        $geoWithin: { $box: [[bbox[0], bbox[1]], [bbox[2], bbox[3]]] }
    },
    status: { $ne: 'deleted' }
}).exec();

const processParkings = (parkings) => {
    const results = parkings;
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

function getByTile (req, res) {
    const x = req.params.x;
    const y = req.params.y;
    const z = req.params.z;

    if (!x || !y || !z) {
        return res.status(404).end();
    }

    const bbox = utils.getBbox(z, x, y);
    getParkingsByBbox(bbox).then(parkings => parkings && res.json(processParkings(parkings)) || res.status(404).end());

};

function getByBbox (req, res) {
    const bbox = req.params.bbox;
    if (!bbox || bbox.split(',').length !== 4) {
        return res.status(404).end();
    }

    const coords = bbox.split(',');
    coords = coords.map(c => {
        return +c;
    });
    getParkingsByBbox(coords).then(parkings => parkings && res.json(processParkings(parkings)) || res.status(404).end());
};

function all (req, res) {
    const query = { status: { $ne: 'deleted' } };
    Parking.find(query).exec().then(parkings => parkings && res.json(processParkings(parkings)) || res.status(404).end());
};

function exportToCsv (req, res) {
    const query = { status: { $ne: 'deleted' } };
    const filename = 'ttgt_bai-do-xe.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('content-type', 'text/csv');
    Parking.findAndStreamCsv(query).pipe(res);
    Parking.find(query)
    .populate('findAndStreamCsv')
    .exec()
    .then((err,data)=> err && res.status(500).send(err) || res.status(200).send(data));
};

module.exports = {
    getByBbox, getByTile, all, create,uploadImages,
    loaddistrict,loadDistrictName,sortByRegion,sortByDistrict,
    sortByLocationWithDistance,displayImage,findAll,findById,deleteImage,
    exportToCsv,update,deleteParking
}
