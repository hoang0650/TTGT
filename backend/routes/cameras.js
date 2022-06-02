const express = require('express');
const router = express.Router();
const {Camera} = require('../models/camera');

const {exportCameraData,getByBbox,getByTile,all,getDefaultCamera,
    getCameraType,getCameraConfig,exportToCsv,
    create,deleteCamera,update,findAll,findById,
    sortByLocation,findOneByCamId} = require('../controllers/cameras');
const {checkPermissions} = require('../controllers/permissions');

router.get('/:bbox/geojson', getByBbox);
router.get('/:z/:x/:y/geojson', getByTile);
router.get('/geojson', all);

router.get('/getdefaultcamera', 
checkPermissions(['cameras:update', 'cameras:manage']), 
getDefaultCamera);
// router.get('/exportcamera', checkPermissions(['cameras:update', 'cameras:manage']), exportCameraData);
router.get('/getcameratype', 
checkPermissions(['cameras:update', 'cameras:manage']),
getCameraType);
router.get('/getcameraconfig', 
checkPermissions(['cameras:update', 'cameras:manage']), 
getCameraConfig);
router.get('/csv', 
checkPermissions(['cameras:manage']), 
exportToCsv);

router.get('/xls',
checkPermissions(['cameras:manage']), 
exportCameraData);

router.post('/', 
checkPermissions(['cameras:update', 'cameras:manage']), 
create);
router.delete('/:id', 
checkPermissions('cameras:manage'), 
deleteCamera);
router.put('/:id', 
checkPermissions(['cameras:update', 'cameras:manage']), 
update);
router.get('/:id', findById);
router.get('/', findAll);
router.get('/sortbylocation', sortByLocation);
router.get('/camid/:camId', 
checkPermissions(['cameras:read', 'cameras:update', 'cameras:manage']), 
findOneByCamId);



router.param('id', function (req, res, next, id) {
    Camera.load(id, function (id, cam) {
        req.body.cam = cam;
        next();
    });
});

module.exports = router;