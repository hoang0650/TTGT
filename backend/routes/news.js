const express = require('express');
const router = express.Router();

const {findAll} = require('../controllers/news.js');
// const permissionsCtrl = require('../controllers/permissions');

router.get('/', findAll);

module.exports = router;