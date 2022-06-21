const express = require('express');
const router = express.Router();
const CameraGroup = require('../models/camera.group');
const {create,update,findAll,findById,deleteCamGroup} = require('../controllers/cameras.groups.js');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

router.post('/', checkRoles(['admin']),
checkPermissions(['cameras:update', 'cameras:manage']), 
create);
router.post('/:id', checkRoles(['admin']),
checkPermissions(['cameras:update', 'cameras:manage']), 
update);
router.get('/', findAll);
router.get('/:id', checkRoles(['admin']),
checkPermissions(['cameras:read', 'cameras:update', 'cameras:manage']),
findById);
router.delete('/:id', checkRoles(['admin']),
checkPermissions('cameras:manage'), 
deleteCamGroup);



router.param('id', function (req, res, next, id) {
    CameraGroup.load(id, function (id, cg) {
        req.camG = cg;
        next();
    });
});

module.exports = router;