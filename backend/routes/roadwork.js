const express = require('express');
const router = express.Router();
const Roadwork = require('../models/roadwork');
const {uploadImage} = require('../controllers/util.js');
const {exportToCsv,create,update,findAll,uploadFile,
    displayFile,deleteRoadwork,deleteFile,findById,
    sortByDistrict,getByBbox,getByTile,all} = require('../controllers/roadwork');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

router.get('/geojson', all);
router.get('/csv', checkRoles(['user', 'admin']),
checkPermissions(['roadworks:manage']), 
exportToCsv);

router.post('/', checkRoles(['user', 'admin']),
checkPermissions(['roadworks:manage']), 
create);
router.put('/:id', checkRoles(['user', 'admin']),
checkPermissions(['roadworks:update']), 
update);
router.get('/', findAll);
router.post('/upload/', checkRoles(['user', 'admin']),
checkPermissions(['roadworks:update', 'roadworks:manage']), 
uploadImage.array('documents', 18), uploadFile);
router.get('/upload/:fileName', displayFile);
router.delete('/:id', checkRoles(['user', 'admin']),
checkPermissions(['roadworks:manage']), 
deleteRoadwork);
router.delete('/upload/:fileName', checkRoles(['user', 'admin']),
checkPermissions(['roadworks:manage']), 
deleteFile);
router.get('/:id', findById);
router.get('/sortbydistrict', sortByDistrict);

router.get('/:bbox/geojson', getByBbox);
router.get('/:z/:x/:y/geojson', getByTile);

router.param('id', function (req, res, next, id) {
    Roadwork.load(id, function (id, rw) {
        req.body.roadwork = rw;
        next();
    });
});

module.exports = router;