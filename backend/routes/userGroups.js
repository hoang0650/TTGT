const express = require('express');
const router = express.Router();
const {all,create,update,remove,getUserPermissions} = require('../controllers/userGroups.js');
// const permissionsCtrl = require('../controllers/permissions');
const UserGroup = require('../models/userGroup');

router.get('/', all);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id/delete', remove);
router.get('/permissions',getUserPermissions);

router.param('id', function (req, res, next, id) {
    UserGroup.load(id, function (id, group) {
        req.group = group;
        next();
    });
});

module.exports = router;