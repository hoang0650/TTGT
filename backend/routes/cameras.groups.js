const express = require('express');
const router = express.Router();
const CameraGroup = require('../models/camera.group');
const {create,update,findAll,findById,deleteCamGroup} = require('../controllers/cameras.groups.js');
const {checkPermissions} = require('../controllers/permissions');

router.post('/', 
checkPermissions(['cameras:update', 'cameras:manage']), 
create);
router.post('/:id',
checkPermissions(['cameras:update', 'cameras:manage']), 
update);
router.get('/', findAll);
router.get('/:id', 
checkPermissions(['cameras:read', 'cameras:update', 'cameras:manage']),
findById);
router.delete('/:id', 
checkPermissions('cameras:manage'), 
deleteCamGroup);



router.param('id', function (req, res, next, id) {
    CameraGroup.load(id, function (id, cg) {
        req.camG = cg;
        next();
    });
});

module.exports = router;