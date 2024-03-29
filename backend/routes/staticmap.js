const express = require('express');
const router = express.Router();
const StaticMap = require('../models/staticmap');
const {create,findAllPublish,getIcons,exportToCsv,findById,findAll,update,deleteStaticmap} = require('../controllers/staticmap.js');
const utils = require('../controllers/util.js');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

router.post('/', checkRoles(['user', 'admin']),
checkPermissions(['staticmaps:manage']), 
create);
router.get('/publish', findAllPublish);
router.get('/icons', getIcons);
router.get('/csv', checkRoles(['user', 'admin']),
checkPermissions(['staticmaps:manage']), 
exportToCsv);
router.get('/:id', findById);
router.get('/', findAll);
router.put('/:id', checkRoles(['user', 'admin']),
checkPermissions(['staticmaps:update']), 
function(req, res, next) {
    utils.upVersion(req, res, next, StaticMap);
});
router.put('/:id', checkRoles(['user', 'admin']),
checkPermissions(['staticmaps:update']), 
update);
router.delete('/:id', checkRoles(['user', 'admin']),
checkPermissions(['staticmaps:manage']), 
deleteStaticmap);


router.param('id', function(req, res, next, id) {
    StaticMap.load(id, function(id, staticmap) {
        if (staticmap) {
            req.model = staticmap;
            next();
        } else {
            return res.status(404).end();
        }
    });
});

module.exports = router;