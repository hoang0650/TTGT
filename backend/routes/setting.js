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

const {checkPermissions} = require('../controllers/permissions');

router.post('/', 
// checkPermissions(["settings:update", "settings:manage"]),
create);
router.get('/getsession',
checkPermissions(["settings:update", "settings:manage"]),
getSession);
router.post('/cancelsession', 
checkPermissions(["settings:update", "settings:manage"]), 
cancelSession);
router.get('/getlastsetting',
checkPermissions(["settings:update", "settings:manage"]), 
getLastSetting);
router.get('/getfirstsetting', 
checkPermissions(["settings:update", "settings:manage"]), 
getFirstSetting);
router.get('/getfrontendsetting', getFrontendSetting);
router.get('/getfirstfrontendsetting', getFirstFrontendSetting);
router.get('/getimageerror', getImageError);
router.get('/getmapurl', getMapUrl);
// app.get('/api/setting/getimageerror', getImageError);
router.get('/', 
checkPermissions(["settings:manage"]), 
findAll);
router.get('/:id', 
checkPermissions(["settings:update", "settings:manage"]), 
findById);

router.param('id', function (req, res, next, id) {
    Setting.load(id, function (id, setting) {
        
        req.body.setting = setting;
        next();
    });
});

module.exports = router;
