const express = require('express');
const router = express.Router();
const TrafficEventSetting = require('../models/trafficevent');
const {createOnTtgt,updateEvent,approveEvent,rejectEvent,expireEvent, 
findAllApproved,findAllWithoutCondition,findById,getAllByDateToManage,
sortByLocation,getAllType,getByTile,getByBbox,all} = require('../controllers/trafficevent');
const {getByBboxx,getByTilee,alls} = require('../controllers/capevents.js');
const {checkPermissions} = require('../controllers/permissions');

// traffic event
router.get('/traffic/:bbox/geojson', 
checkPermissions(['trafficevents:read', 'trafficevents:update', 'trafficevents:manage']), 
getByBbox);
router.get('/traffic/:z/:x/:y/geojson', 
checkPermissions(['trafficevents:read', 'trafficevents:update', 'trafficevents:manage']), 
getByTile);
router.get('/traffic/geojson', 
checkPermissions(['trafficevents:read', 'trafficevents:update', 'trafficevents:manage']), 
all);

router.get('/getallbydatetomanage', 
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
getAllByDateToManage);
router.get('/sortbylocation', sortByLocation);
router.get('/getalltype', getAllType);
router.get('/getall', 
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
findAllWithoutCondition);
router.put('/:id/approve', 
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
approveEvent);
router.put('/:id/reject', 
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
rejectEvent);
router.put('/:id/expire', 
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
expireEvent);
router.put('/:id/update', 
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
updateEvent);
router.post('/', createOnTtgt); //api create by thongtingiaothong
router.get('/', findAllApproved);
router.get('/:id', findById);

// capevent
router.get('/:bbox/geojson', getByBboxx);
router.get('/:z/:x/:y/geojson', getByTilee);
router.get('/geojson', alls);

router.param('id', function (req, res, next, id) {
    TrafficEventSetting.load(id, function (id, tevt) {
        req.body.tevt = tevt;
        next();
    });
});

module.exports = router;