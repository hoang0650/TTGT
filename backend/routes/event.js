const express = require('express');
const router = express.Router();
const TrafficEventSetting = require('../models/trafficevent');
const {createOnTtgt,updateEvent,approveEvent,rejectEvent,expireEvent, 
findAllApproved,findAllWithoutCondition,findById,getAllByDateToManage,
sortByLocation,getAllType,getByTile,getByBbox,all,streamEvent} = require('../controllers/trafficevent');
const {getByBboxx,getByTilee,alls} = require('../controllers/capevents.js');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

// traffic event
router.get('/stream', streamEvent)
router.get('/traffic/:bbox/geojson', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:read']), 
getByBbox);
router.get('/traffic/:z/:x/:y/geojson', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:read']), 
getByTile);
router.get('/traffic/geojson', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:read']), 
all);
router.get('/getallbydatetomanage', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:read']), 
getAllByDateToManage);
router.get('/sortbylocation', sortByLocation);
router.get('/getalltype', getAllType);
router.get('/getall', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:read']), 
findAllWithoutCondition);
router.put('/:id/approve', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:update']), 
approveEvent);
router.put('/:id/reject', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:update']), 
rejectEvent);
router.put('/:id/expire', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:update']), 
expireEvent);
router.put('/:id/update', checkRoles(['user', 'admin']),
checkPermissions(['trafficevents:update']), 
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