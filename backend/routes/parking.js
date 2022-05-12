const express = require('express');
const router = express.Router();
const Parking = require('../models/parking');
const {uploadImage} = require('../controllers/util.js');

const {getByBbox, getByTile, all, create,uploadImages,
    loaddistrict,loadDistrictName,sortByRegion,sortByDistrict,
    sortByLocationWithDistance,displayImage,findAll,findById,deleteImage,
    exportToCsv,update,deleteParking} = require('../controllers/parking.js');
const {checkPermissions} = require('../controllers/permissions');

router.get('/:bbox/geojson', getByBbox);
router.get('/:z/:x/:y/geojson', getByTile);
router.get('/geojson', all);

router.post('/', 
checkPermissions(['parkings:update', 'parkings:manage']), 
create);
router.post('/upload/', 
checkPermissions(['parkings:update', 'parkings:manage']), 
uploadImage.array('images', 18), uploadImages);
router.get('/hcmdistrict/', loaddistrict);
router.get('/loaddistrictname/', loadDistrictName);
router.get('/sortbyregion', sortByRegion);
router.get('/sortbydistrict', sortByDistrict);
router.get('/sortbylocationdistance', sortByLocationWithDistance);
router.get('/upload/:imageName', displayImage);
router.get('/', findAll);
router.delete('/upload/:imageName', 
checkPermissions(['parkings:manage']), 
deleteImage);
router.get('/csv', 
checkPermissions(['parkings:manage']), 
exportToCsv);
router.put('/:id', 
checkPermissions(['parkings:update', 'parkings:manage']), 
update);
router.delete('/:id', 
checkPermissions(['parkings:manage']), 
deleteParking);
router.get('/:id', findById);


router.param('id', function (req, res, next, id) {
    Parking.load(id, function (id, prk) {
        req.body.parking = prk;
        next();
    });
});

module.exports = router;