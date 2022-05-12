const express = require('express');
const router = express.Router();
const {eventsHeatmap,eventsMonthly,eventsWeekly,csv} = require('../controllers/stats.js');
// const permissionsCtrl = require('../controllers/permissions');

// router.get('/heatmap', permissionsCtrl.checkPermissions(['stats:manage']), Roadwork.exportToCsv);
router.get('/heatmap', eventsHeatmap);
router.get('/events/weekly', eventsWeekly);
router.get('/events/monthly', eventsMonthly);
router.get('/events/csv', csv);

module.exports = router;