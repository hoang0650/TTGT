const express = require('express');
const router = express.Router();
const {eventsHeatmap,eventsMonthly,eventsWeekly,csv} = require('../controllers/stats.js');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

// router.get('/heatmap', permissionsCtrl.checkPermissions(['stats:manage']), Roadwork.exportToCsv);
router.get('/heatmap', eventsHeatmap);
router.get('/events/weekly', eventsWeekly);
router.get('/events/monthly', eventsMonthly);
router.get('/events/csv',checkRoles(['admin']), checkPermissions(['stats:manage']), csv);

module.exports = router;