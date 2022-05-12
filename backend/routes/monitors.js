const express = require('express');
const router = express.Router();
const {findAll,create,getTemplates,createTemplate,updateTemplate,deleteTemplate,
    getStations,createStation,updateStation,deleteStation,findById,
    update,done,remove,pickLatest} = require('../controllers/monitors.js');
const Monitor = require('../models/monitor');
const MonitorStation = require('../models/monitor.station');
const MonitorTemplate = require('../models/monitor.template');
const {upVersion} = require('../controllers/util.js');
// const permissionsCtrl = require('../controllers/permissions');
router.get('/', findAll);
router.post('/', create);

router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

router.get('/stations', getStations);
router.post('/stations', createStation);
router.put('/stations/:id', updateStation);
router.delete('/stations/:id', deleteStation);

router.get('/:id', findById);

router.put('/:id', function(req, res, next) {
    upVersion(req, res, next, mnt);
});
router.put('/:id', update);

router.put('/:id/done', function(req, res, next) {
    upVersion(req, res, next, mnt);
});
router.put('/:id/done', done);

router.delete('/:id', function(req, res, next) {
    upVersion(req, res, next, mnt);
});
router.delete('/:id', remove);

router.put('/:id/latest', pickLatest);


router.param('id', function(req, res, next) {
    const model = Monitor;
    if (req.path.indexOf('station') >= 0) {
        model = MonitorStation;
    }
    if (req.path.indexOf('template') >= 0) {
        model = MonitorTemplate;
    }
    model.load(req, function(id, object) {
        if (object) {
            req.model = object;
            next();
        } else {
            return res.status(404).end();
        }
    });
});

module.exports = router;