const express = require('express');
const router = express.Router();
const {Setting} = require('../models/setting');
const {
  getSession,
  create,
  findAll,
  findById,
  getMapUrl,
  getLastSetting,
  cancelSession,
  getFrontendSetting,
  getFirstFrontendSetting,
  getFirstSetting,
  getImageError
} = require('../controllers/setting.js');

const {checkRoles,checkPermissions} = require('../controllers/permissions');

router.post('/', 
// checkPermissions(["settings:update"]),
create);
router.get('/getsession', checkRoles(['admin']),
checkPermissions(["settings:update"]),
getSession);
router.post('/cancelsession', checkRoles(['admin']),
checkPermissions(["settings:update"]), 
cancelSession);
router.get('/getlastsetting', checkRoles(['admin']),
checkPermissions(["settings:update"]), 
getLastSetting);
router.get('/getfirstsetting', checkRoles(['admin']),
checkPermissions(["settings:update"]), 
getFirstSetting);
router.get('/getfrontendsetting', getFrontendSetting);
router.get('/getfirstfrontendsetting', getFirstFrontendSetting);
router.get('/getimageerror', getImageError);
router.get('/getmapurl', getMapUrl);
// app.get('/api/setting/getimageerror', getImageError);
router.get('/', checkRoles(['admin']),
checkPermissions(["settings:update"]), 
findAll);
router.get('/:id', checkRoles(['admin']),
checkPermissions(["settings:update"]), 
findById);

router.param('id', function (req, res, next, id) {
    Setting.load(id, function (id, setting) {
        
        req.body.setting = setting;
        next();
    });
});

module.exports = router;
