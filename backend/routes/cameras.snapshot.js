const express = require('express');
const router = express.Router();
const {Camera} = require('../models/camera');

const {getResponseTime,getSnapShot,getSnapShotObject,previewCamera} = require('../controllers/cammeras.snapshots');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

router.get('/responsetime', getResponseTime);
router.get('/:id', getSnapShot);
router.get('/:id/json', getSnapShotObject);
router.post('/getcamerapreview', checkRoles(['admin']),
checkPermissions(['cameras:update', 'cameras:manage']), 
previewCamera);


router.param('id', function (req, res, next, id) {
    Camera.load(id, function (id, cam) {
        req.body.cam = cam;
        next();
    });
});

module.exports = router;