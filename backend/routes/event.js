const express = require('express');
const router = express.Router();
const TrafficEventSetting = require('../models/trafficevent');
const {createOnTtgt,updateEvent,approveEvent,rejectEvent,expireEvent, 
findAllApproved,findAllWithoutCondition,findById,getAllByDateToManage,
sortByLocation,getAllType,getByTile,getByBbox,all} = require('../controllers/trafficevent');
const {getByBboxx,getByTilee,alls} = require('../controllers/capevents.js');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

// traffic event
router.get('/traffic/:bbox/geojson', checkRoles(['admin']),
checkPermissions(['trafficevents:read', 'trafficevents:update', 'trafficevents:manage']), 
getByBbox);
router.get('/traffic/:z/:x/:y/geojson', checkRoles(['admin']),
checkPermissions(['trafficevents:read', 'trafficevents:update', 'trafficevents:manage']), 
getByTile);
router.get('/traffic/geojson', checkRoles(['admin']),
checkPermissions(['trafficevents:read', 'trafficevents:update', 'trafficevents:manage']), 
all);

router.get('/getallbydatetomanage', checkRoles(['admin']),
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
getAllByDateToManage);
router.get('/sortbylocation', sortByLocation);
router.get('/getalltype', getAllType);
router.get('/getall', checkRoles(['admin']),
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
findAllWithoutCondition);
router.put('/:id/approve', checkRoles(['admin']),
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
approveEvent);
router.put('/:id/reject', checkRoles(['admin']),
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
rejectEvent);
router.put('/:id/expire', checkRoles(['admin']),
checkPermissions(['trafficevents:update', 'trafficevents:manage']), 
expireEvent);
router.put('/:id/update', checkRoles(['admin']),
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