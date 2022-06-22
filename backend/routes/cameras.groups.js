const express = require('express');
const router = express.Router();
const CameraGroup = require('../models/camera.group');
const {create,update,findAll,findById,deleteCamGroup} = require('../controllers/cameras.groups.js');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

router.post('/', checkRoles(['user','admin']),
checkPermissions(['cameras:manage']), 
create);
router.put('/:id', checkRoles(['user','admin']),
checkPermissions(['cameras:update']), 
update);
router.get('/', findAll);
router.get('/:id', checkRoles(['user','admin']),
checkPermissions(['cameras:update']),
findById);
router.delete('/:id', checkRoles(['user','admin']),
checkPermissions(['cameras:manage']), 
deleteCamGroup);



router.param('id', function (req, res, next, id) {
    CameraGroup.load(id, function (id, cg) {
        req.camG = cg;
        next();
    });
});

module.exports = router;