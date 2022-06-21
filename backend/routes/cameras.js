const express = require('express');
const router = express.Router();
const {Camera} = require('../models/camera');

const {exportCameraData,getByBbox,getByTile,all,getDefaultCamera,
    getCameraType,getCameraConfig,exportToCsv,
    create,deleteCamera,update,findAll,findById,
    sortByLocation,findOneByCamId} = require('../controllers/cameras');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

router.get('/:bbox/geojson', getByBbox);
router.get('/:z/:x/:y/geojson', getByTile);
router.get('/geojson', all);

router.get('/getdefaultcamera', checkRoles(['admin']),
checkPermissions(['cameras:update', 'cameras:manage']), 
getDefaultCamera);
// router.get('/exportcamera', checkPermissions(['cameras:update', 'cameras:manage']), exportCameraData);
router.get('/getcameratype', checkRoles(['admin']),
checkPermissions(['cameras:update', 'cameras:manage']),
getCameraType);
router.get('/getcameraconfig', checkRoles(['admin']),
checkPermissions(['cameras:update', 'cameras:manage']), 
getCameraConfig);
router.get('/csv', checkRoles(['admin']),
checkPermissions(['cameras:manage']), 
exportToCsv);

router.get('/xls', checkRoles(['admin']),
checkPermissions(['cameras:manage']), 
exportCameraData);

router.post('/', checkRoles(['admin']),
checkPermissions(['cameras:update', 'cameras:manage']), 
create);
router.delete('/:id', checkRoles(['admin']),
checkPermissions('cameras:manage'), 
deleteCamera);
router.put('/:id', checkRoles(['admin']),
checkPermissions(['cameras:update', 'cameras:manage']), 
update);
router.get('/:id', findById);
router.get('/', findAll);
router.get('/sortbylocation', sortByLocation);
router.get('/camid/:camId', checkRoles(['admin']),
checkPermissions(['cameras:read', 'cameras:update', 'cameras:manage']), 
findOneByCamId);



router.param('id', function (req, res, next, id) {
    Camera.load(id, function (id, cam) {
        req.body.cam = cam;
        next();
    });
});

module.exports = router;