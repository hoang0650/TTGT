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

router.get('/getdefaultcamera', checkRoles(['user', 'admin']),
checkPermissions(['cameras:update']), 
getDefaultCamera);
// router.get('/exportcamera', checkPermissions(['cameras:update', 'cameras:manage']), exportCameraData);
router.get('/getcameratype', checkRoles(['user', 'admin']),
checkPermissions(['cameras:update']),
getCameraType);
router.get('/getcameraconfig', checkRoles(['user', 'admin']),
checkPermissions(['cameras:update']), 
getCameraConfig);
router.get('/csv', checkRoles(['user', 'admin']),
checkPermissions(['cameras:manage']), 
exportToCsv);

router.get('/xls', checkRoles(['user', 'admin']),
checkPermissions(['cameras:manage']), 
exportCameraData);

router.post('/', checkRoles(['user', 'admin']),
checkPermissions(['cameras:manage']), 
create);
router.delete('/:id', checkRoles(['user', 'admin']),
checkPermissions('cameras:manage'), 
deleteCamera);
router.put('/:id', checkRoles(['user', 'admin']),
checkPermissions(['cameras:update']), 
update);
router.get('/:id', findById);
router.get('/', findAll);
router.get('/sortbylocation', sortByLocation);
router.get('/camid/:camId', checkRoles(['user', 'admin']),
checkPermissions(['cameras:read']), 
findOneByCamId);



router.param('id', function (req, res, next, id) {
    Camera.load(id, function (id, cam) {
        req.body.cam = cam;
        next();
    });
});

module.exports = router;