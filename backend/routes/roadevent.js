const express = require('express');
const router = express.Router();
const {RoadEvent} = require('../models/roadevent');
const {exportToCsv,create,update,findAll,findAllPublish,findById,deleteRoadevent}= require('../controllers/roadevent.js');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

router.get('/csv', checkRoles(['admin']),
  checkPermissions(['roadevents:manage']), 
 exportToCsv);
router.post('/', checkRoles(['admin']),
 checkPermissions(['roadevents:update', 'roadevents:manage']), 
create);
router.put('/:id', checkRoles(['admin']),
 checkPermissions(['roadevents:update', 'roadevents:manage']), 
update);
router.get('/', findAll);
router.get('/publish', findAllPublish);
router.get('/:id', findById);
router.delete('/:id', checkRoles(['admin']),
 checkPermissions(['roadevents:manage']), 
deleteRoadevent);

router.param('id', function (req, res, next, id) {
    RoadEvent.load(id, function (id, re) {
        req.body.re = re;
        next();
    });
});

module.exports = router;