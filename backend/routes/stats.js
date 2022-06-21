const express = require('express');
const router = express.Router();
const {eventsHeatmap,eventsMonthly,eventsWeekly,csv} = require('../controllers/stats.js');
const {checkRoles,checkPermissions} = require('../controllers/permissions');

// router.get('/heatmap', permissionsCtrl.checkPermissions(['stats:manage']), Roadwork.exportToCsv);
router.get('/heatmap',checkRoles(['user','admin']), checkPermissions(['trafficevents:read']), eventsHeatmap);
router.get('/events/weekly',checkRoles(['user','admin']), checkPermissions(['trafficevents:read']), eventsWeekly);
router.get('/events/monthly',checkRoles(['user','admin']), checkPermissions(['trafficevents:read']), eventsMonthly);
router.get('/events/csv',checkRoles(['user','admin']), checkPermissions(['trafficevents:read']), csv);

module.exports = router;